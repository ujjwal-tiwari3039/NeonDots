import { Utils } from '../utils.js';

export class Dot {
    constructor(x, y, text = null, color = null) {
        this.radius = Utils.random(15, 30);
        
        this.x = x;
        this.y = y;
        
        this.color = color || Utils.getRandomColor();
        this.text = text;
        
        this.scale = 0; // For spawn animation
        this.targetScale = 1;
        
        // For pulsing animation
        this.pulseTime = Utils.random(0, Math.PI * 2);
        this.pulseSpeed = Utils.random(0.02, 0.05);
    }

    update(width, height) {
        // Spawn animation
        if (this.scale < this.targetScale) {
            this.scale += 0.05;
            if (this.scale > this.targetScale) this.scale = this.targetScale;
        }

        // Pulse animation
        this.pulseTime += this.pulseSpeed;
    }

    draw(ctx) {
        if (this.hidden) return;
        
        ctx.save();
        ctx.beginPath();
        
        // Calculate current scale including pulse (varies between 0.9 and 1.1)
        const currentPulse = 1.0 + Math.sin(this.pulseTime) * 0.1;
        const finalScale = this.scale * currentPulse;
        
        ctx.arc(this.x, this.y, this.radius * finalScale, 0, Math.PI * 2);
        
        ctx.fillStyle = this.color;
        
        // Neon glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        
        if (this.text) {
            // Draw text instead of bright center
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${this.radius * finalScale}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            // Bright center
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4 * finalScale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }
}
