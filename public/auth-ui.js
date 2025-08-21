// Authentication UI Components

class AuthUI {
    constructor() {
        this.authManager = window.authManager;
        this.pendingReferralCode = null;
        
        if (!this.authManager) {
            console.error('AuthManager not found! Make sure auth.js is loaded before auth-ui.js');
            return;
        }
        
        // 🎮 Only create auth elements if subscription system is enabled
        if (this.authManager.SUBSCRIPTION_ENABLED) {
            this.createAuthElements();
            this.setupEventListeners();
            this.updateUI();
        } else {
            console.log('🎮 Subscription system disabled - Free access to all games!');
            this.hideUserInterface();
        }
    }

    createAuthElements() {
        // Create auth overlay
        const authOverlay = document.createElement('div');
        authOverlay.id = 'authOverlay';
        authOverlay.className = 'auth-overlay';
        authOverlay.innerHTML = `
            <div class="auth-modal">
                <div class="auth-header">
                    <h2>🎮 RETRO ARCADE</h2>
                    <button class="close-auth" id="closeAuth">×</button>
                </div>
                
                <!-- Login Form -->
                <div class="auth-form" id="loginForm">
                    <h3>LOGIN</h3>
                    <form id="loginFormElement">
                        <input type="email" id="loginEmail" placeholder="EMAIL" required>
                        <input type="password" id="loginPassword" placeholder="PASSWORD" required>
                        <button type="submit" class="retro-button">LOGIN</button>
                    </form>
                    <p class="auth-switch">Don't have an account? <a href="#" id="showRegister">REGISTER</a></p>
                </div>

                <!-- Register Form -->
                <div class="auth-form hidden" id="registerForm">
                    <h3>REGISTER</h3>
                    <form id="registerFormElement">
                        <input type="email" id="registerEmail" placeholder="EMAIL" required>
                        <input type="password" id="registerPassword" placeholder="PASSWORD" required>
                        <input type="text" id="referralCode" placeholder="REFERRAL CODE (OPTIONAL)">
                        <button type="submit" class="retro-button">REGISTER</button>
                    </form>
                    <p class="auth-switch">Already have an account? <a href="#" id="showLogin">LOGIN</a></p>
                </div>

                <!-- Subscription Required -->
                <div class="auth-form hidden" id="subscriptionForm">
                    <h3>SUBSCRIPTION REQUIRED</h3>
                    <p class="subscription-message">Get unlimited access to all retro games!</p>
                    
                    <div class="pricing-plans">
                        <div class="plan-card">
                            <h4>MONTHLY</h4>
                            <div class="price">$5<span>/month</span></div>
                            <button class="retro-button" data-plan="monthly">SUBSCRIBE</button>
                        </div>
                        <div class="plan-card popular">
                            <h4>YEARLY</h4>
                            <div class="price">$50<span>/year</span></div>
                            <div class="savings">SAVE $10!</div>
                            <button class="retro-button" data-plan="yearly">SUBSCRIBE</button>
                        </div>
                    </div>

                    <div class="referral-info">
                        <h4>REFERRAL PROGRAM</h4>
                        <p>Refer friends and get <strong>1 FREE WEEK</strong> for each signup!</p>
                        <div class="referral-code-display" id="userReferralCode">
                            Your code: <span class="code">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(authOverlay);

        // Create user info bar only if subscription system is enabled
        if (this.authManager && this.authManager.SUBSCRIPTION_ENABLED) {
            const userBar = document.createElement('div');
            userBar.id = 'userBar';
            userBar.className = 'user-bar';
            userBar.innerHTML = `
                <div class="user-info">
                    <span id="userEmail">Not logged in</span>
                    <span id="subscriptionStatus">No subscription</span>
                </div>
                <div class="user-actions">
                    <button class="retro-button small" id="userDashboard">DASHBOARD</button>
                    <button class="retro-button small" id="userLogout">LOGOUT</button>
                    <button class="retro-button small" id="userLogin">LOGIN</button>
                </div>
            `;
            document.body.appendChild(userBar);
        }

        // Create dashboard modal
        const dashboardModal = document.createElement('div');
        dashboardModal.id = 'dashboardModal';
        dashboardModal.className = 'auth-overlay hidden';
        dashboardModal.innerHTML = `
            <div class="auth-modal dashboard-modal">
                <div class="auth-header">
                    <h2>🎮 USER DASHBOARD</h2>
                    <button class="close-auth" id="closeDashboard">×</button>
                </div>
                
                <div class="dashboard-content">
                    <div class="dashboard-section">
                        <h3>SUBSCRIPTION STATUS</h3>
                        <div id="subscriptionDetails">Loading...</div>
                    </div>

                    <div class="dashboard-section">
                        <h3>REFERRAL PROGRAM</h3>
                        <div id="referralDetails">Loading...</div>
                    </div>

                    <div class="dashboard-section">
                        <h3>ACCOUNT ACTIONS</h3>
                        <button class="retro-button" id="upgradeSubscription">MANAGE SUBSCRIPTION</button>
                        <button class="retro-button" id="copyReferralLink">COPY REFERRAL LINK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dashboardModal);
    }

    setupEventListeners() {
        // Auth modal controls - with null checks
        const closeAuth = document.getElementById('closeAuth');
        if (closeAuth) {
            closeAuth.addEventListener('click', () => this.hideAuth());
        }
        
        const showRegister = document.getElementById('showRegister');
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }
        
        const showLogin = document.getElementById('showLogin');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // Form submissions - with null checks
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // User bar actions - with null checks
        const userLogin = document.getElementById('userLogin');
        if (userLogin) {
            userLogin.addEventListener('click', () => this.showAuth());
        }
        
        const userLogout = document.getElementById('userLogout');
        if (userLogout) {
            userLogout.addEventListener('click', () => this.handleLogout());
        }
        
        const userDashboard = document.getElementById('userDashboard');
        if (userDashboard) {
            userDashboard.addEventListener('click', () => this.showDashboard());
        }

        // Dashboard controls - with null checks
        const closeDashboard = document.getElementById('closeDashboard');
        if (closeDashboard) {
            closeDashboard.addEventListener('click', () => this.hideDashboard());
        }
        
        const copyReferralLink = document.getElementById('copyReferralLink');
        if (copyReferralLink) {
            copyReferralLink.addEventListener('click', () => this.copyReferralLink());
        }

        // Subscription buttons - with error handling
        try {
            document.querySelectorAll('[data-plan]').forEach(button => {
                button.addEventListener('click', (e) => {
                    const plan = e.target.dataset.plan;
                    if (plan) {
                        this.handleSubscription(plan);
                    }
                });
            });
        } catch (error) {
            console.warn('Subscription buttons not found, they will be added when auth modal is shown:', error);
        }
    }

    showAuth() {
        document.getElementById('authOverlay').classList.remove('hidden');
        this.updateAuthForm();
    }

    hideAuth() {
        document.getElementById('authOverlay').classList.add('hidden');
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('subscriptionForm').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('subscriptionForm').classList.add('hidden');
        
        // Apply any pending referral code
        setTimeout(() => this.applyPendingReferralCode(), 100);
    }

    showSubscriptionForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('subscriptionForm').classList.remove('hidden');
        this.updateReferralCode();
    }

    updateAuthForm() {
        if (!this.authManager.currentUser) {
            this.showLoginForm();
        } else if (!this.authManager.hasActiveSubscription()) {
            this.showSubscriptionForm();
        } else {
            this.hideAuth();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        if (!emailInput || !passwordInput) {
            this.showMessage('Login form not found', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            this.showMessage('Please enter both email and password', 'error');
            return;
        }

        try {
            await this.authManager.login(email, password);
            this.updateUI();
            this.updateAuthForm();
            this.showMessage('Login successful!', 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const referralInput = document.getElementById('referralCode');
        
        if (!emailInput || !passwordInput) {
            this.showMessage('Registration form not found', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const referralCode = referralInput ? referralInput.value.trim() : '';
        
        if (!email || !password) {
            this.showMessage('Please enter both email and password', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            await this.authManager.register(email, password, referralCode || null);
            this.showMessage('Registration successful! Please subscribe to access games.', 'success');
            this.updateAuthForm();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    handleLogout() {
        this.authManager.logout();
        this.updateUI();
        this.showMessage('Logged out successfully!', 'success');
    }

    async handleSubscription(plan) {
        if (!this.authManager.currentUser) {
            this.showMessage('Please login first', 'error');
            return;
        }

        // Use Stripe integration if available, otherwise use demo mode
        if (window.stripePaymentManager && window.stripePaymentManager.stripe) {
            window.stripePaymentManager.createPaymentForm(plan);
        } else {
            // Demo mode - just activate subscription
            try {
                this.showMessage('Processing demo payment...', 'info');
                const result = await this.authManager.processPayment(
                    this.authManager.currentUser.id, 
                    plan, 
                    'demo_payment_method'
                );

                if (result.success) {
                    this.showMessage('Demo subscription activated! Welcome to Retro Arcade!', 'success');
                    this.hideAuth();
                    this.updateUI();
                }
            } catch (error) {
                this.showMessage('Payment failed: ' + error.message, 'error');
            }
        }
    }

    showDashboard() {
        if (!this.authManager.currentUser) {
            this.showAuth();
            return;
        }

        document.getElementById('dashboardModal').classList.remove('hidden');
        this.updateDashboard();
    }

    hideDashboard() {
        document.getElementById('dashboardModal').classList.add('hidden');
    }

    updateDashboard() {
        const user = this.authManager.currentUser;
        const subscription = this.authManager.getUserSubscription();
        const referralStats = this.authManager.getReferralStats();

        // Update subscription details
        const subscriptionDetails = document.getElementById('subscriptionDetails');
        if (this.authManager.hasActiveSubscription()) {
            subscriptionDetails.innerHTML = `
                <div class="status-active">✅ ACTIVE SUBSCRIPTION</div>
                <p>Plan: ${subscription.plan.toUpperCase()}</p>
                <p>Free weeks remaining: ${subscription.freeWeeksRemaining}</p>
                ${subscription.endDate ? `<p>Expires: ${new Date(subscription.endDate).toLocaleDateString()}</p>` : ''}
            `;
        } else {
            subscriptionDetails.innerHTML = `
                <div class="status-inactive">❌ NO ACTIVE SUBSCRIPTION</div>
                <button class="retro-button" onclick="authUI.showAuth()">SUBSCRIBE NOW</button>
            `;
        }

        // Update referral details
        const referralDetails = document.getElementById('referralDetails');
        referralDetails.innerHTML = `
            <div class="referral-code">
                Your referral code: <strong>${referralStats.referralCode}</strong>
            </div>
            <p>Total referrals: <strong>${referralStats.totalReferrals}</strong></p>
            <p>Each referral gives you <strong>1 FREE WEEK</strong>!</p>
            <div class="referral-link">
                Share: ${window.location.origin}?ref=${referralStats.referralCode}
            </div>
        `;
    }

    copyReferralLink() {
        const user = this.authManager.currentUser;
        if (user) {
            const link = `${window.location.origin}?ref=${user.referralCode}`;
            
            // Try modern clipboard API first, fallback to older method
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(link).then(() => {
                    this.showMessage('Referral link copied!', 'success');
                }).catch(() => {
                    this.fallbackCopyReferralLink(link);
                });
            } else {
                this.fallbackCopyReferralLink(link);
            }
        }
    }
    
    fallbackCopyReferralLink(link) {
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showMessage('Referral link copied!', 'success');
        } catch (err) {
            this.showMessage('Please manually copy: ' + link, 'info');
        }
        
        document.body.removeChild(textArea);
    }

    updateReferralCode() {
        const user = this.authManager.currentUser;
        if (user) {
            const codeDisplay = document.getElementById('userReferralCode');
            if (codeDisplay) {
                codeDisplay.innerHTML = `Your code: <span class="code">${user.referralCode}</span>`;
            }
        }
    }

    updateUI() {
        const user = this.authManager.currentUser;
        const hasSubscription = this.authManager.hasActiveSubscription();

        // Update user bar - with null checks
        const userEmail = document.getElementById('userEmail');
        const subscriptionStatus = document.getElementById('subscriptionStatus');
        const loginBtn = document.getElementById('userLogin');
        const logoutBtn = document.getElementById('userLogout');
        const dashboardBtn = document.getElementById('userDashboard');

        if (userEmail && subscriptionStatus && loginBtn && logoutBtn && dashboardBtn) {
            if (user) {
                userEmail.textContent = user.email;
                subscriptionStatus.textContent = hasSubscription ? '✅ ACTIVE' : '❌ INACTIVE';
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';
                dashboardBtn.style.display = 'inline-block';
            } else {
                userEmail.textContent = 'Not logged in';
                subscriptionStatus.textContent = 'No subscription';
                loginBtn.style.display = 'inline-block';
                logoutBtn.style.display = 'none';
                dashboardBtn.style.display = 'none';
            }
        } else {
            console.warn('User bar elements not found, UI may not be fully initialized');
        }

        // Update game access
        this.updateGameAccess();
    }

    updateGameAccess() {
        const hasAccess = this.authManager.currentUser && this.authManager.hasActiveSubscription();
        const gameNavItems = document.querySelectorAll('.game-nav-item');
        
        gameNavItems.forEach(item => {
            if (!hasAccess) {
                item.classList.add('locked');
                item.addEventListener('click', this.showSubscriptionPrompt.bind(this));
            } else {
                item.classList.remove('locked');
            }
        });
    }

    showSubscriptionPrompt(e) {
        if (!this.authManager.hasActiveSubscription()) {
            e.preventDefault();
            e.stopPropagation();
            this.showAuth();
        }
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Style the message
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '0.7rem',
            zIndex: '10000',
            maxWidth: '300px'
        });

        // Set colors based on type
        switch (type) {
            case 'success':
                messageEl.style.background = '#4CAF50';
                messageEl.style.color = 'white';
                break;
            case 'error':
                messageEl.style.background = '#f44336';
                messageEl.style.color = 'white';
                break;
            case 'info':
                messageEl.style.background = '#2196F3';
                messageEl.style.color = 'white';
                break;
        }

        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    // Hide the user interface when subscription is disabled
    hideUserInterface() {
        // Hide subscription UI completely when system is disabled
        // No user bar will be shown in free mode
    }

    // Check for referral code in URL
    checkReferralCode() {
        // Only process referral codes if subscription system is enabled
        if (!this.authManager.SUBSCRIPTION_ENABLED) {
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            // Store the referral code to use when auth modal is shown
            this.pendingReferralCode = refCode;
            this.showRegisterForm();
            this.showAuth();
        }
    }

    // Apply pending referral code when register form is shown
    applyPendingReferralCode() {
        if (this.pendingReferralCode) {
            const referralInput = document.getElementById('referralCode');
            if (referralInput) {
                referralInput.value = this.pendingReferralCode;
                this.pendingReferralCode = null; // Clear it after use
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
    window.authUI.checkReferralCode();
});