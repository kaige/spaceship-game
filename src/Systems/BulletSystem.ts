import * as THREE from 'three';
import { Bullet } from '../GameObjects/Bullet';
import { MovementInput } from '../types/InputTypes';
import { AudioSystem } from './AudioSystem';

export class BulletSystem {
    private bullets: Bullet[] = [];
    private scene: THREE.Scene;
    private lastShootTime = 0;
    private shootCooldown = 0.1; // 100ms between shots (more密集)
    private canShoot = true;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        console.log('🔫 BulletSystem initialized');
    }

    public update(deltaTime: number, input: MovementInput, spaceshipPosition: { x: number; y: number }): void {
        // Update shoot cooldown
        if (!this.canShoot) {
            this.lastShootTime += deltaTime;
            if (this.lastShootTime >= this.shootCooldown) {
                this.canShoot = true;
                this.lastShootTime = 0;
            }
        }

        // Handle shooting input
        if (input.isShooting && this.canShoot) {
            this.shoot(spaceshipPosition.x, spaceshipPosition.y);
            this.canShoot = false;
            this.lastShootTime = 0;
        }

        // Update all bullets
        this.bullets.forEach(bullet => {
            bullet.update(deltaTime);
        });

        // Remove inactive bullets
        this.removeInactiveBullets();
    }

    private shoot(x: number, y: number): void {
        const bullet = new Bullet(x, y + 20); // Spawn slightly above spaceship
        this.bullets.push(bullet);
        this.scene.add(bullet.getMesh());

        // Play shoot sound effect
        AudioSystem.getInstance().playShootSound();

        console.log(`🔫 Fired bullet from (${x}, ${y})`);
    }

    private removeInactiveBullets(): void {
        const inactiveBullets = this.bullets.filter(bullet => !bullet.isActive);

        if (inactiveBullets.length > 0) {
            inactiveBullets.forEach(bullet => {
                this.scene.remove(bullet.getMesh());
                bullet.destroy();
            });

            this.bullets = this.bullets.filter(bullet => bullet.isActive);

            if (inactiveBullets.length > 0) {
                console.log(`🗑️ Removed ${inactiveBullets.length} inactive bullets`);
            }
        }
    }

    public getBullets(): Bullet[] {
        return this.bullets;
    }

    public getActiveBulletCount(): number {
        return this.bullets.filter(bullet => bullet.isActive).length;
    }

    public clearAllBullets(): void {
        this.bullets.forEach(bullet => {
            this.scene.remove(bullet.getMesh());
            bullet.destroy();
        });
        this.bullets = [];
        console.log('🗑️ Cleared all bullets');
    }

    public destroy(): void {
        this.clearAllBullets();
        console.log('🗑️ BulletSystem destroyed');
    }

    public debugInfo(): string {
        return `BulletSystem: ${this.getActiveBulletCount()} active bullets, canShoot=${this.canShoot}`;
    }
}