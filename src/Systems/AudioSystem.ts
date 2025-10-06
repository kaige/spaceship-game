export class AudioSystem {
    private static instance: AudioSystem;
    private audioContext: AudioContext;
    private backgroundMusic: AudioBuffer | null = null;
    private musicSource: AudioBufferSourceNode | null = null;
    private musicGainNode: GainNode;
    private isMusicPlaying = false;
    private musicVolume = 0.3; // Default volume for background music

    private constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.connect(this.audioContext.destination);
        this.musicGainNode.gain.value = this.musicVolume;
    }

    public static getInstance(): AudioSystem {
        if (!AudioSystem.instance) {
            AudioSystem.instance = new AudioSystem();
        }
        return AudioSystem.instance;
    }

    public async loadBackgroundMusic(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            // Check if the buffer is empty
            if (arrayBuffer.byteLength === 0) {
                throw new Error('Empty audio buffer');
            }

            // Add more detailed error handling for audio decoding
            try {
                this.backgroundMusic = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
                console.log('🎵 Background music loaded successfully!');
            } catch (decodeError) {
                console.error('❌ Audio decode error:', decodeError);
                console.log('📝 Trying to resume audio context (user interaction required)');

                // Try to resume audio context (might be suspended by browser)
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                    // Try decoding again after resume
                    this.backgroundMusic = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
                    console.log('🎵 Background music loaded successfully after context resume!');
                } else {
                    throw decodeError;
                }
            }
        } catch (error) {
            console.error('❌ Failed to load background music:', error);
            console.log('💡 Make sure your audio file is a valid MP3, OGG, or WAV file');
            console.log('💡 File size should be reasonable (< 10MB recommended)');
            console.log('💡 Try converting your audio file to a different format');
        }
    }

    public playBackgroundMusic(loop: boolean = true): void {
        if (!this.backgroundMusic) {
            console.warn('⚠️ No background music loaded');
            return;
        }

        if (this.isMusicPlaying) {
            console.log('🎵 Background music is already playing');
            return;
        }

        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.backgroundMusic;
        this.musicSource.loop = loop;
        this.musicSource.connect(this.musicGainNode);
        this.musicSource.start(0);
        this.isMusicPlaying = true;

        this.musicSource.onended = () => {
            if (!loop) {
                this.isMusicPlaying = false;
            }
        };

        console.log('🎵 Started playing background music');
    }

    public stopBackgroundMusic(): void {
        if (this.musicSource && this.isMusicPlaying) {
            this.musicSource.stop();
            this.musicSource = null;
            this.isMusicPlaying = false;
            console.log('🔇 Background music stopped');
        }
    }

    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        this.musicGainNode.gain.value = this.musicVolume;
    }

    public toggleMusic(): void {
        if (this.isMusicPlaying) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }

    public async playShootSound(): Promise<void> {
        // Generate a simple shoot sound using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    public async playExplosionSound(): Promise<void> {
        // Generate a realistic grenade/artillery explosion sound
        const time = this.audioContext.currentTime;

        // 1. Initial sharp crack - the "pop" of the explosion
        const crackBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
        const crackData = crackBuffer.getChannelData(0);

        for (let i = 0; i < crackData.length; i++) {
            const t = i / crackData.length;
            const noise = (Math.random() - 0.5) * 2;
            const envelope = Math.exp(-t * 80); // Very sharp, quick decay
            crackData[i] = noise * envelope * 1.2; // Loud initial crack
        }

        const crackSource = this.audioContext.createBufferSource();
        const crackGain = this.audioContext.createGain();
        const crackFilter = this.audioContext.createBiquadFilter();

        crackSource.buffer = crackBuffer;
        crackSource.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(this.audioContext.destination);

        crackFilter.type = 'highpass';
        crackFilter.frequency.setValueAtTime(1000, time);

        // Sharp attack with immediate decay
        crackGain.gain.setValueAtTime(0, time);
        crackGain.gain.linearRampToValueAtTime(1.0, time + 0.001); // 1ms attack
        crackGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        // 2. Main explosion boom - low frequency冲击波
        const boomOsc1 = this.audioContext.createOscillator();
        const boomOsc2 = this.audioContext.createOscillator();
        const boomGain = this.audioContext.createGain();
        const boomFilter = this.audioContext.createBiquadFilter();

        // Create complex low frequency content
        boomOsc1.frequency.setValueAtTime(80, time);
        boomOsc1.frequency.exponentialRampToValueAtTime(40, time + 0.3);

        boomOsc2.frequency.setValueAtTime(120, time);
        boomOsc2.frequency.exponentialRampToValueAtTime(30, time + 0.4);

        boomOsc1.type = 'sawtooth';
        boomOsc2.type = 'square';

        boomFilter.type = 'lowpass';
        boomFilter.frequency.setValueAtTime(150, time);
        boomFilter.Q.setValueAtTime(5, time); // Add resonance

        boomOsc1.connect(boomFilter);
        boomOsc2.connect(boomFilter);
        boomFilter.connect(boomGain);
        boomGain.connect(this.audioContext.destination);

        // Slower attack for the boom, simulating pressure buildup
        boomGain.gain.setValueAtTime(0, time);
        boomGain.gain.linearRampToValueAtTime(0.8, time + 0.02); // 20ms attack
        boomGain.gain.linearRampToValueAtTime(1.0, time + 0.05); // Peak at 50ms
        boomGain.gain.exponentialRampToValueAtTime(0.1, time + 0.8);
        boomGain.gain.exponentialRampToValueAtTime(0.01, time + 2.0);

        // 3. Debris and shrapnel - metallic clinking sounds
        const debrisBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1.5, this.audioContext.sampleRate);
        const debrisData = debrisBuffer.getChannelData(0);

        for (let i = 0; i < debrisData.length; i++) {
            const t = i / debrisData.length;
            // Create metallic clinking sounds with random impulses
            if (Math.random() < 0.02) { // 2% chance per sample
                const impulseFreq = 800 + Math.random() * 1200; // Metallic frequency range
                const metallic = Math.sin(2 * Math.PI * impulseFreq * (i / this.audioContext.sampleRate));
                const envelope = Math.exp(-((t - 0.1) * 6)) * 0.3; // Start after 100ms
                debrisData[i] += metallic * envelope * (Math.random() - 0.5) * 2;
            }
        }

        const debrisSource = this.audioContext.createBufferSource();
        const debrisGain = this.audioContext.createGain();
        const debrisFilter = this.audioContext.createBiquadFilter();

        debrisSource.buffer = debrisBuffer;
        debrisSource.connect(debrisFilter);
        debrisFilter.connect(debrisGain);
        debrisGain.connect(this.audioContext.destination);

        debrisFilter.type = 'bandpass';
        debrisFilter.frequency.setValueAtTime(1500, time);
        debrisFilter.Q.setValueAtTime(2, time);

        debrisGain.gain.setValueAtTime(0, time);
        debrisGain.gain.linearRampToValueAtTime(0.4, time + 0.1); // Start after initial blast
        debrisGain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);

        // 4. Echo/reverb effect for distance
        const echoDelay = this.audioContext.createDelay(0.3);
        const echoGain = this.audioContext.createGain();
        const echoFilter = this.audioContext.createBiquadFilter();

        echoFilter.type = 'lowpass';
        echoFilter.frequency.setValueAtTime(800, time);

        boomGain.connect(echoDelay);
        echoDelay.connect(echoFilter);
        echoFilter.connect(echoGain);
        echoGain.connect(this.audioContext.destination);

        echoDelay.delayTime.setValueAtTime(0.15, time); // 150ms delay
        echoGain.gain.setValueAtTime(0.2, time);
        echoGain.gain.exponentialRampToValueAtTime(0.01, time + 1.0);

        // Start all components with realistic timing
        crackSource.start(time);
        boomOsc1.start(time + 0.002); // Slight delay after crack
        boomOsc2.start(time + 0.002);
        debrisSource.start(time + 0.05); // Debris starts after main explosion

        // Stop all sources
        crackSource.stop(time + 0.05);
        boomOsc1.stop(time + 2.0);
        boomOsc2.stop(time + 2.0);
        debrisSource.stop(time + 1.5);
    }

    public async playHitSound(): Promise<void> {
        // Generate a simple hit sound using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    public isMusicCurrentlyPlaying(): boolean {
        return this.isMusicPlaying;
    }

    public destroy(): void {
        this.stopBackgroundMusic();
        this.audioContext.close();
        console.log('🗑️ Audio system destroyed');
    }
}