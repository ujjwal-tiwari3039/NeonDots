import { Utils } from './utils.js';
import { audio } from './audio.js';

export class Game {
    constructor(renderer, uiManager) {
        this.renderer = renderer;
        this.ui = uiManager;

        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        this.currentMode = null;

        this.dots = [];
        this.particles = [];

        this.score = 0;
        this.survivalTime = 0;
        this.lastTime = 0;
        this.level = 1;

        this.highScores = JSON.parse(localStorage.getItem('neonDotsHighScores')) || {};
    }

    setMode(mode) {
        this.currentMode = mode;
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

    handleClick(x, y) {
        if (this.state !== 'PLAYING' || !this.currentMode) return;
        this.currentMode.handleClick(x, y);
    }

    handleKey(key) {
        if (this.state !== 'PLAYING' || !this.currentMode) return;
        this.currentMode.handleKey(key);
    }

    update(dt) {
        if (this.state !== 'PLAYING' || !this.currentMode) return;

        this.survivalTime += dt / 1000;
        this.level = Math.floor(this.survivalTime / 10) + 1;
        this.updateHUD();

        // Mode handles spawning and specialized logic
        this.currentMode.update(dt);

        // Common entity updates
        this.dots.forEach(dot => dot.update(this.renderer.width, this.renderer.height));

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.renderer.clear();

        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.dots.forEach(dot => dot.draw(this.renderer.ctx));
            this.particles.forEach(p => p.draw(this.renderer.ctx));

            if (this.currentMode && this.currentMode.draw) {
                this.currentMode.draw(this.renderer.ctx);
            }
        } else if (this.state === 'MENU' || this.state === 'GAMEOVER') {
            this.renderer.ctx.fillStyle = 'rgba(0, 243, 255, 0.05)';
            this.renderer.ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
        }
    }
}
