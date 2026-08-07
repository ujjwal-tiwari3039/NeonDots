export class InputManager {
    constructor(canvas, onClickCallback, onKeyCallback) {
        this.canvas = canvas;
        this.onClickCallback = onClickCallback;
        this.onKeyCallback = onKeyCallback;

        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e.clientX, e.clientY));

        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                this.handleInput(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (this.onKeyCallback) {
                this.onKeyCallback(e.key);
            }
        });
    }

    handleInput(x, y) {
        if (this.onClickCallback) {
            this.onClickCallback(x, y);
        }
    }
}
