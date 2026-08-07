class AudioController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        // Lazily initialize context on first user interaction
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
        if (!this.enabled || !this.ctx) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;

        if (sweep) {
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.ctx.currentTime + duration);
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
        this.playOscillator('sine', 440, 0.1, 0.05);
    }

    playClick() {
        this.playOscillator('square', 880, 0.1, 0.05);
    }

    playPop() {
        // High pitched short pop with sweep down
        this.playOscillator('sine', 1200, 0.15, 0.1, true);
    }

    playGameOver() {
        // Low descending tone
        this.playOscillator('sawtooth', 200, 1.0, 0.1, true);
    }

    playHighScore() {
        // Simple arpeggio
        this.playOscillator('square', 440, 0.2, 0.05);
        setTimeout(() => this.playOscillator('square', 554, 0.2, 0.05), 100);
        setTimeout(() => this.playOscillator('square', 659, 0.4, 0.05), 200);
    }
}

export const audio = new AudioController();
