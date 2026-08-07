import { BaseMode } from './base-mode.js';
import { PatternManager } from '../pattern.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class PatternMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Pattern Mode';
        this.patternManager = new PatternManager(40);

        this.baseSpawnRate = 1000;
        this.minSpawnRate = 150;
        this.maxDots = 20;
    }

    onStart() {
        this.patternManager.reset();
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
    }

    update(dt) {
        // Difficulty scaling
        const targetRate = this.baseSpawnRate * Math.pow(0.5, this.game.survivalTime / 20.0);
        this.currentSpawnRate = Math.max(this.minSpawnRate, targetRate);

        // Spawning
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.currentSpawnRate) {
            this.spawnTimer = 0;

            if (this.game.dots.length < this.maxDots) {
                const pos = this.patternManager.getNextPosition(this.game.renderer.width, this.game.renderer.height);
                this.game.dots.push(new Dot(pos.x, pos.y));
            } else {
                this.game.gameOver();
                return;
            }
        }
    }

    handleClick(x, y) {
        // Reverse loop to click dots on top first
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            const dist = Utils.distance(x, y, dot.x, dot.y);

            if (dist <= dot.radius * 1.5) {
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
