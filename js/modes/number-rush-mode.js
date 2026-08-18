import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class NumberRushMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Number Rush';

        this.baseSpawnRate = 1200;
        this.minSpawnRate = 200;
        this.maxDots = 10;
    }

    onStart() {
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
    }

    update(dt) {
        // Fast progression
        const targetRate = this.baseSpawnRate * Math.pow(0.5, this.game.survivalTime / 18.0);
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

        let numberPool = '0123456789'.split('');

        // Pick a number not currently on screen
        for (const dot of this.game.dots) {
            numberPool = numberPool.filter(n => n !== dot.text);
        }

        if (numberPool.length === 0) numberPool = '0123456789'.split('');

        const num = numberPool[Utils.randomInt(0, numberPool.length - 1)];

        this.game.dots.push(new Dot(x, y, num));
    }

    handleKey(key) {
        if (!/^[0-9]$/.test(key)) return;

        let hit = false;

        for (let i = 0; i < this.game.dots.length; i++) {
            const dot = this.game.dots[i];
            if (dot.text === key) {
                this.game.dots.splice(i, 1);
                this.game.score += 2;

                this.game.createPopEffect(dot.x, dot.y, dot.color, '+2');
                this.game.updateHUD();
                hit = true;
                break;
            }
        }

        if (!hit) {
            this.game.score = Math.max(0, this.game.score - 2);
            audio.playError();
            this.game.triggerShake(3.0);
            this.game.updateHUD();
        }
    }

    // Disable clicking
    handleClick(x, y) { }
}
