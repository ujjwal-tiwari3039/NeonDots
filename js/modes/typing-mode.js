import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class TypingMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Typing Mode';

        this.baseSpawnRate = 1200;
        this.minSpawnRate = 300;
        this.maxDots = 10; // Less dots because it gets overwhelming quickly
        this.combo = 0;

        this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    onStart() {
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
        this.combo = 0;
    }

    update(dt) {
        // Very fast progression for typing mode as requested
        const targetRate = this.baseSpawnRate * Math.pow(0.5, this.game.survivalTime / 15.0);
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

        // Pick a letter not currently on screen to avoid ambiguity
        let availableLetters = this.letters.split('');
        for (const dot of this.game.dots) {
            availableLetters = availableLetters.filter(l => l !== dot.text);
        }

        if (availableLetters.length === 0) availableLetters = this.letters.split('');

        const letter = availableLetters[Utils.randomInt(0, availableLetters.length - 1)];

        this.game.dots.push(new Dot(x, y, letter));
    }

    handleKey(key) {
        if (!/^[a-zA-Z]$/.test(key)) return; // Ignore non-letters

        const upperKey = key.toUpperCase();
        let hit = false;

        for (let i = 0; i < this.game.dots.length; i++) {
            const dot = this.game.dots[i];
            if (dot.text === upperKey) {
                // Correct!
                this.game.dots.splice(i, 1);
                this.combo++;
                this.game.score += this.combo; // Score based on combo
                audio.playPop();

                for (let p = 0; p < 10; p++) {
                    this.game.particles.push(new Particle(dot.x, dot.y, dot.color));
                }

                this.game.updateHUD();
                hit = true;
                break;
            }
        }

        if (!hit) {
            // Penalty
            this.combo = 0;
            this.game.score = Math.max(0, this.game.score - 5);
            this.game.updateHUD();
            // Optional: play an error sound
        }
    }

    // Disable clicking for typing mode
    handleClick(x, y) { }
}
