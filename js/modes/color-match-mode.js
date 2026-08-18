import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class ColorMatchMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Color Match';
        
        this.baseSpawnRate = 1000;
        this.minSpawnRate = 250;
        this.maxDots = 15;
        
        this.targetColor = null;
        this.colorChangeTimer = 0;
        this.colorChangeInterval = 5000; // Change color every 5s
    }

    onStart() {
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
        this.changeTargetColor();
    }

    changeTargetColor() {
        this.targetColor = Utils.getRandomColor();
        this.colorChangeTimer = 0;
    }

    update(dt) {
        // Change color periodically
        this.colorChangeTimer += dt;
        if (this.colorChangeTimer >= this.colorChangeInterval) {
            this.changeTargetColor();
        }
        
        const targetRate = this.baseSpawnRate * Math.pow(0.5, this.game.survivalTime / 20.0);
        this.currentSpawnRate = Math.max(this.minSpawnRate, targetRate);
        
        // Spawning
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.currentSpawnRate) {
            this.spawnTimer = 0;
            
            if (this.game.dots.length < this.maxDots) {
                this.spawnRandomDot();
            } else {
                this.game.gameOver();
                return;
            }
        }
    }

    spawnRandomDot() {
        const margin = 50;
        const x = Utils.randomInt(margin, this.game.renderer.width - margin);
        const y = Utils.randomInt(margin, this.game.renderer.height - margin);
        
        // Spawn with random color
        this.game.dots.push(new Dot(x, y));
    }

    handleClick(x, y) {
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            const dist = Utils.distance(x, y, dot.x, dot.y);

            if (dist <= dot.radius * 1.5) {
                this.game.dots.splice(i, 1);

                if (dot.color === this.targetColor) {
                    this.game.score += 2;
                    this.game.createPopEffect(dot.x, dot.y, dot.color, '+2 MATCH!');
                } else {
                    // Allow points to go into negative on wrong dot click
                    this.game.score -= 2;
                    audio.playError();
                    this.game.triggerShake(4.5);
                    this.game.createPopEffect(dot.x, dot.y, '#ff3b30', '-2 WRONG');
                }

                this.game.updateHUD();
                return;
            }
        }
    }

    draw(ctx) {
        // Draw HUD for Target Color
        if (!this.targetColor) return;
        
        ctx.save();
        ctx.fillStyle = this.targetColor;
        ctx.font = 'bold 30px Outfit, sans-serif';
        ctx.textAlign = 'center';
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.targetColor;
        
        ctx.fillText('TARGET COLOR', this.game.renderer.width / 2, 80);
        
        // Draw a color swatch
        ctx.beginPath();
        ctx.arc(this.game.renderer.width / 2, 130, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
