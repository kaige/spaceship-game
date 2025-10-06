import * as THREE from 'three';
import { GameObject, Vector2D } from '../types/GameTypes';

export class Meteorite implements GameObject {
    public id: string;
    public position: Vector2D;
    public velocity: Vector2D;
    public size: Vector2D;
    public isActive: boolean;

    private mesh: THREE.Mesh;
    private rotationSpeed: number;
    private currentRotation = 0;

    constructor(x: number, y: number, size: number = 30) {
        this.id = `meteorite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.velocity = {
            x: (Math.random() - 0.5) * 100, // Random horizontal drift
            y: -(50 + Math.random() * 150) // Fall downward at 50-200 pixels/second
        };
        this.size = { x: size, y: size };
        this.isActive = true;

        this.rotationSpeed = (Math.random() - 0.5) * 2; // Random rotation

        this.mesh = this.createMesh();
    }

    private createMesh(): THREE.Mesh {
        // Create an irregular polygon shape for meteorite
        const shape = new THREE.Shape();
        const numVertices = 6 + Math.floor(Math.random() * 4); // 6-9 vertices
        const radiusVariation = 0.7 + Math.random() * 0.3; // Size variation

        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const radius = (this.size.x / 2) * radiusVariation * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }

        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: 0x8B4513, // Brown color for meteorites
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.position.x, this.position.y, 0); // z=0 for background layer
        return mesh;
    }

    public update(deltaTime: number): void {
        if (!this.isActive) return;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update rotation
        this.currentRotation += this.rotationSpeed * deltaTime;

        // Update mesh position and rotation
        this.mesh.position.set(this.position.x, this.position.y, 0);
        this.mesh.rotation.z = this.currentRotation;

        // Deactivate if out of bounds (below screen)
        if (this.position.y < -440) { // Canvas half-height + some margin
            this.isActive = false;
        }

        // Deactivate if too far horizontally
        if (Math.abs(this.position.x) > 300) {
            this.isActive = false;
        }
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        this.mesh.position.set(x, y, 0);
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
        return `Meteorite[${this.id}]: pos(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) active=${this.isActive}`;
    }

    public isOutOfBounds(): boolean {
        return this.position.y < -440 || this.position.y > 440 ||
               Math.abs(this.position.x) > 250;
    }
}