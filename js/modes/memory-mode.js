import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';

export class MemoryMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Memory Mode';
        
        this.numDots = 3;
        this.viewTime = 3000;
        this.state = 'VIEWING'; // VIEWING, RECALLING
        this.timer = 0;
    }

    onStart() {
        this.numDots = 3;
        this.startRound();
    }
    
    startRound() {
        this.game.dots = [];
        this.state = 'VIEWING';
        this.timer = 0;
        this.viewTime = Math.max(1000, 3000 - (this.numDots * 200)); 
        
        for (let i = 0; i < this.numDots; i++) {
            this.spawnDot();
        }
    }

    spawnDot() {
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
        
        this.game.dots.push(new Dot(x, y));
    }

    update(dt) {
        if (this.state === 'VIEWING') {
            this.timer += dt;
            if (this.timer >= this.viewTime) {
                this.state = 'RECALLING';
                this.game.dots.forEach(dot => dot.hidden = true);
            }
        } else if (this.state === 'RECALLING') {
            // Time limit to recall? Let's give them 10 seconds.
            this.timer += dt;
            if (this.timer >= this.viewTime + 10000) {
                this.game.gameOver();
            }
        }
    }

    handleClick(x, y) {
        if (this.state !== 'RECALLING') return;

        let hit = false;
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            const dist = Utils.distance(x, y, dot.x, dot.y);
            
            if (dist <= dot.radius * 2) { // Extremely generous for memory
                this.game.dots.splice(i, 1);
                this.game.score++;

                this.game.createPopEffect(dot.x, dot.y, dot.color, 'FOUND!');
                this.game.updateHUD();
                hit = true;

                if (this.game.dots.length === 0) {
                    this.numDots++;
                    this.startRound();
                }
                return;
            }
        }

        // If clicked on nothing in recalling state, round fails
        if (!hit) {
            audio.playError();
            this.game.triggerShake(5.0);
            this.game.gameOver();
        }
    }

    draw(ctx) {
        if (this.state === 'VIEWING') {
            const remaining = 1.0 - (this.timer / this.viewTime);
            const width = this.game.renderer.width * 0.8;
            const x = this.game.renderer.width * 0.1;
            const y = 80;
            
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x, y, width, 10);
            
            ctx.fillStyle = '#0ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0ff';
            ctx.fillRect(x, y, width * remaining, 10);
            
            ctx.font = 'bold 24px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('MEMORIZE', this.game.renderer.width / 2, 60);
            ctx.restore();
        }
    }
}
