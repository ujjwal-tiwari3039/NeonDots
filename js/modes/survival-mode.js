import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

// Classic bouncing dot
class BouncingDot extends Dot {
    constructor(width, height, speedMultiplier) {
        const radius = Utils.random(15, 30);
        const x = Utils.random(radius, width - radius);
        const y = Utils.random(radius, height - radius);
        super(x, y);
        this.radius = radius;

        const angle = Utils.random(0, Math.PI * 2);
        const speed = Utils.random(1, 3) * speedMultiplier;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update(width, height) {
        super.update(width, height);

        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -1;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -1;
        }
    }
}

export class SurvivalMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Survival Mode';

        this.baseSpawnRate = 1000;
        this.minSpawnRate = 300;
        this.maxDots = 15;
    }

    onStart() {
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
    }

    update(dt) {
        const targetRate = this.baseSpawnRate - (this.game.level * 50);
        this.currentSpawnRate = Math.max(this.minSpawnRate, targetRate);
        const speedMultiplier = 1.0 + (this.game.level * 0.1);

        this.spawnTimer += dt;
        if (this.spawnTimer >= this.currentSpawnRate) {
            this.spawnTimer = 0;

            if (this.game.dots.length < this.maxDots) {
                this.game.dots.push(new BouncingDot(this.game.renderer.width, this.game.renderer.height, speedMultiplier));
            } else {
                this.game.gameOver();
                return;
            }
        }
    }

    handleClick(x, y) {
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            const dist = Utils.distance(x, y, dot.x, dot.y);

            if (dist <= dot.radius * 1.2) {
                this.game.dots.splice(i, 1);
                this.game.score++;
                audio.playPop();

                for (let p = 0; p < 10; p++) {
                    this.game.particles.push(new Particle(dot.x, dot.y, dot.color));
                }

                this.game.updateHUD();
                return;
            }
        }
    }
}
