/**
 * Auth UI Controller
 * 
 * Dynamically builds the authentication screen (Login, Sign Up, Forgot Password)
 * and manages form interactions, validation, and auth state transitions.
 * 
 * This module is completely independent of the game engine.
 */

import { signUp, signIn, signOut, resetPassword, getSession, onAuthStateChange } from './auth.js';

class AuthUI {
    constructor() {
        this.container = document.getElementById('authScreen');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.currentView = 'login'; // 'login' | 'signup' | 'forgot'
        this.isLoading = false;

        this.buildUI();
        this.attachEvents();
        this.checkSession();
    }

    // ─── BUILD THE DOM ──────────────────────────────────────────────────────────

    buildUI() {
        this.container.innerHTML = `
            <div class="auth-backdrop"></div>
            <div class="auth-card">
                <div class="auth-logo">
                    <h1 class="auth-title">
                        <span class="auth-title-neon">NEON</span>
                        <span class="auth-title-dots">DOTS</span>
                    </h1>
                    <div class="auth-subtitle">Enter the Grid</div>
                </div>

                <!-- Tab Navigation -->
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login" id="authTabLogin">Login</button>
                    <button class="auth-tab" data-tab="signup" id="authTabSignup">Sign Up</button>
                </div>

                <!-- Login Form -->
                <form class="auth-form" id="loginForm">
                    <div class="auth-input-group">
                        <label for="loginEmail" class="auth-label">Email</label>
                        <input type="email" id="loginEmail" class="auth-input" placeholder="your@email.com" required autocomplete="email">
                    </div>
                    <div class="auth-input-group">
                        <label for="loginPassword" class="auth-label">Password</label>
                        <input type="password" id="loginPassword" class="auth-input" placeholder="••••••••" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="auth-submit-btn" id="loginSubmitBtn">
                        <span class="auth-btn-text">Log In</span>
                        <span class="auth-btn-loader hidden"></span>
                    </button>
                    <button type="button" class="auth-link-btn" id="forgotPasswordLink">Forgot password?</button>
                </form>

                <!-- Sign Up Form -->
                <form class="auth-form hidden" id="signupForm">
                    <div class="auth-input-group">
                        <label for="signupUsername" class="auth-label">Username</label>
                        <input type="text" id="signupUsername" class="auth-input" placeholder="Choose a username" required minlength="2" maxlength="30" autocomplete="username">
                    </div>
                    <div class="auth-input-group">
                        <label for="signupEmail" class="auth-label">Email</label>
                        <input type="email" id="signupEmail" class="auth-input" placeholder="your@email.com" required autocomplete="email">
                    </div>
                    <div class="auth-input-group">
                        <label for="signupPassword" class="auth-label">Password</label>
                        <input type="password" id="signupPassword" class="auth-input" placeholder="Min 6 characters" required minlength="6" autocomplete="new-password">
                    </div>
                    <div class="auth-input-group">
                        <label for="signupConfirm" class="auth-label">Confirm Password</label>
                        <input type="password" id="signupConfirm" class="auth-input" placeholder="Re-enter password" required autocomplete="new-password">
                    </div>
                    <button type="submit" class="auth-submit-btn" id="signupSubmitBtn">
                        <span class="auth-btn-text">Create Account</span>
                        <span class="auth-btn-loader hidden"></span>
                    </button>
                </form>

                <!-- Forgot Password Form -->
                <form class="auth-form hidden" id="forgotForm">
                    <p class="auth-forgot-info">Enter your email and we'll send you a password reset link.</p>
                    <div class="auth-input-group">
                        <label for="forgotEmail" class="auth-label">Email</label>
                        <input type="email" id="forgotEmail" class="auth-input" placeholder="your@email.com" required autocomplete="email">
                    </div>
                    <button type="submit" class="auth-submit-btn" id="forgotSubmitBtn">
                        <span class="auth-btn-text">Send Reset Link</span>
                        <span class="auth-btn-loader hidden"></span>
                    </button>
                    <button type="button" class="auth-link-btn" id="backToLoginLink">← Back to Login</button>
                </form>

                <!-- Message Area -->
                <div class="auth-message hidden" id="authMessage"></div>
            </div>

            <!-- Floating particles for ambiance -->
            <canvas id="authParticleCanvas" class="auth-particle-canvas"></canvas>
        `;

        // Cache DOM references
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.forgotForm = document.getElementById('forgotForm');
        this.messageEl = document.getElementById('authMessage');
        this.tabLogin = document.getElementById('authTabLogin');
        this.tabSignup = document.getElementById('authTabSignup');
        this.particleCanvas = document.getElementById('authParticleCanvas');

        // Start particle animation
        this.initParticles();
    }

    // ─── EVENT BINDINGS ─────────────────────────────────────────────────────────

    attachEvents() {
        // Tab switching
        this.tabLogin.addEventListener('click', () => this.switchView('login'));
        this.tabSignup.addEventListener('click', () => this.switchView('signup'));

        // Forgot password links
        document.getElementById('forgotPasswordLink').addEventListener('click', () => this.switchView('forgot'));
        document.getElementById('backToLoginLink').addEventListener('click', () => this.switchView('login'));

        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        this.forgotForm.addEventListener('submit', (e) => this.handleForgot(e));

        // Logout button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Auth state listener — keeps UI in sync with Supabase session
        onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.hideAuth();
            } else if (event === 'SIGNED_OUT') {
                this.showAuth();
            }
        });
    }

    // ─── VIEW SWITCHING ─────────────────────────────────────────────────────────

    switchView(view) {
        this.currentView = view;
        this.hideMessage();

        // Hide all forms
        this.loginForm.classList.add('hidden');
        this.signupForm.classList.add('hidden');
        this.forgotForm.classList.add('hidden');

        // Reset tab active states
        this.tabLogin.classList.remove('active');
        this.tabSignup.classList.remove('active');

        // Show the requested form
        if (view === 'login') {
            this.loginForm.classList.remove('hidden');
            this.tabLogin.classList.add('active');
        } else if (view === 'signup') {
            this.signupForm.classList.remove('hidden');
            this.tabSignup.classList.add('active');
        } else if (view === 'forgot') {
            this.forgotForm.classList.remove('hidden');
            // No tab for forgot — it's accessed via link
        }
    }

    // ─── LOGIN HANDLER ──────────────────────────────────────────────────────────

    async handleLogin(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        this.setLoading(true, 'loginSubmitBtn');

        const { data, error } = await signIn(email, password);

        this.setLoading(false, 'loginSubmitBtn');

        if (error) {
            this.showMessage(error.message, 'error');
            return;
        }

        // Success — onAuthStateChange will hide the auth screen
        this.showMessage('Welcome back!', 'success');
    }

    // ─── SIGNUP HANDLER ─────────────────────────────────────────────────────────

    async handleSignup(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;

        // Client-side validation
        if (!username || !email || !password || !confirm) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        if (username.length < 2) {
            this.showMessage('Username must be at least 2 characters.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters.', 'error');
            return;
        }

        if (password !== confirm) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        this.setLoading(true, 'signupSubmitBtn');

        const { data, error, emailConfirmation } = await signUp(email, password, username);

        this.setLoading(false, 'signupSubmitBtn');

        if (error) {
            this.showMessage(error.message, 'error');
            return;
        }

        if (emailConfirmation) {
            this.showMessage('Account created! Check your email to verify your account before logging in.', 'success');
            // Switch to login view after a delay
            setTimeout(() => this.switchView('login'), 3000);
        } else {
            this.showMessage('Account created! Welcome to Neon Dots!', 'success');
            // If no email confirmation needed, onAuthStateChange handles hiding
        }
    }

    // ─── FORGOT PASSWORD HANDLER ────────────────────────────────────────────────

    async handleForgot(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const email = document.getElementById('forgotEmail').value.trim();

        if (!email) {
            this.showMessage('Please enter your email address.', 'error');
            return;
        }

        this.setLoading(true, 'forgotSubmitBtn');

        const { error } = await resetPassword(email);

        this.setLoading(false, 'forgotSubmitBtn');

        if (error) {
            this.showMessage(error.message, 'error');
            return;
        }

        this.showMessage('If an account with that email exists, a reset link has been sent. Check your inbox.', 'success');
    }

    // ─── LOGOUT HANDLER ─────────────────────────────────────────────────────────

    async handleLogout() {
        const { error } = await signOut();

        if (error) {
            console.error('Logout error:', error.message);
            // Still show auth screen even on error
        }

        // onAuthStateChange will show the auth screen
    }

    // ─── SESSION CHECK ──────────────────────────────────────────────────────────

    async checkSession() {
        const { session, error } = await getSession();

        if (session) {
            // User is already logged in — hide auth, show game
            this.hideAuth();
        } else {
            // No session — show auth screen
            this.showAuth();
        }
    }

    // ─── SHOW / HIDE AUTH SCREEN ────────────────────────────────────────────────

    showAuth() {
        this.container.classList.add('active');
        this.container.classList.remove('hidden');
        if (this.logoutBtn) this.logoutBtn.classList.add('hidden');
    }

    hideAuth() {
        this.container.classList.remove('active');
        this.container.classList.add('hidden');
        if (this.logoutBtn) this.logoutBtn.classList.remove('hidden');
    }

    // ─── MESSAGE DISPLAY ────────────────────────────────────────────────────────

    showMessage(text, type = 'info') {
        this.messageEl.textContent = text;
        this.messageEl.className = `auth-message ${type}`;
        this.messageEl.classList.remove('hidden');

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            clearTimeout(this._msgTimeout);
            this._msgTimeout = setTimeout(() => this.hideMessage(), 5000);
        }
    }

    hideMessage() {
        this.messageEl.classList.add('hidden');
    }

    // ─── LOADING STATE ──────────────────────────────────────────────────────────

    setLoading(loading, btnId) {
        this.isLoading = loading;
        const btn = document.getElementById(btnId);
        if (!btn) return;

        const text = btn.querySelector('.auth-btn-text');
        const loader = btn.querySelector('.auth-btn-loader');

        if (loading) {
            btn.disabled = true;
            text.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            btn.disabled = false;
            text.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }

    // ─── PARTICLE ANIMATION (Background ambiance) ───────────────────────────────

    initParticles() {
        const canvas = this.particleCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId = null;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                life: Math.random() * Math.PI * 2,
                color: Math.random() > 0.5 ? '#00f3ff' : '#bf5af2'
            });
        }

        const render = () => {
            // Stop animating if auth screen is hidden
            if (this.container.classList.contains('hidden')) {
                cancelAnimationFrame(animId);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life += 0.01;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.15 + Math.sin(p.life) * 0.15;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            animId = requestAnimationFrame(render);
        };

        render();

        // Restart particles when auth screen is shown again
        const observer = new MutationObserver(() => {
            if (this.container.classList.contains('active')) {
                render();
            }
        });
        observer.observe(this.container, { attributes: true, attributeFilter: ['class'] });
    }
}

// Initialize when the module loads
const authUI = new AuthUI();
export default authUI;
