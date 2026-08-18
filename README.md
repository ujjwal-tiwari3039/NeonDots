# Neon Dots ⚡

A fast-paced, high-aesthetic arcade browser game built with pure HTML5 Canvas, Vanilla CSS, and Web Audio API synthesis.

---

## 🎮 Game Modes

1. **Pattern Mode**: Click dots that spawn sequentially along an infinity (Lemniscate) mathematical curve.
2. **Random Mode**: Non-overlapping random positioning testing spatial reaction speed.
3. **Typing Mode**: Type letters (A–Z) matching the glowing target dots with combo score scaling.
4. **Number Rush**: Type numbers (0–9) rapidly before the screen fills up.
5. **Color Match**: Match only the shifting target color; wrong clicks deduct points into the negative with red warning feedback.
6. **Sequence Mode**: Click numbered dots in strict ascending order against a decreasing chrono timer.
7. **Memory Mode**: Memorize dot locations before they vanish, then recall and pop them.
8. **Survival Mode**: Physics-based bouncing dots accelerating with each survival level.
9. **Chaos Mode**: Simultaneous hybrid combining pattern, random, bouncing, and typed dots.

---

## ✨ Key Features

- **Mode-Specific Animated Backgrounds**: 10 distinct, non-intrusive procedural backgrounds (Harmonic waves, Cyber matrix stream, Sonar ripples, Synthwave perspective grid, etc.) with smooth crossfades.
- **Synchronized FX & Juice**: Velocity-stretched sparks, expanding neon shockwave rings, 4-point starburst flares, floating score popups, touch ripple indicators, and tactile screen micro-impulses.
- **Procedural Sound Synthesis**: Web Audio API audio synthesis with snappy transient attacks, resonant bubble pops, combo pitch scaling, and error thuds.
- **Authentication**: Glassmorphic Supabase auth modal integration for player accounts and profiles.

---

## 🚀 How to Run Locally

1. Start the local server:
   ```bash
   npm start
   # or
   node server.js
   ```
2. Open your browser at:
   ```
   http://localhost:3000/
   ```

---

## 📂 Project Structure

```
NeonDots/
├── index.html                  # Main game viewport & UI overlays
├── package.json                # Project manifest & start script
├── server.js                   # Lightweight zero-dependency static server
├── css/
│   ├── style.css               # Neon aesthetic, HUD & screen styling
│   ├── intro.css               # Opening sequence styles & animations
│   └── auth.css                # Glassmorphic auth modals
└── js/
    ├── main.js                 # Game loop & main entry point
    ├── game.js                 # State machine & centralized pop system
    ├── backgrounds.js          # 10 mode-specific animated background engines
    ├── renderer.js             # Canvas DPI scaling & clearing
    ├── input.js                # Keyboard, touch & mouse dispatching
    ├── audio.js                # Procedural Web Audio API sound synthesizer
    ├── ui.js                   # HUD, Pause, Menu & Game Over controller
    ├── utils.js                # Math, RNG & palette constants
    ├── pattern.js              # Lemniscate pattern generator
    ├── intro.js                # Intro sequence controller
    ├── entities/
    │   ├── dot.js              # Elastic spring dot entity
    │   └── particle.js         # Particle engine (sparks, shockwaves, text, ripples)
    ├── modes/                  # 9 distinct game mode implementations
    └── supabase/               # Authentication & profile client
```
