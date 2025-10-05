import * as THREE from 'three';
import { GameObject, Vector2D } from '../types/GameTypes';
import { MovementInput } from '../types/InputTypes';

export class Spaceship implements GameObject {
    public id: string;
    public position: Vector2D;
    public velocity: Vector2D;
    public size: Vector2D;
    public isActive: boolean;

    private mesh: THREE.Mesh;
    private moveSpeed: number;
    private boundaryPadding: number;

    constructor() {
        this.id = `spaceship_${Date.now()}`;
        this.position = { x: 0, y: -250 }; // Start at bottom center (more obvious position)
        this.velocity = { x: 0, y: 0 };
        this.size = { x: 40, y: 40 };
        this.isActive = true;

        this.moveSpeed = 300; // pixels per second
        this.boundaryPadding = this.size.x / 2;

        this.mesh = this.createMesh();
        console.log(`🚀 Spaceship created at position (${this.position.x}, ${this.position.y})`);
    }

    private createMesh(): THREE.Mesh {
        // Create a simple triangle-shaped spaceship
        const shape = new THREE.Shape();

        // Draw triangle pointing upward
        shape.moveTo(0, 20);     // Top point
        shape.lineTo(-15, -15);  // Bottom left
        shape.lineTo(15, -15);   // Bottom right
        shape.lineTo(0, 20);     // Back to top

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // Green color for better visibility
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.position.x, this.position.y, 1); // z=1 for foreground
        return mesh;
    }

    public update(deltaTime: number, input: MovementInput, canvasWidth: number, canvasHeight: number): void {
        if (!this.isActive) return;

        // Calculate movement based on input
        const moveX = input.x * this.moveSpeed * deltaTime;
        const moveY = input.y * this.moveSpeed * deltaTime;

        // Update position
        this.position.x += moveX;
        this.position.y += moveY;

        // Apply boundaries (keep spaceship within canvas)
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;

        this.position.x = THREE.MathUtils.clamp(
            this.position.x,
            -halfWidth + this.boundaryPadding,
            halfWidth - this.boundaryPadding
        );

        this.position.y = THREE.MathUtils.clamp(
            this.position.y,
            -halfHeight + this.boundaryPadding,
            halfHeight - this.boundaryPadding
        );

        // Update mesh position
        this.mesh.position.set(this.position.x, this.position.y, 1);

        // Update velocity for potential physics calculations
        this.velocity.x = moveX / deltaTime;
        this.velocity.y = moveY / deltaTime;
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
        return `Spaceship[${this.id}]: pos(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) active=${this.isActive}`;
    }
}