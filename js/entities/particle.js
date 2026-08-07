import { Utils } from '../utils.js';

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Random velocity for explosion
        const angle = Utils.random(0, Math.PI * 2);
        const speed = Utils.random(1, 5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.radius = Utils.random(2, 4);
        this.life = 1.0; // 1.0 to 0.0
        this.decay = Utils.random(0.01, 0.03);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.restore();
    }
}
