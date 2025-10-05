import { KeyboardState, InputCallbacks, MovementInput } from '../types/InputTypes';

export class InputSystem {
    private keyboardState: KeyboardState;
    private callbacks: InputCallbacks;
    private isInitialized = false;

    constructor() {
        this.keyboardState = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            ' ': false
        };

        this.callbacks = {};
    }

    public initialize(callbacks?: InputCallbacks): void {
        if (this.isInitialized) {
            console.warn('InputSystem already initialized');
            return;
        }

        if (callbacks) {
            this.callbacks = callbacks;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('🎮 InputSystem initialized');
    }

    private setupEventListeners(): void {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Prevent arrow keys from scrolling the page
        window.addEventListener('keydown', this.preventPageScroll.bind(this));

        console.log('⌨️ Keyboard event listeners set up');
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        const key = event.key;

        // Handle both ' ' and 'Space' for spacebar
        if (key === ' ') {
            if (!this.keyboardState[' ']) {
                this.keyboardState[' '] = true;
                this.keyboardState.Space = true;

                if (this.callbacks.onKeyDown) {
                    this.callbacks.onKeyDown(key);
                }
            }
        } else if (key in this.keyboardState) {
            if (!this.keyboardState[key as keyof KeyboardState]) {
                this.keyboardState[key as keyof KeyboardState] = true;

                if (this.callbacks.onKeyDown) {
                    this.callbacks.onKeyDown(key);
                }
            }
        }

        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            event.preventDefault();
        }
    };

    private handleKeyUp = (event: KeyboardEvent): void => {
        const key = event.key;

        // Handle both ' ' and 'Space' for spacebar
        if (key === ' ') {
            if (this.keyboardState[' ']) {
                this.keyboardState[' '] = false;
                this.keyboardState.Space = false;

                if (this.callbacks.onKeyUp) {
                    this.callbacks.onKeyUp(key);
                }
            }
        } else if (key in this.keyboardState) {
            if (this.keyboardState[key as keyof KeyboardState]) {
                this.keyboardState[key as keyof KeyboardState] = false;

                if (this.callbacks.onKeyUp) {
                    this.callbacks.onKeyUp(key);
                }
            }
        }

        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            event.preventDefault();
        }
    };

    private preventPageScroll = (event: KeyboardEvent): void => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
    };

    public getMovementInput(): MovementInput {
        let x = 0;
        let y = 0;

        if (this.keyboardState.ArrowLeft) x -= 1;
        if (this.keyboardState.ArrowRight) x += 1;
        if (this.keyboardState.ArrowUp) y += 1;
        if (this.keyboardState.ArrowDown) y -= 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const magnitude = Math.sqrt(x * x + y * y);
            x /= magnitude;
            y /= magnitude;
        }

        return {
            x,
            y,
            isShooting: this.keyboardState.Space
        };
    }

    public isKeyPressed(key: keyof KeyboardState): boolean {
        return this.keyboardState[key];
    }

    public getKeyboardState(): Readonly<KeyboardState> {
        return { ...this.keyboardState };
    }

    public destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('keydown', this.preventPageScroll);

        this.isInitialized = false;
        console.log('🗑️ InputSystem destroyed');
    }

    public debugLogState(): void {
        const state = this.getMovementInput();
        console.log('🎮 Input State:', {
            movement: `(${state.x.toFixed(2)}, ${state.y.toFixed(2)})`,
            shooting: state.isShooting,
            rawState: this.keyboardState
        });
    }
}