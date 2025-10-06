import * as THREE from 'three';
import { GAME_CONFIG } from './types/GameTypes';
import { InputSystem } from './Systems/InputSystem';
import { BulletSystem } from './Systems/BulletSystem';
import { MeteoriteSystem } from './Systems/MeteoriteSystem';
import { CollisionSystem } from './Systems/CollisionSystem';
import { AudioSystem } from './Systems/AudioSystem';
import { Spaceship } from './GameObjects/Spaceship';

console.log('🚀 Space Shooter Game Starting...');

class SpaceShooterGame {
    private canvas: HTMLCanvasElement;
    private scene!: THREE.Scene;
    private camera!: THREE.OrthographicCamera;
    private renderer!: THREE.WebGLRenderer;
    private inputSystem: InputSystem;
    private isInitialized = false;
    private animationId: number | null = null;

    // Game objects
    private spaceship!: Spaceship;
    private bulletSystem!: BulletSystem;
    private meteoriteSystem!: MeteoriteSystem;
    private audioSystem!: AudioSystem;

    // Game loop timing
    private lastTime = 0;

    // Game state
    private score = 0;
    private lives = 3;
    private isGameOver = false;
    private isPaused = false;
    private musicStarted = false; // Track if music has been started

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('Canvas element not found!');
        }

        this.inputSystem = new InputSystem();

        this.setupCanvas();
        this.setupThreeJS();
        this.setupGameObjects();
        this.setupInputSystem();
        this.setupEventListeners();

        console.log('✅ Game initialized successfully!');
        this.isInitialized = true;
    }

    private setupCanvas(): void {
        this.canvas.width = GAME_CONFIG.canvasWidth;
        this.canvas.height = GAME_CONFIG.canvasHeight;
        console.log(`📐 Canvas set to ${this.canvas.width}x${this.canvas.height}`);
    }

    private setupThreeJS(): void {
        // Create scene
        this.scene = new THREE.Scene();
        console.log('🎬 Three.js scene created');

        // Setup orthographic camera for 2D rendering
        this.camera = new THREE.OrthographicCamera(
            -GAME_CONFIG.canvasWidth / 2,
            GAME_CONFIG.canvasWidth / 2,
            GAME_CONFIG.canvasHeight / 2,
            -GAME_CONFIG.canvasHeight / 2,
            0.1,
            1000
        );
        this.camera.position.z = 10;
        console.log('📷 Orthographic camera configured for 2D');

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
        this.renderer.setClearColor(GAME_CONFIG.backgroundColor);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        console.log('🎨 WebGL renderer configured');

        // Add game objects to scene
        this.setupGameObjects();
    }

    private setupGameObjects(): void {
        // Clear any existing objects (for hot reload debugging)
        this.clearScene();

        // Create spaceship
        this.spaceship = new Spaceship();
        this.scene.add(this.spaceship.getMesh());
        console.log('🚀 Spaceship created and added to scene');

        // Create bullet system
        this.bulletSystem = new BulletSystem(this.scene);
        console.log('🔫 Bullet system created');

        // Create meteorite system
        this.meteoriteSystem = new MeteoriteSystem(this.scene);
        console.log('☄️ Meteorite system created');

        // Create audio system
        this.audioSystem = AudioSystem.getInstance();
        this.initializeAudio();
        console.log('🎵 Audio system created');

        // Create border lines to verify canvas bounds
        this.createBorderLines();

        // Debug: count objects in scene
        console.log(`📊 Scene now has ${this.scene.children.length} objects`);
    }

    private clearScene(): void {
        const objectsToRemove: THREE.Object3D[] = [];

        this.scene.traverse((child) => {
            if (child.type === 'Mesh') {
                objectsToRemove.push(child);
            }
        });

        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                if (obj.material instanceof THREE.Material) {
                    obj.material.dispose();
                }
            }
        });

        if (objectsToRemove.length > 0) {
            console.log(`🧹 Cleared ${objectsToRemove.length} objects from scene`);
        }
    }

    private setupInputSystem(): void {
        this.inputSystem.initialize({
            onKeyDown: (key) => {
                console.log(`⌨️ Key pressed: ${key}`);
                this.updateDebugDisplay();
            },
            onKeyUp: (key) => {
                console.log(`⌨️ Key released: ${key}`);
                this.updateDebugDisplay();
            }
        });
    }

    private createBorderLines(): void {
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        // Create border rectangle
        const halfWidth = GAME_CONFIG.canvasWidth / 2;
        const halfHeight = GAME_CONFIG.canvasHeight / 2;

        const points = [
            new THREE.Vector3(-halfWidth, -halfHeight, 0),
            new THREE.Vector3(halfWidth, -halfHeight, 0),
            new THREE.Vector3(halfWidth, halfHeight, 0),
            new THREE.Vector3(-halfWidth, halfHeight, 0),
            new THREE.Vector3(-halfWidth, -halfHeight, 0)
        ];

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const borderLine = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(borderLine);
        console.log('🔲 Border lines added to scene');
    }

    private setupEventListeners(): void {
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        console.log('🎮 Event listeners configured');
    }

    private handleResize(): void {
        // For now, keep canvas size fixed
        console.log('📐 Window resize detected (canvas size fixed)');
    }

    private updateDebugDisplay(): void {
        const input = this.inputSystem.getMovementInput();

        // Update UI display
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            const existingDebug = document.getElementById('debug-info');
            if (existingDebug) {
                existingDebug.remove();
            }

            const debugDiv = document.createElement('div');
            debugDiv.id = 'debug-info';
            debugDiv.style.fontSize = '10px';
            debugDiv.style.color = '#0f0';
            debugDiv.innerHTML = `
                Score: ${this.score} | Lives: ${this.lives} | ${this.isGameOver ? 'GAME OVER' : this.isPaused ? 'PAUSED' : 'PLAYING'}
                Ship: (${this.spaceship.position.x.toFixed(0)}, ${this.spaceship.position.y.toFixed(0)})
                Input: (${input.x.toFixed(1)}, ${input.y.toFixed(1)})
                Shoot: ${input.isShooting ? '🔥' : '❄️'}
                Bullets: ${this.bulletSystem.getActiveBulletCount()}
                Meteorites: ${this.meteoriteSystem.getActiveMeteoriteCount()}
            `;
            gameUI.appendChild(debugDiv);
        }
    }

    private gameLoop = (currentTime: number): void => {
        if (!this.isInitialized) return;

        // Calculate delta time
        const deltaTime = this.lastTime === 0 ? 0 : (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Update game logic
        this.update(deltaTime);

        // Render
        this.renderer.render(this.scene, this.camera);

        // Continue loop
        this.animationId = requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        // Check for pause key (even if game is paused or over)
        if (this.inputSystem.checkAndConsumePauseKey()) {
            if (!this.isGameOver) {
                this.pauseGame();
            }
        }

        // Check for music key (even if game is paused or over)
        if (this.inputSystem.checkAndConsumeMusicKey()) {
            this.toggleMusic();
        }

        // Don't update if game is over or paused
        if (this.isGameOver || this.isPaused) return;

        // Get input
        const input = this.inputSystem.getMovementInput();

        // Start music when player first moves
        if (!this.musicStarted && (input.x !== 0 || input.y !== 0)) {
            this.startBackgroundMusic();
        }

        // Update spaceship
        this.spaceship.update(deltaTime, input, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

        // Update bullet system
        this.bulletSystem.update(deltaTime, input, this.spaceship.position);

        // Update meteorite system
        this.meteoriteSystem.update(deltaTime);

        // Check collisions
        this.checkCollisions();

        // Update debug display
        this.updateDebugDisplay();
    }

    public start(): void {
        if (!this.isInitialized) {
            throw new Error('Game not initialized!');
        }

        this.gameLoop(0);
        console.log('🎮 Game loop started');
    }

    public stop(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('⏹️ Game loop stopped');
        }
    }

    private checkCollisions(): void {
        const bullets = this.bulletSystem.getBullets();
        const meteorites = this.meteoriteSystem.getMeteorites();

        const collisionResult = CollisionSystem.checkCollisions(
            bullets,
            meteorites,
            this.spaceship
        );

        // Process collisions
        CollisionSystem.processCollisionResults(
            collisionResult,
            // Bullet-Meteorite collision callback
            async (_bullet, _meteorite) => {
                this.score += 10;
                await this.audioSystem.playExplosionSound();
                console.log(`🎯 Score: ${this.score}`);
            },
            // Spaceship-Meteorite collision callback
            async (_spaceship, _meteorite) => {
                this.lives--;
                this.score = Math.max(0, this.score - 5);
                await this.audioSystem.playHitSound();
                console.log(`💥 Spaceship hit! Lives: ${this.lives}, Score: ${this.score}`);

                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        );
    }

    private gameOver(): void {
        this.isGameOver = true;
        console.log('🎮 GAME OVER!');

        // Update UI to show game over
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            const gameOverDiv = document.createElement('div');
            gameOverDiv.style.color = '#ff0000';
            gameOverDiv.style.fontSize = '24px';
            gameOverDiv.style.fontWeight = 'bold';
            gameOverDiv.style.marginTop = '20px';
            gameOverDiv.innerHTML = `
                GAME OVER!<br>
                Final Score: ${this.score}<br>
                Press F5 to restart
            `;
            gameUI.appendChild(gameOverDiv);
        }
    }

    public resetGame(): void {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isPaused = false;

        // Clear all game objects
        this.bulletSystem.clearAllBullets();
        this.meteoriteSystem.clearAllMeteorites();

        // Reset spaceship position
        this.spaceship.setPosition(0, -250);

        console.log('🔄 Game reset!');
    }

    public pauseGame(): void {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
    }

    private async initializeAudio(): Promise<void> {
        // Try to load background music in different formats
        const audioFormats = [
            '/assets/audio/background-music.mp3',
            '/assets/audio/background-music.ogg',
            '/assets/audio/background-music.wav'
        ];

        let musicLoaded = false;

        for (const format of audioFormats) {
            try {
                await this.audioSystem.loadBackgroundMusic(format);
                musicLoaded = true;
                break; // Stop trying other formats if successful
            } catch (error) {
                console.log(`🎵 Failed to load ${format}, trying next format...`);
            }
        }

        if (!musicLoaded) {
            console.log('🎵 No background music found in any supported format');
            console.log('💡 Supported formats: MP3, OGG, WAV');
            console.log('💡 Make sure your audio file is named "background-music" and placed in /public/assets/audio/');
        }
    }

    public toggleMusic(): void {
        this.audioSystem.toggleMusic();
    }

    public setMusicVolume(volume: number): void {
        this.audioSystem.setMusicVolume(volume);
    }

    private startBackgroundMusic(): void {
        if (!this.musicStarted) {
            try {
                this.audioSystem.playBackgroundMusic();
                this.musicStarted = true;
                console.log('🎵 Background music started automatically on first movement!');
            } catch (error) {
                console.log('🎵 Could not start background music automatically');
            }
        }
    }

    public render(): void {
        if (!this.isInitialized) return;

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new SpaceShooterGame();
        game.start();

        // Update UI to show initialization is complete
        const gameUI = document.getElementById('gameUI');
        if (gameUI) {
            gameUI.innerHTML += '<div style="color: #0f0; font-size: 12px;">✅ Spaceship Ready!</div>';
            gameUI.innerHTML += '<div style="color: #ff0; font-size: 10px;">Use arrow keys to move spaceship</div>';
            gameUI.innerHTML += '<div style="color: #ff0; font-size: 10px;">Press spacebar to shoot!</div>';
            gameUI.innerHTML += '<div style="color: #ff0; font-size: 10px;">Press P to pause/resume</div>';
            gameUI.innerHTML += '<div style="color: #ff0; font-size: 10px;">Press M to toggle music</div>';
        }

        console.log('🚀 Spaceship test ready!');

    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
    }
});