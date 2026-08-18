import { Utils } from './utils.js';
import { audio } from './audio.js';
import { BackgroundManager } from './backgrounds.js';
import { SparkParticle, Shockwave, StarBurst, FloatingText, TapRipple } from './entities/particle.js';

export class Game {
    constructor(renderer, uiManager) {
        this.renderer = renderer;
        this.ui = uiManager;
        this.backgroundManager = new BackgroundManager();

        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        this.currentMode = null;

        this.dots = [];
        this.particles = [];

        this.score = 0;
        this.survivalTime = 0;
        this.lastTime = 0;
        this.level = 1;
        this.screenShake = 0;

        this.highScores = JSON.parse(localStorage.getItem('neonDotsHighScores')) || {};
    }

    setMode(mode) {
        this.currentMode = mode;
        this.backgroundManager.setMode(mode.name);
        this.ui.updateModeSelection(mode.name, this.getHighScore());
    }

    getHighScore() {
        if (!this.currentMode) return 0;
        return this.highScores[this.currentMode.name] || 0;
    }

    saveHighScore() {
        if (!this.currentMode) return false;

        const currentBest = this.getHighScore();
        if (this.score > currentBest) {
            this.highScores[this.currentMode.name] = this.score;
            localStorage.setItem('neonDotsHighScores', JSON.stringify(this.highScores));
            return true;
        }
        return false;
    }

    init() {
        this.ui.showMainMenu(this.getHighScore());
    }

    start() {
        if (!this.currentMode) return;

        this.state = 'PLAYING';
        this.dots = [];
        this.particles = [];
        this.score = 0;
        this.survivalTime = 0;
        this.level = 1;

        this.currentMode.onStart();

        this.lastTime = performance.now();

        this.ui.showHUD();
        this.updateHUD();
    }

    updateHUD() {
        this.ui.updateHUD(this.score, Utils.formatTime(this.survivalTime), this.level);
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.showPauseMenu();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.lastTime = performance.now();
            this.ui.hidePauseMenu();
        }
    }

    showMainMenu() {
        this.state = 'MENU';
        this.ui.showMainMenu(this.getHighScore());
    }

    gameOver() {
        this.state = 'GAMEOVER';
        audio.playGameOver();

        let newHighScore = this.saveHighScore();
        if (newHighScore) {
            setTimeout(() => audio.playHighScore(), 1000);
        }

        this.ui.showGameOver(this.score, this.getHighScore(), Utils.formatTime(this.survivalTime));
    }

    triggerShake(amount = 3.5) {
        this.screenShake = Math.max(this.screenShake, amount);
    }

    createPopEffect(x, y, color, scoreText = '+1', combo = 1) {
        // 1. Audio pop with combo pitch scaling
        const pitchMultiplier = 1.0 + Math.min(0.6, (combo - 1) * 0.08);
        audio.playPop(pitchMultiplier);

        // 2. Tactile micro screen impulse
        this.triggerShake(combo > 2 ? 5.0 : 3.5);

        // 3. Expanding neon shockwave ring
        this.particles.push(new Shockwave(x, y, color, 65));

        // 4. Instant bright starburst flash
        this.particles.push(new StarBurst(x, y, color));

        // 5. High-velocity friction-drag spark burst
        const sparkCount = Utils.randomInt(14, 20);
        for (let p = 0; p < sparkCount; p++) {
            this.particles.push(new SparkParticle(x, y, color, combo > 1 ? 1.2 : 1.0));
        }

        // 6. Floating pop score text
        if (scoreText) {
            this.particles.push(new FloatingText(x, y - 10, scoreText, color));
        }
    }

    handleClick(x, y) {
        if (this.state !== 'PLAYING' || !this.currentMode) return;

        // Subtle interactive tap ripple under finger / cursor
        this.particles.push(new TapRipple(x, y));

        this.currentMode.handleClick(x, y);
    }

    handleKey(key) {
        if (this.state !== 'PLAYING' || !this.currentMode) return;
        this.currentMode.handleKey(key);
    }

    update(dt) {
        // Always animate mode background regardless of state
        this.backgroundManager.update(dt, this.currentMode ? this.currentMode.name : 'Menu', this.state);

        // Decay screen shake
        if (this.screenShake > 0) {
            this.screenShake *= 0.85;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        // Update all active particle / shockwave / text entities
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (this.state !== 'PLAYING' || !this.currentMode) return;

        this.survivalTime += dt / 1000;
        this.level = Math.floor(this.survivalTime / 10) + 1;
        this.updateHUD();

        // Mode handles spawning and specialized logic
        this.currentMode.update(dt);

        // Common entity updates
        this.dots.forEach(dot => dot.update(this.renderer.width, this.renderer.height));
    }

    draw() {
        this.renderer.clear();

        const ctx = this.renderer.ctx;
        ctx.save();

        // Apply dynamic micro screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            ctx.translate(shakeX, shakeY);
        }

        // 1. Draw animated mode-specific background underneath gameplay
        this.backgroundManager.draw(ctx, this.renderer.width, this.renderer.height);

        // 2. Draw dots and particles
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.dots.forEach(dot => dot.draw(ctx));
            this.particles.forEach(p => p.draw(ctx));

            if (this.currentMode && this.currentMode.draw) {
                this.currentMode.draw(ctx);
            }
        } else {
            // Draw particles on menu/gameover as well (e.g. tap ripples)
            this.particles.forEach(p => p.draw(ctx));
        }

        ctx.restore();
    }
}
