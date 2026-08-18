import { Utils } from '../utils.js';

// ─── 1. HIGH-SPEED VELOCITY-STRETCHED SPARK PARTICLE ──────────────────────────
export class SparkParticle {
    constructor(x, y, color, speedScale = 1.0) {
        this.x = x;
        this.y = y;
        this.color = color;

        const angle = Utils.random(0, Math.PI * 2);
        const speed = Utils.random(3.5, 9.0) * speedScale;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.drag = Utils.random(0.91, 0.94); // Organic air friction
        this.radius = Utils.random(2.0, 3.5);
        this.life = 1.0;
        this.decay = Utils.random(0.025, 0.045);
        this.length = Utils.random(3, 7);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);

        // Calculate velocity-stretched tail
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const tailX = this.x - (this.vx / (speed || 1)) * (speed * 1.8 + this.length);
        const tailY = this.y - (this.vy / (speed || 1)) * (speed * 1.8 + this.length);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.radius * (this.life);
        ctx.lineCap = 'round';
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.stroke();

        // Bright white core spark
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5 * this.life, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fill();

        ctx.restore();
    }
}

// ─── 2. EXPANDING SHOCKWAVE RING ─────────────────────────────────────────────
export class Shockwave {
    constructor(x, y, color, maxRadius = 60) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 4;
        this.maxRadius = maxRadius;
        this.life = 1.0;
        this.decay = 0.05;
        this.lineWidth = 4.0;
    }

    update() {
        // Fast expansion with ease-out
        const progress = 1.0 - this.life;
        this.radius += (this.maxRadius - this.radius) * 0.22;
        this.lineWidth = Math.max(0.5, 4.0 * this.life);
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.pow(this.life, 1.5);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.restore();
    }
}

// ─── 3. STARBURST FLASH EFFECT ───────────────────────────────────────────────
export class StarBurst {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.12; // Very fast: lasts ~8 frames
        this.maxSize = Utils.random(35, 55);
        this.rotation = Utils.random(0, Math.PI);
    }

    update() {
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const currentSize = this.maxSize * (1 - Math.pow(1 - this.life, 2));

        // 4-point diamond star flare
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(0, -currentSize);
        ctx.quadraticCurveTo(0, 0, currentSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, currentSize);
        ctx.quadraticCurveTo(0, 0, -currentSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, -currentSize);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// ─── 4. FLOATING SCORE POPUP TEXT ────────────────────────────────────────────
export class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color || '#00f3ff';
        this.vy = -2.2;
        this.life = 1.0;
        this.decay = 0.025;
        this.scale = 0.4;
        this.targetScale = 1.0;
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.95; // Gentle upward drift deceleration

        if (this.scale < this.targetScale) {
            this.scale += 0.15;
            if (this.scale > this.targetScale) this.scale = this.targetScale;
        }

        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.min(1.0, this.life * 1.4);
        ctx.font = `900 ${Math.round(20 * this.scale)}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glowing outer shadow
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.text, this.x, this.y);

        ctx.restore();
    }
}

// ─── 5. SUBTLE TAP RIPPLE FOR TOUCH/CLICK FEEDBACK ───────────────────────────
export class TapRipple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = 24;
        this.life = 1.0;
        this.decay = 0.08;
    }

    update() {
        this.radius += (this.maxRadius - this.radius) * 0.3;
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f3ff';
        ctx.stroke();
        ctx.restore();
    }
}

// Default export backward compatibility
export const Particle = SparkParticle;
