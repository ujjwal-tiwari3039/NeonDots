class AudioController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            } else {
                this.enabled = false;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playOscillator(type, frequency, duration, volume = 0.1, sweep = false) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;

        if (sweep) {
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(Math.max(10, frequency * 0.1), this.ctx.currentTime + duration);
        } else {
            osc.frequency.value = frequency;
        }

        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHover() {
        this.playOscillator('sine', 520, 0.06, 0.03);
    }

    playClick() {
        this.playOscillator('triangle', 880, 0.08, 0.06);
    }

    // Dynamic punchy electronic bubble pop with snappy transient
    playPop(pitchMultiplier = 1.0) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const baseFreq = 1350 * pitchMultiplier;

        // Layer 1: High transient punch
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'sine';
        punchOsc.frequency.setValueAtTime(baseFreq * 1.5, now);
        punchOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08);

        punchGain.gain.setValueAtTime(0.18, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        punchOsc.connect(punchGain);
        punchGain.connect(this.ctx.destination);
        punchOsc.start(now);
        punchOsc.stop(now + 0.08);

        // Layer 2: Warm resonant body pop
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(baseFreq * 0.8, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, now + 0.12);

        bodyGain.gain.setValueAtTime(0.12, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.12);
    }

    // Interactive soft screen tap tick
    playTap() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    playError() {
        this.playOscillator('sawtooth', 160, 0.2, 0.08, true);
    }

    playGameOver() {
        this.playOscillator('sawtooth', 220, 0.8, 0.12, true);
    }

    playHighScore() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => this.playOscillator('square', freq, 0.18, 0.06), idx * 90);
        });
    }
}

export const audio = new AudioController();
