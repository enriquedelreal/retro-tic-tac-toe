// User Authentication and Subscription Management System
// For High School Retro Games Arcade

class AuthManager {
    constructor() {
        // 🎮 SUBSCRIPTION SYSTEM TOGGLE
        // Set to false to disable authentication (free access to all games)
        // Set to true to enable subscription system
        this.SUBSCRIPTION_ENABLED = false;
        
        this.currentUser = null;
        this.users = new Map();
        this.subscriptions = new Map();
        this.referrals = new Map();
        this.initializeData();
        this.checkUserSession();
    }

    initializeData() {
        // Load existing data from localStorage
        const usersData = localStorage.getItem('arcade_users');
        const subscriptionsData = localStorage.getItem('arcade_subscriptions');
        const referralsData = localStorage.getItem('arcade_referrals');

        if (usersData) {
            this.users = new Map(JSON.parse(usersData));
        }
        if (subscriptionsData) {
            this.subscriptions = new Map(JSON.parse(subscriptionsData));
        }
        if (referralsData) {
            this.referrals = new Map(JSON.parse(referralsData));
        }
    }

    saveData() {
        localStorage.setItem('arcade_users', JSON.stringify([...this.users]));
        localStorage.setItem('arcade_subscriptions', JSON.stringify([...this.subscriptions]));
        localStorage.setItem('arcade_referrals', JSON.stringify([...this.referrals]));
    }

    generateReferralCode() {
        return 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    register(email, password, referralCode = null) {
        // Check if user already exists
        if (this.users.has(email)) {
            throw new Error('User already exists with this email');
        }

        const userId = this.generateUserId();
        const userReferralCode = this.generateReferralCode();
        
        const user = {
            id: userId,
            email: email,
            password: password, // In production, this should be hashed
            referralCode: userReferralCode,
            joinDate: new Date().toISOString(),
            referredBy: referralCode
        };

        // Create basic subscription (starts as expired, needs payment)
        const subscription = {
            userId: userId,
            status: 'inactive',
            plan: 'monthly',
            startDate: null,
            endDate: null,
            freeWeeksRemaining: 0
        };

        // Handle referral if provided
        if (referralCode) {
            const referrer = this.findUserByReferralCode(referralCode);
            if (referrer) {
                // Give referrer 1 free week
                const referrerSub = this.subscriptions.get(referrer.id);
                if (referrerSub) {
                    referrerSub.freeWeeksRemaining += 1;
                    this.subscriptions.set(referrer.id, referrerSub);
                }

                // Track the referral
                if (!this.referrals.has(referrer.id)) {
                    this.referrals.set(referrer.id, []);
                }
                this.referrals.get(referrer.id).push({
                    referredUserId: userId,
                    referredEmail: email,
                    date: new Date().toISOString(),
                    status: 'registered'
                });
            }
        }

        this.users.set(email, user);
        this.subscriptions.set(userId, subscription);
        this.saveData();

        return { user, subscription };
    }

    login(email, password) {
        const user = this.users.get(email);
        if (!user || user.password !== password) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = user;
        localStorage.setItem('current_user', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
    }

    checkUserSession() {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    findUserByReferralCode(referralCode) {
        for (const [email, user] of this.users) {
            if (user.referralCode === referralCode) {
                return user;
            }
        }
        return null;
    }

    getUserSubscription(userId = null) {
        const targetUserId = userId || (this.currentUser ? this.currentUser.id : null);
        if (!targetUserId) return null;
        
        return this.subscriptions.get(targetUserId);
    }

    hasActiveSubscription(userId = null) {
        // 🎮 If subscription system is disabled, everyone has access
        if (!this.SUBSCRIPTION_ENABLED) {
            return true;
        }
        
        try {
            const subscription = this.getUserSubscription(userId);
            if (!subscription) return false;

            const now = new Date();
            
            // Check if user has free weeks remaining
            if (subscription.freeWeeksRemaining > 0) {
                return true;
            }

            // Check if subscription is active and not expired
            if (subscription.status === 'active' && subscription.endDate) {
                const endDate = new Date(subscription.endDate);
                return now <= endDate;
            }

            return false;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return false;
        }
    }

    startSubscription(userId, plan = 'monthly') {
        const subscription = this.subscriptions.get(userId);
        if (!subscription) {
            throw new Error('No subscription found for user');
        }

        const now = new Date();
        const endDate = new Date();
        
        if (plan === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        subscription.status = 'active';
        subscription.plan = plan;
        subscription.startDate = now.toISOString();
        subscription.endDate = endDate.toISOString();

        this.subscriptions.set(userId, subscription);
        this.saveData();

        return subscription;
    }

    useFreeWeek(userId = null) {
        const targetUserId = userId || (this.currentUser ? this.currentUser.id : null);
        if (!targetUserId) return false;

        const subscription = this.subscriptions.get(targetUserId);
        if (!subscription || subscription.freeWeeksRemaining <= 0) {
            return false;
        }

        subscription.freeWeeksRemaining -= 1;
        this.subscriptions.set(targetUserId, subscription);
        this.saveData();
        
        return true;
    }

    getReferralStats(userId = null) {
        const targetUserId = userId || (this.currentUser ? this.currentUser.id : null);
        if (!targetUserId) return null;

        const referrals = this.referrals.get(targetUserId) || [];
        const user = this.currentUser;

        return {
            referralCode: user ? user.referralCode : null,
            totalReferrals: referrals.length,
            referrals: referrals
        };
    }

    // Mock payment processing (in production, integrate with Stripe)
    processPayment(userId, plan, paymentMethod) {
        // This is a mock - in production you'd integrate with Stripe
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    const subscription = this.startSubscription(userId, plan);
                    resolve({
                        success: true,
                        transactionId: 'mock_' + Date.now(),
                        subscription: subscription
                    });
                }, 1000);
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Initialize the authentication manager
window.authManager = new AuthManager();