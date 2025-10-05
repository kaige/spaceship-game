import { Vector2D } from '../types/GameTypes';

export class GameUtils {
    static generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    static distance(a: Vector2D, b: Vector2D): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static checkCollision(a: Vector2D, sizeA: Vector2D, b: Vector2D, sizeB: Vector2D): boolean {
        return (
            a.x < b.x + sizeB.x &&
            a.x + sizeA.x > b.x &&
            a.y < b.y + sizeB.y &&
            a.y + sizeA.y > b.y
        );
    }

    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(start: number, end: number, factor: number): number {
        return start + (end - start) * factor;
    }
}