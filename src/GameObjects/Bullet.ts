import * as THREE from 'three';
import { GameObject, Vector2D } from '../types/GameTypes';

export class Bullet implements GameObject {
    public id: string;
    public position: Vector2D;
    public velocity: Vector2D;
    public size: Vector2D;
    public isActive: boolean;

    private mesh: THREE.Mesh;
    private lifetime: number;
    private currentAge: number;

    constructor(x: number, y: number) {
        this.id = `bullet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.velocity = { x: 0, y: 500 }; // Move upward at 500 pixels/second
        this.size = { x: 4, y: 12 };
        this.isActive = true;

        this.lifetime = 2.0; // 2 seconds lifetime
        this.currentAge = 0;

        this.mesh = this.createMesh();
    }

    private createMesh(): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00, // Yellow color for bullets
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.position.x, this.position.y, 1); // z=1 for foreground
        return mesh;
    }

    public update(deltaTime: number): void {
        if (!this.isActive) return;

        // Update age
        this.currentAge += deltaTime;

        // Deactivate if too old
        if (this.currentAge >= this.lifetime) {
            this.isActive = false;
            return;
        }

        // Update position
        this.position.y += this.velocity.y * deltaTime;
        this.position.x += this.velocity.x * deltaTime;

        // Update mesh position
        this.mesh.position.set(this.position.x, this.position.y, 1);

        // Deactivate if out of bounds (above screen)
        if (this.position.y > 440) { // Canvas half-height + some margin (660/2 + 110)
            this.isActive = false;
        }
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        this.mesh.position.set(x, y, 1);
    }

    public destroy(): void {
        this.isActive = false;
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
    }

    public getBounds(): { min: Vector2D; max: Vector2D } {
        return {
            min: {
                x: this.position.x - this.size.x / 2,
                y: this.position.y - this.size.y / 2
            },
            max: {
                x: this.position.x + this.size.x / 2,
                y: this.position.y + this.size.y / 2
            }
        };
    }

    public debugInfo(): string {
        return `Bullet[${this.id}]: pos(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) active=${this.isActive} age=${this.currentAge.toFixed(2)}s`;
    }

    public isOutOfBounds(): boolean {
        return this.position.y > 440 || this.position.y < -440 ||
               this.position.x > 250 || this.position.x < -250;
    }
}