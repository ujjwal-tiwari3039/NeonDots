import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class SequenceMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Sequence Mode';

        this.sequenceLength = 3;
        this.currentExpected = 1;
        this.roundTimer = 0;
        this.timeLimit = 10000; // 10 seconds to click the sequence
    }

    onStart() {
        this.sequenceLength = 3;
        this.startRound();
    }

    startRound() {
        this.game.dots = [];
        this.currentExpected = 1;
        this.roundTimer = 0;

        // Increase time limit slightly with more dots, but less per dot
        this.timeLimit = 5000 + (this.sequenceLength * 1000);

        for (let i = 1; i <= this.sequenceLength; i++) {
            this.spawnDot(i);
        }
    }

    spawnDot(number) {
        let x, y;
        let valid = false;
        let attempts = 0;

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

        this.game.dots.push(new Dot(x, y, number.toString()));
    }

    update(dt) {
        // In sequence mode, we race against a timer rather than continuous spawning
        this.roundTimer += dt;

        if (this.roundTimer >= this.timeLimit) {
            this.game.gameOver();
        }
    }

    handleClick(x, y) {
        // Reverse loop to click dots on top first
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            const dist = Utils.distance(x, y, dot.x, dot.y);

            if (dist <= dot.radius * 1.5) {
                if (parseInt(dot.text) === this.currentExpected) {
                    // Correct!
                    this.game.dots.splice(i, 1);
                    this.game.score++;

                    this.game.createPopEffect(dot.x, dot.y, dot.color, `✓ #${dot.text}`, this.currentExpected);
                    this.currentExpected++;
                    this.game.updateHUD();

                    // Round complete?
                    if (this.game.dots.length === 0) {
                        this.sequenceLength++;
                        this.startRound();
                    }
                } else {
                    // Wrong order -> Round fails!
                    audio.playError();
                    this.game.triggerShake(5.0);
                    this.game.gameOver();
                }
                return;
            }
        }
    }

    draw(ctx) {
        // Draw timer bar
        const remaining = 1.0 - (this.roundTimer / this.timeLimit);
        const width = this.game.renderer.width * 0.8;
        const x = this.game.renderer.width * 0.1;
        const y = 80;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x, y, width, 10);

        ctx.fillStyle = remaining < 0.2 ? '#ff0000' : '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(x, y, width * remaining, 10);
        ctx.restore();
    }
}
