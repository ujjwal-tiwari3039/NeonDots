import { BaseMode } from './base-mode.js';
import { Dot } from '../entities/dot.js';
import { Particle } from '../entities/particle.js';
import { Utils } from '../utils.js';
import { audio } from '../audio.js';
import { PatternManager } from '../pattern.js';

class ChaosDot extends Dot {
    constructor(x, y, text, color, isBouncing, width, height, speedMultiplier) {
        super(x, y, text, color);
        this.isBouncing = isBouncing;
        
        if (isBouncing) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(1, 3) * speedMultiplier;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }
    
    update(width, height) {
        super.update(width, height);
        
        if (this.isBouncing) {
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
}

export class ChaosMode extends BaseMode {
    constructor(game) {
        super(game);
        this.name = 'Chaos Mode';
        
        this.baseSpawnRate = 800; // Aggressive
        this.minSpawnRate = 150;
        this.maxDots = 20;
        this.patternManager = new PatternManager(40);
        this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.numbers = '0123456789';
    }

    onStart() {
        this.spawnTimer = 0;
        this.currentSpawnRate = this.baseSpawnRate;
        this.patternManager.reset();
    }

    update(dt) {
        const targetRate = this.baseSpawnRate * Math.pow(0.5, this.game.survivalTime / 15.0); // Very aggressive
        this.currentSpawnRate = Math.max(this.minSpawnRate, targetRate);
        const speedMultiplier = 1.0 + (this.game.level * 0.15);
        
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.currentSpawnRate) {
            this.spawnTimer = 0;
            
            if (this.game.dots.length < this.maxDots) {
                this.spawnChaosDot(speedMultiplier);
            } else {
                this.game.gameOver();
                return;
            }
        }
    }

    spawnChaosDot(speedMultiplier) {
        const type = Utils.randomInt(0, 3); // 0: Pattern, 1: Random, 2: Typing, 3: Bouncing
        let x, y, text = null, isBouncing = false;
        const margin = 50;

        if (type === 0) {
            const pos = this.patternManager.getNextPosition(this.game.renderer.width, this.game.renderer.height);
            x = pos.x;
            y = pos.y;
        } else {
            x = Utils.randomInt(margin, this.game.renderer.width - margin);
            y = Utils.randomInt(margin, this.game.renderer.height - margin);
        }

        if (type === 2) {
            // Typing (Letter or Number)
            const isLetter = Utils.randomInt(0, 1) === 0;
            const pool = isLetter ? this.letters : this.numbers;
            text = pool[Utils.randomInt(0, pool.length - 1)];
        } else if (type === 3) {
            isBouncing = true;
        }

        this.game.dots.push(new ChaosDot(x, y, text, null, isBouncing, this.game.renderer.width, this.game.renderer.height, speedMultiplier));
    }

    handleKey(key) {
        const upperKey = key.toUpperCase();
        let hit = false;
        
        for (let i = 0; i < this.game.dots.length; i++) {
            const dot = this.game.dots[i];
            if (dot.text && dot.text === upperKey) {
                this.game.dots.splice(i, 1);
                this.game.score += 3; // Bonus for typing in chaos
                audio.playPop();
                
                for (let p = 0; p < 10; p++) {
                    this.game.particles.push(new Particle(dot.x, dot.y, dot.color));
                }
                
                this.game.updateHUD();
                hit = true;
                break;
            }
        }
        
        // No penalty for wrong key in Chaos mode to prevent unfairness
    }

    handleClick(x, y) {
        for (let i = this.game.dots.length - 1; i >= 0; i--) {
            const dot = this.game.dots[i];
            
            // Don't allow clicking typed dots
            if (dot.text) continue; 

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
