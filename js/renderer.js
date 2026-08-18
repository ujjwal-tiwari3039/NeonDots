export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.resize();

        // Listen to window resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Support high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    clear() {
        // Deep background clear
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}
