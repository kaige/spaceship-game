// Game configuration and type definitions

export interface GameState {
    score: number;
    lives: number;
    isGameOver: boolean;
    isPaused: boolean;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: number;
}

export interface Vector2D {
    x: number;
    y: number;
}

export interface GameObject {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    size: Vector2D;
    isActive: boolean;
}

export const GAME_CONFIG: GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    backgroundColor: 0x000511
};