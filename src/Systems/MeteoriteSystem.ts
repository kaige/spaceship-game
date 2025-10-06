import * as THREE from 'three';
import { Meteorite } from '../GameObjects/Meteorite';

export class MeteoriteSystem {
    private meteorites: Meteorite[] = [];
    private scene: THREE.Scene;
    private spawnTimer = 0;
    private spawnInterval = 1.5; // Spawn every 1.5 seconds
    private maxMeteorites = 10;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        console.log('☄️ MeteoriteSystem initialized');
    }

    public update(deltaTime: number): void {
        // Update spawn timer
        this.spawnTimer += deltaTime;

        // Spawn new meteorites
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnMeteorite();
            this.spawnTimer = 0;
        }

        // Update all meteorites
        this.meteorites.forEach(meteorite => {
            meteorite.update(deltaTime);
        });

        // Remove inactive meteorites
        this.removeInactiveMeteorites();
    }

    private spawnMeteorite(): void {
        // Only spawn if we haven't reached the maximum
        if (this.meteorites.filter(m => m.isActive).length >= this.maxMeteorites) {
            return;
        }

        // Random position at top of screen
        const x = (Math.random() - 0.5) * 300; // -150 to 150
        const y = 380; // Top of screen with some margin (660/2 + 50)
        const size = 20 + Math.random() * 30; // Random size between 20-50

        const meteorite = new Meteorite(x, y, size);
        this.meteorites.push(meteorite);
        this.scene.add(meteorite.getMesh());
        console.log(`☄️ Spawned meteorite at (${x.toFixed(1)}, ${y.toFixed(1)}) with size ${size.toFixed(1)}`);
    }

    private removeInactiveMeteorites(): void {
        const inactiveMeteorites = this.meteorites.filter(meteorite => !meteorite.isActive);

        if (inactiveMeteorites.length > 0) {
            inactiveMeteorites.forEach(meteorite => {
                this.scene.remove(meteorite.getMesh());
                meteorite.destroy();
            });

            this.meteorites = this.meteorites.filter(meteorite => meteorite.isActive);

            if (inactiveMeteorites.length > 0) {
                console.log(`🗑️ Removed ${inactiveMeteorites.length} inactive meteorites`);
            }
        }
    }

    public getMeteorites(): Meteorite[] {
        return this.meteorites;
    }

    public getActiveMeteoriteCount(): number {
        return this.meteorites.filter(meteorite => meteorite.isActive).length;
    }

    public setSpawnInterval(interval: number): void {
        this.spawnInterval = interval;
        console.log(`☄️ Spawn interval set to ${interval}s`);
    }

    public setMaxMeteorites(max: number): void {
        this.maxMeteorites = max;
        console.log(`☄️ Max meteorites set to ${max}`);
    }

    public clearAllMeteorites(): void {
        this.meteorites.forEach(meteorite => {
            this.scene.remove(meteorite.getMesh());
            meteorite.destroy();
        });
        this.meteorites = [];
        console.log('🗑️ Cleared all meteorites');
    }

    public destroy(): void {
        this.clearAllMeteorites();
        console.log('🗑️ MeteoriteSystem destroyed');
    }

    public debugInfo(): string {
        return `MeteoriteSystem: ${this.getActiveMeteoriteCount()} active meteorites, spawnInterval=${this.spawnInterval}s`;
    }
}