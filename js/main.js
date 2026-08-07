import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';
import { InputManager } from './input.js';
import { Game } from './game.js';
import { PatternMode } from './modes/pattern-mode.js';
import { RandomMode } from './modes/random-mode.js';
import { TypingMode } from './modes/typing-mode.js';
import { NumberRushMode } from './modes/number-rush-mode.js';
import { ColorMatchMode } from './modes/color-match-mode.js';
import { SequenceMode } from './modes/sequence-mode.js';
import { MemoryMode } from './modes/memory-mode.js';
import { SurvivalMode } from './modes/survival-mode.js';
import { ChaosMode } from './modes/chaos-mode.js';

// Setup
const renderer = new Renderer('gameCanvas');
const uiManager = new UIManager();
const game = new Game(renderer, uiManager);

// Bind UI and setup
uiManager.game = game;
uiManager.setupButtons();

// Define modes
const modes = [
    new PatternMode(game),
    new RandomMode(game),
    new TypingMode(game),
    new NumberRushMode(game),
    new ColorMatchMode(game),
    new SequenceMode(game),
    new MemoryMode(game),
    new SurvivalMode(game),
    new ChaosMode(game)
];

// Initialize mode selection UI
uiManager.renderModeSelection(modes, (selectedMode) => {
    game.setMode(selectedMode);
});

const inputManager = new InputManager(
    renderer.canvas,
    (x, y) => game.handleClick(x, y),
    (key) => game.handleKey(key)
);

game.init();

// Game Loop
let lastTime = 0;

function loop(timestamp) {
    let dt = timestamp - lastTime;

    // Prevent huge delta times when tab is inactive
    if (dt > 100) dt = 100;

    lastTime = timestamp;

    game.update(dt);
    game.draw();

    requestAnimationFrame(loop);
}

// Start loop
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    loop(timestamp);
});
