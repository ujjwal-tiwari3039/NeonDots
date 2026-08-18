import { Utils } from '../utils.js';

export class Dot {
    constructor(x, y, text = null, color = null) {
        this.radius = Utils.random(18, 30);
        this.x = x;
        this.y = y;
        this.color = color || Utils.getRandomColor();
        this.text = text;

        // Spring-based elastic spawn animation
        this.scale = 0;
        this.scaleVel = 0.2;
        this.targetScale = 1.0;

        // Breathing pulse animation
        this.pulseTime = Utils.random(0, Math.PI * 2);
        this.pulseSpeed = Utils.random(0.03, 0.06);

        // Ambient ring rotation
        this.ringAngle = Utils.random(0, Math.PI * 2);
    }

    update(width, height) {
        // Elastic spring spawn easing
        const diff = this.targetScale - this.scale;
        this.scaleVel += diff * 0.25;
        this.scaleVel *= 0.72; // Spring damping
        this.scale += this.scaleVel;

        // Pulse
        this.pulseTime += this.pulseSpeed;
        this.ringAngle += 0.02;
    }

    draw(ctx) {
        if (this.hidden) return;

        ctx.save();

        // Calculate smooth breathing scale
        const pulse = 1.0 + Math.sin(this.pulseTime) * 0.08;
        const currentScale = Math.max(0.01, this.scale * pulse);
        const r = this.radius * currentScale;

        // 1. Soft Outer Aura Ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35 + Math.sin(this.pulseTime) * 0.15;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.stroke();

        // 2. Main Neon Body
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        ctx.fill();

        // 3. Inner Content (Text or Bright Core)
        if (this.text) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `900 ${Math.round(r * 1.1)}px 'Outfit', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#000000';
            ctx.fillText(this.text, this.x, this.y + 1);
        } else {
            // Bright white hotspot center
            ctx.beginPath();
            ctx.arc(this.x, this.y, r * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }
}
