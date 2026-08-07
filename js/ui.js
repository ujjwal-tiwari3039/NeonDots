import { audio } from './audio.js';

export class UIManager {
    constructor(game) {
        this.game = game;

        // Screens
        this.mainMenu = document.getElementById('mainMenu');
        this.hud = document.getElementById('hud');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');

        // Elements
        this.menuBestScore = document.getElementById('menuBestScore');
        this.selectedModeName = document.getElementById('selectedModeName');
        this.hudScore = document.getElementById('hudScore');
        this.hudTime = document.getElementById('hudTime');
        this.hudLevel = document.getElementById('hudLevel');
        this.gameOverScore = document.getElementById('gameOverScore');
        this.gameOverBestScore = document.getElementById('gameOverBestScore');
        this.gameOverTime = document.getElementById('gameOverTime');
        this.modeGrid = document.getElementById('modeGrid');
    }

    setupButtons() {
        this.setupButton('playBtn', () => this.game.start());
        this.setupButton('pauseBtn', () => this.game.togglePause());
        this.setupButton('resumeBtn', () => this.game.togglePause());
        this.setupButton('restartBtn', () => this.game.start());
        this.setupButton('mainMenuBtn', () => this.game.showMainMenu());
        this.setupButton('playAgainBtn', () => this.game.start());
        this.setupButton('gameOverMainMenuBtn', () => this.game.showMainMenu());
    }

    setupButton(id, callback) {
        const btn = document.getElementById(id);
        if (!btn) return;

        btn.addEventListener('mouseenter', () => audio.playHover());
        btn.addEventListener('click', () => {
            audio.playClick();
            callback();
        });
    }

    renderModeSelection(modes, onModeSelect) {
        this.modeGrid.innerHTML = '';
        modes.forEach((mode, index) => {
            const btn = document.createElement('button');
            btn.className = 'mode-btn';
            btn.innerText = mode.name;
            btn.addEventListener('mouseenter', () => audio.playHover());
            btn.addEventListener('click', () => {
                audio.playClick();
                // Remove selected class from all
                Array.from(this.modeGrid.children).forEach(c => c.classList.remove('selected'));
                btn.classList.add('selected');
                onModeSelect(mode);
            });
            this.modeGrid.appendChild(btn);

            // Select first mode by default
            if (index === 0) {
                btn.classList.add('selected');
                onModeSelect(mode);
            }
        });
    }

    updateModeSelection(modeName, bestScore) {
        if (this.selectedModeName) this.selectedModeName.innerText = modeName;
        if (this.menuBestScore) this.menuBestScore.innerText = bestScore;
    }

    hideAll() {
        this.mainMenu.classList.remove('active');
        this.hud.classList.add('hidden');
        this.pauseMenu.classList.remove('active');
        this.gameOverMenu.classList.remove('active');
    }

    showMainMenu(bestScore) {
        this.hideAll();
        if (this.menuBestScore) this.menuBestScore.innerText = bestScore;
        this.mainMenu.classList.add('active');
    }

    showHUD() {
        this.hideAll();
        this.hud.classList.remove('hidden');
    }

    showPauseMenu() {
        this.pauseMenu.classList.add('active');
    }

    hidePauseMenu() {
        this.pauseMenu.classList.remove('active');
    }

    showGameOver(score, bestScore, timeFormatted) {
        this.hideAll();
        this.gameOverScore.innerText = score;
        this.gameOverBestScore.innerText = bestScore;
        this.gameOverTime.innerText = timeFormatted;
        this.gameOverMenu.classList.add('active');
    }

    updateHUD(score, timeFormatted, level) {
        this.hudScore.innerText = score;
        this.hudTime.innerText = timeFormatted;
        this.hudLevel.innerText = level;
    }
}
