export interface KeyboardState {
    ArrowUp: boolean;
    ArrowDown: boolean;
    ArrowLeft: boolean;
    ArrowRight: boolean;
    Space: boolean;
    ' ': boolean; // Alternative space key representation
    p: boolean;
    P: boolean;
    m: boolean;
    M: boolean;
}

export interface InputCallbacks {
    onKeyDown?: (key: string) => void;
    onKeyUp?: (key: string) => void;
}

export type MovementInput = {
    x: number;
    y: number;
    isShooting: boolean;
};