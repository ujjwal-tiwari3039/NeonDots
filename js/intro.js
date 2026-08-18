export class IntroSequence {
    constructor() {
        this.introScreen = document.getElementById('introScreen');
        if (!this.introScreen) return;
        
        this.canvas = document.getElementById('introCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.title = document.getElementById('introTitle');
        this.prompt = document.getElementById('introPrompt');
        
        this.particles = [];
        this.animationId = null;
        this.isActive = true;
        this.audioCtx = null;
        
        // Prevent interactions with main menu while intro is active
        this.introScreen.addEventListener('click', (e) => e.stopPropagation());
        
        this.init();
    }

    init() {
        // Resize canvas
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        // Create lightweight particles
        for(let i = 0; i < 40; i++) {
            this.particles.push(this.createParticle());
        }

        // Start render loop
        this.render();

        // Sequence timing: wait 2.5s before showing title
        setTimeout(() => this.showTitle(), 2500);
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.2, // Very slow moving
            vy: (Math.random() - 0.5) * 0.2,
            life: Math.random(),
            color: Math.random() > 0.5 ? '#00f3ff' : '#0ff' // Neon Cyan variations
        };
    }

    render() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = 0.2 + Math.sin(p.life * Math.PI * 2) * 0.2; // Soft twinkle
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            
            p.life += 0.003;
        });

        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;

        this.animationId = requestAnimationFrame(() => this.render());
    }

    showTitle() {
        if (!this.isActive) return;

        const letters = Array.from(this.title.querySelectorAll('.intro-letter'));
        
        // Try to play synth sound (browsers might block it until interaction, which is fine)
        this.playSynthSound();

        letters.forEach((letter, index) => {
            setTimeout(() => {
                if (!this.isActive) return;
                letter.classList.add('visible');
                
                // Add soft pulse after it's fully visible
                setTimeout(() => {
                    if (!this.isActive) return;
                    letter.classList.add('pulse');
                }, 1500);

            }, index * 200); // Staggered fade in
        });

        // Start zoom effect
        setTimeout(() => {
            if (!this.isActive) return;
            this.title.classList.add('zoom');
        }, 100);

        // Show prompt after title
        setTimeout(() => this.showPrompt(), letters.length * 200 + 1000);
    }

    showPrompt() {
        if (!this.isActive) return;
        this.prompt.classList.add('visible');
        
        // Listen for input to close intro
        const completeIntro = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.playClickSound();
            this.finish();
            window.removeEventListener('keydown', completeIntro);
            window.removeEventListener('click', completeIntro);
            window.removeEventListener('touchstart', completeIntro);
        };

        window.addEventListener('keydown', completeIntro, { passive: false });
        window.addEventListener('click', completeIntro, { passive: false });
        window.addEventListener('touchstart', completeIntro, { passive: false });
    }

    finish() {
        this.introScreen.classList.add('hidden');
        
        // Let transition finish before stopping
        setTimeout(() => {
            this.isActive = false;
            cancelAnimationFrame(this.animationId);
            this.introScreen.remove(); // Clean up DOM
            if (this.audioCtx && this.audioCtx.state !== 'closed') {
                this.audioCtx.close().catch(() => {});
            }
        }, 1500);
    }
    
    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playSynthSound() {
        try {
            this.initAudio();
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            const filter = this.audioCtx.createBiquadFilter();

            // Setup oscillator
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, this.audioCtx.currentTime); // A3
            osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 3); // Sweep to A4

            // Filter for soft sound
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            
            // Envelope for fade in/out
            gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 2); // Soft volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 5);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 5);
        } catch(e) {
            console.log("Audio playback requires interaction first");
        }
    }

    playClickSound() {
        try {
            this.initAudio();
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, this.audioCtx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } catch(e) {
            // Silently ignore if audio can't play
        }
    }
}
