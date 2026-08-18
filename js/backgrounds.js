/**
 * Animated Dynamic Background System for Neon Dots
 * 
 * Provides unique, mode-specific ambient backgrounds tailored to each gameplay theme.
 * Strictly designed to be non-intrusive: low contrast, soft opacities (0.03-0.12),
 * deep neon hues, and distinct geometric motifs that never conflict with gameplay dots.
 */

import { Utils } from './utils.js';

// ─── 1. PATTERN MODE: Harmonic Lissajous Waves ────────────────────────────────
class PatternBackground {
    constructor() {
        this.time = 0;
    }

    update(dt) {
        this.time += dt * 0.0008;
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const ribbons = [
            { freq: 0.002, speed: 1.0, amp: height * 0.18, yOffset: height * 0.35, color: 'rgba(0, 243, 255, 0.07)' },
            { freq: 0.003, speed: 1.4, amp: height * 0.22, yOffset: height * 0.50, color: 'rgba(188, 19, 254, 0.05)' },
            { freq: 0.0015, speed: 0.8, amp: height * 0.15, yOffset: height * 0.65, color: 'rgba(0, 255, 255, 0.06)' },
            { freq: 0.0025, speed: 1.2, amp: height * 0.20, yOffset: height * 0.50, color: 'rgba(57, 255, 20, 0.04)' }
        ];

        const step = 20;
        ribbons.forEach(ribbon => {
            ctx.beginPath();
            ctx.strokeStyle = ribbon.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 12;
            ctx.shadowColor = ribbon.color;

            for (let x = 0; x <= width; x += step) {
                const y1 = ribbon.yOffset + Math.sin(x * ribbon.freq + this.time * ribbon.speed) * ribbon.amp
                    + Math.cos(x * ribbon.freq * 0.5 + this.time * 0.6) * (ribbon.amp * 0.3);
                if (x === 0) ctx.moveTo(x, y1);
                else ctx.lineTo(x, y1);
            }
            ctx.stroke();

            // Parallel harmonic echo line
            ctx.beginPath();
            ctx.lineWidth = 1;
            for (let x = 0; x <= width; x += step) {
                const y2 = ribbon.yOffset + Math.sin(x * ribbon.freq + this.time * ribbon.speed + 0.5) * (ribbon.amp * 0.7);
                if (x === 0) ctx.moveTo(x, y2);
                else ctx.lineTo(x, y2);
            }
            ctx.stroke();
        });

        ctx.restore();
    }
}

// ─── 2. RANDOM MODE: Deep Nebula & Celestial Dust Drift ───────────────────────
class RandomBackground {
    constructor() {
        this.time = 0;
        this.dust = [];
        this.numDust = 60;
        this.initDust();
    }

    initDust() {
        this.dust = [];
        const w = typeof window !== 'undefined' ? window.innerWidth : 800;
        const h = typeof window !== 'undefined' ? window.innerHeight : 600;
        for (let i = 0; i < this.numDust; i++) {
            this.dust.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Utils.random(0.8, 2.2),
                vx: Utils.random(-0.15, 0.15),
                vy: Utils.random(-0.15, 0.15),
                phase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.5 ? 'rgba(0, 243, 255,' : 'rgba(188, 19, 254,'
            });
        }
    }

    onResize() {
        this.initDust();
    }

    update(dt) {
        this.time += dt * 0.0005;
        this.dust.forEach(d => {
            d.x += d.vx * (dt / 16);
            d.y += d.vy * (dt / 16);
            d.phase += 0.02;

            if (d.x < 0) d.x = window.innerWidth;
            if (d.x > window.innerWidth) d.x = 0;
            if (d.y < 0) d.y = window.innerHeight;
            if (d.y > window.innerHeight) d.y = 0;
        });
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        // Faint deep nebula gradients
        const g1X = width * 0.3 + Math.sin(this.time * 0.7) * (width * 0.1);
        const g1Y = height * 0.4 + Math.cos(this.time * 0.5) * (height * 0.1);
        const rad1 = ctx.createRadialGradient(g1X, g1Y, 10, g1X, g1Y, width * 0.45);
        rad1.addColorStop(0, 'rgba(0, 243, 255, 0.045)');
        rad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rad1;
        ctx.fillRect(0, 0, width, height);

        const g2X = width * 0.7 + Math.cos(this.time * 0.6) * (width * 0.1);
        const g2Y = height * 0.6 + Math.sin(this.time * 0.8) * (height * 0.1);
        const rad2 = ctx.createRadialGradient(g2X, g2Y, 10, g2X, g2Y, width * 0.4);
        rad2.addColorStop(0, 'rgba(188, 19, 254, 0.04)');
        rad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rad2;
        ctx.fillRect(0, 0, width, height);

        // Micro-dust motes
        this.dust.forEach(d => {
            const moteAlpha = 0.04 + Math.sin(d.phase) * 0.03;
            ctx.fillStyle = `${d.color}${moteAlpha})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// ─── 3. TYPING MODE: Cyber Terminal Digital Matrix Streams ────────────────────
class TypingBackground {
    constructor() {
        this.columns = [];
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}$#_~+=;:/\\';
        this.initColumns();
    }

    initColumns() {
        const colWidth = 36;
        const w = typeof window !== 'undefined' ? window.innerWidth : 800;
        const h = typeof window !== 'undefined' ? window.innerHeight : 600;
        const totalCols = Math.ceil(w / colWidth);
        this.columns = [];
        for (let i = 0; i < totalCols; i++) {
            this.columns.push({
                x: i * colWidth + 10,
                y: Math.random() * h,
                speed: Utils.random(0.6, 1.8),
                chars: this.getRandomChars(16),
                charTimer: 0
            });
        }
    }

    onResize() {
        this.initColumns();
    }

    getRandomChars(count) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(this.chars[Utils.randomInt(0, this.chars.length - 1)]);
        }
        return arr;
    }

    update(dt) {
        this.columns.forEach(col => {
            col.y += col.speed * (dt / 16);
            col.charTimer += dt;
            if (col.charTimer > 250) {
                col.charTimer = 0;
                col.chars[Utils.randomInt(0, col.chars.length - 1)] = this.chars[Utils.randomInt(0, this.chars.length - 1)];
            }
            if (col.y > window.innerHeight + 300) {
                col.y = -200;
                col.chars = this.getRandomChars(16);
                col.speed = Utils.random(0.6, 1.8);
            }
        });
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';

        this.columns.forEach(col => {
            const len = col.chars.length;
            for (let j = 0; j < len; j++) {
                const charY = col.y - j * 16;
                if (charY < -20 || charY > height + 20) continue;

                if (j === 0) {
                    ctx.fillStyle = 'rgba(0, 243, 255, 0.14)'; // Leader glyph
                } else {
                    const fade = (1 - (j / len)) * 0.05;
                    ctx.fillStyle = `rgba(0, 200, 255, ${fade})`;
                }
                ctx.fillText(col.chars[j], col.x, charY);
            }
        });

        ctx.restore();
    }
}

// ─── 4. NUMBER RUSH: Isometric Hex Grid & Pulsing Data Rings ──────────────────
class NumberRushBackground {
    constructor() {
        this.time = 0;
        this.pulse = 0;
    }

    update(dt) {
        this.time += dt * 0.0006;
        this.pulse = (this.pulse + dt * 0.001) % 1;
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const hexSize = 55;
        const hexH = hexSize * Math.sqrt(3);
        const offsetX = (this.time * 20) % (hexSize * 3);
        const offsetY = (this.time * 12) % hexH;

        ctx.strokeStyle = 'rgba(0, 243, 255, 0.035)';
        ctx.lineWidth = 1;

        for (let x = -hexSize * 2 - offsetX; x < width + hexSize * 2; x += hexSize * 3) {
            for (let y = -hexH - offsetY; y < height + hexH; y += hexH) {
                this.drawHexagon(ctx, x, y, hexSize * 0.95);
                this.drawHexagon(ctx, x + hexSize * 1.5, y + hexH * 0.5, hexSize * 0.95);
            }
        }

        // Central telemetry concentric rings with tick marks
        const cx = width / 2;
        const cy = height / 2;
        const baseRad = Math.min(width, height) * 0.35;

        for (let i = 1; i <= 3; i++) {
            const rad = baseRad * (i * 0.35) + Math.sin(this.time * 2 + i) * 8;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.03 + i * 0.015})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 14]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }

    drawHexagon(ctx, x, y, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + r * Math.cos(angle);
            const hy = y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
    }
}

// ─── 5. COLOR MATCH: Prismatic Aurora Borealis ────────────────────────────────
class ColorMatchBackground {
    constructor() {
        this.time = 0;
    }

    update(dt) {
        this.time += dt * 0.0004;
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const bands = [
            { hueOffset: 0, yRatio: 0.3, speed: 0.8, amp: height * 0.15 },
            { hueOffset: 120, yRatio: 0.5, speed: 1.1, amp: height * 0.20 },
            { hueOffset: 240, yRatio: 0.7, speed: 0.9, amp: height * 0.16 }
        ];

        bands.forEach(band => {
            const grad = ctx.createLinearGradient(0, 0, width, height);
            const hue1 = (this.time * 25 + band.hueOffset) % 360;
            const hue2 = (hue1 + 60) % 360;

            grad.addColorStop(0, `hsla(${hue1}, 80%, 55%, 0.04)`);
            grad.addColorStop(0.5, `hsla(${hue2}, 90%, 60%, 0.06)`);
            grad.addColorStop(1, `hsla(${hue1}, 80%, 55%, 0.02)`);

            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 25) {
                const y = height * band.yRatio
                    + Math.sin(x * 0.003 + this.time * band.speed) * band.amp
                    + Math.cos(x * 0.0015 - this.time * 0.5) * (band.amp * 0.4);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        });

        ctx.restore();
    }
}

// ─── 6. SEQUENCE MODE: Circuit Board PCB & Chrono Pathways ────────────────────
class SequenceBackground {
    constructor() {
        this.time = 0;
        this.circuits = [];
        this.initCircuits();
    }

    initCircuits() {
        this.circuits = [];
        const numPaths = 18;
        const w = typeof window !== 'undefined' ? window.innerWidth : 800;
        const h = typeof window !== 'undefined' ? window.innerHeight : 600;

        for (let i = 0; i < numPaths; i++) {
            const startX = Utils.random(50, w - 50);
            const startY = Utils.random(50, h - 50);
            const seg1Len = Utils.random(60, 180);
            const dirX = Math.random() > 0.5 ? 1 : -1;
            const dirY = Math.random() > 0.5 ? 1 : -1;

            const p1 = { x: startX, y: startY };
            const p2 = { x: startX + seg1Len * dirX, y: startY };
            const p3 = { x: p2.x + 40 * dirX, y: p2.y + 40 * dirY };
            const p4 = { x: p3.x, y: p3.y + Utils.random(60, 150) * dirY };

            this.circuits.push({
                points: [p1, p2, p3, p4],
                pulseProgress: Math.random(),
                pulseSpeed: Utils.random(0.002, 0.005)
            });
        }
    }

    onResize() {
        this.initCircuits();
    }

    update(dt) {
        this.time += dt * 0.001;
        this.circuits.forEach(c => {
            c.pulseProgress += c.pulseSpeed * (dt / 16);
            if (c.pulseProgress > 1) c.pulseProgress = 0;
        });
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        // Faint orthogonal grid backdrop
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.025)';
        ctx.lineWidth = 1;
        const gridGap = 60;
        ctx.beginPath();
        for (let x = 0; x <= width; x += gridGap) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += gridGap) {
            ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Circuit traces & travelling pulses
        this.circuits.forEach(c => {
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.045)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(c.points[0].x, c.points[0].y);
            for (let i = 1; i < c.points.length; i++) {
                ctx.lineTo(c.points[i].x, c.points[i].y);
            }
            ctx.stroke();

            // Terminal small tech squares (not circles to avoid dot confusion)
            const pStart = c.points[0];
            const pEnd = c.points[c.points.length - 1];
            ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
            ctx.fillRect(pStart.x - 2, pStart.y - 2, 4, 4);
            ctx.fillRect(pEnd.x - 2, pEnd.y - 2, 4, 4);

            // Travelling pulse spark along path
            const pos = this.getPointAlongPath(c.points, c.pulseProgress);
            if (pos) {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.18)';
                ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
            }
        });

        ctx.restore();
    }

    getPointAlongPath(pts, t) {
        const segLengths = [];
        let totalLen = 0;
        for (let i = 0; i < pts.length - 1; i++) {
            const d = Utils.distance(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
            segLengths.push(d);
            totalLen += d;
        }
        let targetDist = t * totalLen;
        let accum = 0;
        for (let i = 0; i < segLengths.length; i++) {
            if (accum + segLengths[i] >= targetDist) {
                const segT = (targetDist - accum) / segLengths[i];
                return {
                    x: pts[i].x + (pts[i + 1].x - pts[i].x) * segT,
                    y: pts[i].y + (pts[i + 1].y - pts[i].y) * segT
                };
            }
            accum += segLengths[i];
        }
        return pts[pts.length - 1];
    }
}

// ─── 7. MEMORY MODE: Synaptic Neural Network & Sonar Scanner ──────────────────
class MemoryBackground {
    constructor() {
        this.time = 0;
        this.sonarRings = [0, 0.33, 0.66];
        this.nodes = [];
        this.initNodes();
    }

    initNodes() {
        this.nodes = [];
        const count = 28;
        const w = typeof window !== 'undefined' ? window.innerWidth : 800;
        const h = typeof window !== 'undefined' ? window.innerHeight : 600;
        for (let i = 0; i < count; i++) {
            this.nodes.push({
                x: Utils.random(60, w - 60),
                y: Utils.random(60, h - 60),
                vx: Utils.random(-0.2, 0.2),
                vy: Utils.random(-0.2, 0.2)
            });
        }
    }

    onResize() {
        this.initNodes();
    }

    update(dt) {
        this.time += dt * 0.001;
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.nodes.forEach(n => {
            n.x += n.vx * (dt / 16);
            n.y += n.vy * (dt / 16);
            if (n.x < 40 || n.x > w - 40) n.vx *= -1;
            if (n.y < 40 || n.y > h - 40) n.vy *= -1;
        });

        for (let i = 0; i < this.sonarRings.length; i++) {
            this.sonarRings[i] = (this.sonarRings[i] + dt * 0.0003) % 1;
        }
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const cx = width / 2;
        const cy = height / 2;
        const maxRadius = Math.sqrt(width * width + height * height) * 0.55;

        // Sonar expanding scanner rings
        this.sonarRings.forEach(prog => {
            const rad = prog * maxRadius;
            const ringAlpha = Math.sin(prog * Math.PI) * 0.05;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(191, 90, 242, ${ringAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Neural network interconnecting filaments
        ctx.lineWidth = 1;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dist = Utils.distance(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y);
                if (dist < 180) {
                    const lineAlpha = (1 - dist / 180) * 0.04;
                    ctx.strokeStyle = `rgba(191, 90, 242, ${lineAlpha})`;
                    ctx.beginPath();
                    ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }
}

// ─── 8. SURVIVAL MODE: Hyperdrive Warp Speed Tunnel ───────────────────────────
class SurvivalBackground {
    constructor() {
        this.stars = [];
        this.numStars = 80;
        this.initStars();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Utils.random(10, 80);
        return {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            z: Utils.random(1, 1000),
            prevZ: 1000,
            color: Math.random() > 0.4 ? 'rgba(255, 0, 110,' : 'rgba(0, 243, 255,'
        };
    }

    update(dt) {
        const speed = 12 * (dt / 16);
        this.stars.forEach(s => {
            s.prevZ = s.z;
            s.z -= speed;
            if (s.z <= 0) {
                s.z = 1000;
                s.prevZ = 1000;
                const angle = Math.random() * Math.PI * 2;
                const dist = Utils.random(10, 80);
                s.x = Math.cos(angle) * dist;
                s.y = Math.sin(angle) * dist;
            }
        });
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const cx = width / 2;
        const cy = height / 2;

        this.stars.forEach(s => {
            const k = 400 / s.z;
            const px = cx + s.x * k;
            const py = cy + s.y * k;

            const prevK = 400 / s.prevZ;
            const prevPx = cx + s.x * prevK;
            const prevPy = cy + s.y * prevK;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
                const starAlpha = (1 - s.z / 1000) * 0.08;
                ctx.beginPath();
                ctx.moveTo(prevPx, prevPy);
                ctx.lineTo(px, py);
                ctx.strokeStyle = `${s.color}${starAlpha})`;
                ctx.lineWidth = Math.max(1, (1 - s.z / 1000) * 2.5);
                ctx.stroke();
            }
        });

        ctx.restore();
    }
}

// ─── 9. CHAOS MODE: Quantum Gravitational Vortex & Energy Glitch ──────────────
class ChaosBackground {
    constructor() {
        this.time = 0;
        this.scanlineY = 0;
    }

    update(dt) {
        this.time += dt * 0.0012;
        this.scanlineY = (this.scanlineY + dt * 0.3) % window.innerHeight;
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const cx = width / 2 + Math.sin(this.time * 0.8) * (width * 0.08);
        const cy = height / 2 + Math.cos(this.time * 0.6) * (height * 0.08);
        const maxRad = Math.min(width, height) * 0.45;

        // Rotating spiral arms
        ctx.lineWidth = 1.5;
        for (let arm = 0; arm < 3; arm++) {
            const armAngle = (arm * Math.PI * 2) / 3 + this.time * 0.5;
            ctx.beginPath();
            const color = arm === 0 ? 'rgba(255, 0, 255, 0.06)' : arm === 1 ? 'rgba(0, 243, 255, 0.06)' : 'rgba(57, 255, 20, 0.05)';
            ctx.strokeStyle = color;

            for (let r = 20; r < maxRad; r += 12) {
                const theta = armAngle + r * 0.015;
                const sx = cx + Math.cos(theta) * r;
                const sy = cy + Math.sin(theta) * r;
                if (r === 20) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }

        // Faint horizontal cyber scanline
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.scanlineY);
        ctx.lineTo(width, this.scanlineY);
        ctx.stroke();

        ctx.restore();
    }
}

// ─── 10. MENU / DEFAULT MODE: Retro Synthwave Horizon Perspective Grid ────────
class MenuBackground {
    constructor() {
        this.time = 0;
    }

    update(dt) {
        this.time += dt * 0.0006;
    }

    draw(ctx, width, height, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const horizonY = height * 0.55;
        const vanishX = width / 2;

        // Subtle horizon aura
        const aura = ctx.createRadialGradient(vanishX, horizonY, 5, vanishX, horizonY, width * 0.6);
        aura.addColorStop(0, 'rgba(0, 243, 255, 0.06)');
        aura.addColorStop(0.5, 'rgba(188, 19, 254, 0.03)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, width, height);

        // Perspective vertical vanishing lines
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
        ctx.lineWidth = 1;
        const numVLines = 24;
        for (let i = -numVLines; i <= numVLines; i++) {
            const bottomX = vanishX + i * (width * 0.08);
            ctx.beginPath();
            ctx.moveTo(vanishX, horizonY);
            ctx.lineTo(bottomX, height);
            ctx.stroke();
        }

        // Horizontal moving perspective grid lines
        const numHLines = 12;
        const scroll = (this.time * 2.0) % 1.0;
        for (let i = 0; i < numHLines; i++) {
            const norm = (i + scroll) / numHLines;
            const expNorm = Math.pow(norm, 2.5); // Perspective compression
            const y = horizonY + expNorm * (height - horizonY);
            const lineAlpha = expNorm * 0.07;
            ctx.strokeStyle = `rgba(0, 243, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ─── MASTER BACKGROUND MANAGER ────────────────────────────────────────────────
export class BackgroundManager {
    constructor() {
        this.backgrounds = {
            'Pattern Mode': new PatternBackground(),
            'Random Mode': new RandomBackground(),
            'Typing Mode': new TypingBackground(),
            'Number Rush': new NumberRushBackground(),
            'Color Match': new ColorMatchBackground(),
            'Sequence Mode': new SequenceBackground(),
            'Memory Mode': new MemoryBackground(),
            'Survival Mode': new SurvivalBackground(),
            'Chaos Mode': new ChaosBackground(),
            'Menu': new MenuBackground()
        };

        this.currentModeName = 'Menu';
        this.previousModeName = null;
        this.transition = 1.0; // 0 (start) to 1 (fully switched)
        this.transitionSpeed = 2.5; // ~0.4s smooth crossfade

        // Handle window resize dynamically
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                Object.values(this.backgrounds).forEach(bg => {
                    if (bg && typeof bg.onResize === 'function') {
                        bg.onResize();
                    }
                });
            });
        }
    }

    setMode(modeName) {
        if (!this.backgrounds[modeName]) {
            modeName = 'Menu';
        }
        if (this.currentModeName !== modeName) {
            this.previousModeName = this.currentModeName;
            this.currentModeName = modeName;
            this.transition = 0.0;
        }
    }

    update(dt, modeName, gameState) {
        // Determine target background
        let target = modeName;
        if (gameState === 'MENU' && modeName) {
            // In menu, we preview the selected mode's background!
            target = modeName;
        } else if (!target || !this.backgrounds[target]) {
            target = 'Menu';
        }

        if (this.currentModeName !== target) {
            this.setMode(target);
        }

        // Progress crossfade transition
        if (this.transition < 1.0) {
            this.transition += (dt / 1000) * this.transitionSpeed;
            if (this.transition > 1.0) this.transition = 1.0;
        }

        // Update active and outgoing backgrounds
        if (this.backgrounds[this.currentModeName]) {
            this.backgrounds[this.currentModeName].update(dt);
        }
        if (this.previousModeName && this.transition < 1.0 && this.backgrounds[this.previousModeName]) {
            this.backgrounds[this.previousModeName].update(dt);
        }
    }

    draw(ctx, width, height) {
        if (this.transition < 1.0 && this.previousModeName && this.backgrounds[this.previousModeName]) {
            // Draw outgoing background with crossfade
            this.backgrounds[this.previousModeName].draw(ctx, width, height, 1.0 - this.transition);
            // Draw incoming background
            if (this.backgrounds[this.currentModeName]) {
                this.backgrounds[this.currentModeName].draw(ctx, width, height, this.transition);
            }
        } else {
            // Draw current background at full intensity
            if (this.backgrounds[this.currentModeName]) {
                this.backgrounds[this.currentModeName].draw(ctx, width, height, 1.0);
            }
        }
    }
}
