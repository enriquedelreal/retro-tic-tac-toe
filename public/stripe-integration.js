// Stripe Payment Integration for Retro Arcade
// This handles the actual payment processing for subscriptions

class StripePaymentManager {
    constructor() {
        // In production, use your actual Stripe publishable key
        this.stripePublicKey = 'pk_test_your_stripe_key_here'; // Replace with your actual key
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.initializeStripe();
    }

    async initializeStripe() {
        try {
            // Load Stripe.js dynamically
            if (!window.Stripe) {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.onload = () => this.setupStripe();
                document.head.appendChild(script);
            } else {
                this.setupStripe();
            }
        } catch (error) {
            console.error('Error loading Stripe:', error);
        }
    }

    setupStripe() {
        try {
            if (this.stripePublicKey.includes('your_stripe_key_here')) {
                console.warn('⚠️ Using demo mode - Replace with your actual Stripe keys for production!');
                return;
            }

            if (!window.Stripe) {
                console.error('Stripe.js not loaded');
                return;
            }

            this.stripe = Stripe(this.stripePublicKey);
            this.elements = this.stripe.elements();
            
            // Create card element
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        fontFamily: 'Press Start 2P, monospace',
                        color: '#ffffff',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                }
            });
        } catch (error) {
            console.error('Error setting up Stripe:', error);
        }
    }

    createPaymentForm(plan) {
        const modal = document.createElement('div');
        modal.className = 'auth-overlay';
        modal.innerHTML = `
            <div class="auth-modal">
                <div class="auth-header">
                    <h2>💳 PAYMENT</h2>
                    <button class="close-auth" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="payment-form">
                    <div class="plan-summary">
                        <h3>SELECTED PLAN</h3>
                        <div class="plan-details">
                            <div class="plan-name">${plan.toUpperCase()}</div>
                            <div class="plan-price">${plan === 'monthly' ? '$5/month' : '$50/year'}</div>
                            ${plan === 'yearly' ? '<div class="plan-savings">Save $10 per year!</div>' : ''}
                        </div>
                    </div>

                    <div class="payment-section">
                        <h3>PAYMENT DETAILS</h3>
                        <div id="card-element" class="card-element">
                            <!-- Stripe Elements will create form elements here -->
                        </div>
                        <div id="card-errors" class="card-errors"></div>
                    </div>

                    <div class="payment-actions">
                        <button class="retro-button" id="submit-payment" disabled>
                            PROCESSING...
                        </button>
                        <button class="retro-button secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                            CANCEL
                        </button>
                    </div>

                    <div class="demo-notice">
                        <p>⚠️ DEMO MODE - No real charges will be made!</p>
                        <p>In production, integrate with your Stripe account.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup Stripe elements if available
        if (this.cardElement) {
            this.cardElement.mount('#card-element');
            this.setupPaymentForm(plan, modal);
        } else {
            // Demo mode - just show a simple form
            this.setupDemoPaymentForm(plan, modal);
        }

        return modal;
    }

    setupPaymentForm(plan, modal) {
        const submitButton = modal.querySelector('#submit-payment');
        const cardErrors = modal.querySelector('#card-errors');

        submitButton.textContent = 'SUBSCRIBE NOW';
        submitButton.disabled = false;

        // Listen for real-time validation errors from the card Element
        this.cardElement.on('change', ({error}) => {
            if (error) {
                cardErrors.textContent = error.message;
            } else {
                cardErrors.textContent = '';
            }
        });

        submitButton.addEventListener('click', async (event) => {
            event.preventDefault();
            
            submitButton.disabled = true;
            submitButton.textContent = 'PROCESSING...';

            try {
                const result = await this.processRealPayment(plan);
                if (result.success) {
                    modal.remove();
                    window.authUI.showMessage('Payment successful! Welcome to Retro Arcade!', 'success');
                    window.authUI.updateUI();
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                cardErrors.textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'SUBSCRIBE NOW';
            }
        });
    }

    setupDemoPaymentForm(plan, modal) {
        const cardElement = modal.querySelector('#card-element');
        const submitButton = modal.querySelector('#submit-payment');
        
        // Create a simple demo form
        cardElement.innerHTML = `
            <div class="demo-card-form">
                <input type="text" placeholder="4242 4242 4242 4242" class="demo-input" id="demo-card-number">
                <div class="demo-row">
                    <input type="text" placeholder="MM/YY" class="demo-input" id="demo-expiry">
                    <input type="text" placeholder="CVC" class="demo-input" id="demo-cvc">
                </div>
                <input type="text" placeholder="Cardholder Name" class="demo-input" id="demo-name">
            </div>
        `;

        submitButton.textContent = 'SUBSCRIBE NOW (DEMO)';
        submitButton.disabled = false;

        submitButton.addEventListener('click', async (event) => {
            event.preventDefault();
            
            submitButton.disabled = true;
            submitButton.textContent = 'PROCESSING...';

            // Simulate payment processing
            setTimeout(() => {
                const result = window.authManager.startSubscription(
                    window.authManager.currentUser.id, 
                    plan
                );
                
                modal.remove();
                window.authUI.showMessage('Demo payment successful! Welcome to Retro Arcade!', 'success');
                window.authUI.updateUI();
            }, 2000);
        });
    }

    async processRealPayment(plan) {
        try {
            // Create payment method
            const {error, paymentMethod} = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
            });

            if (error) {
                throw error;
            }

            // Send payment method to your server
            const response = await fetch('/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_method: paymentMethod.id,
                    plan: plan,
                    user_id: window.authManager.currentUser.id
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                // Update local subscription
                window.authManager.startSubscription(
                    window.authManager.currentUser.id, 
                    plan
                );
                return { success: true };
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Payment error:', error);
            return { success: false, error: error.message };
        }
    }

    // For production use - create a subscription on your backend
    static createBackendEndpoint() {
        return `
        // Backend endpoint example (Node.js + Express)
        app.post('/create-subscription', async (req, res) => {
            try {
                const { payment_method, plan, user_id } = req.body;
                
                // Create customer in Stripe
                const customer = await stripe.customers.create({
                    payment_method: payment_method,
                    email: req.user.email, // Get from your user system
                    invoice_settings: {
                        default_payment_method: payment_method,
                    },
                });

                // Create subscription
                const subscription = await stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{
                        price: plan === 'monthly' ? 'price_monthly_id' : 'price_yearly_id'
                    }],
                    expand: ['latest_invoice.payment_intent'],
                });

                // Save subscription to your database
                await saveSubscriptionToDatabase(user_id, subscription);

                res.json({ success: true, subscription: subscription });
            } catch (error) {
                res.json({ success: false, error: error.message });
            }
        });
        `;
    }
}

// Initialize Stripe payment manager
window.stripePaymentManager = new StripePaymentManager();