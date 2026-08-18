import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class RandomMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Random Mode';

        this.baseSpawnRate = 1000;
        this.minSpawnRate = 200;
        this.maxDots = 15;
    }

    onStart() {
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
    }

    update(dt) {
        // Difficulty scaling (slower decay than pattern mode since random is harder)
        const targetRate = this.baseSpawnRate * Math.pow(0.5, this.game.survivalTime / 25.0);
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
        let x, y;
        let valid = false;
        let attempts = 0;

        // Try to find a spot that is somewhat far from existing dots
        while (!valid && attempts < 10) {
            const margin = 50;
            x = Utils.randomInt(margin, this.game.renderer.width - margin);
            y = Utils.randomInt(margin, this.game.renderer.height - margin);

            valid = true;
            for (const dot of this.game.dots) {
                if (Utils.distance(x, y, dot.x, dot.y) < 80) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        }

        this.game.dots.push(new Dot(x, y));
    }

    handleClick(x, y) {
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            const dist = Utils.distance(x, y, dot.x, dot.y);

            if (dist <= dot.radius * 1.5) {
                this.game.dots.splice(i, 1);
                this.game.score++;

                this.game.createPopEffect(dot.x, dot.y, dot.color, '+1');
                this.game.updateHUD();
                return;
            }
        }
    }
}
