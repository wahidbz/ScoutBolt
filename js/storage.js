/**
 * ScoutBolt Storage Manager
 * Handles localStorage with Pi SDK integration ready
 */

const Storage = {
    // Current storage mode: 'local' or 'pi'
    mode: 'local',

    // Pi user data cache
    piUser: null,

    /**
     * Initialize storage system
     */
    init() {
        this.migrateData();
        Logger.info('Storage initialized in mode:', this.mode);
    },

    /**
     * Get data from storage
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {
        try {
            // Check Pi SDK first if authenticated
            if (this.mode === 'pi' && this.piUser) {
                // Future: Pi.Storage implementation
                // return Pi.Storage.get(key);
            }

            // Fallback to localStorage
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;

            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (e) {
            Logger.error('Storage get error:', e);
            return defaultValue;
        }
    },

    /**
     * Set data in storage
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    set(key, value) {
        try {
            // Check Pi SDK first if authenticated
            if (this.mode === 'pi' && this.piUser) {
                // Future: Pi.Storage implementation
                // return Pi.Storage.set(key, value);
            }

            // Fallback to localStorage
            const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            Logger.error('Storage set error:', e);
            return false;
        }
    },

    /**
     * Remove data from storage
     * @param {string} key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            Logger.error('Storage remove error:', e);
        }
    },

    /**
     * Clear all game data
     */
    clear() {
        try {
            Object.values(CONFIG.STORAGE).forEach(key => {
                localStorage.removeItem(key);
            });
            Logger.info('Storage cleared');
        } catch (e) {
            Logger.error('Storage clear error:', e);
        }
    },

    // ==================== GAME SPECIFIC METHODS ====================

    /**
     * Get completed levels
     * @returns {number[]}
     */
    getCompletedLevels() {
        return this.get(CONFIG.STORAGE.COMPLETED_LEVELS, []);
    },

    /**
     * Mark level as completed
     * @param {number} levelId
     * @param {number} stars
     */
    completeLevel(levelId, stars) {
        const completed = this.getCompletedLevels();
        const existing = completed.findIndex(c => c.id === levelId);

        const record = { id: levelId, stars, date: Date.now() };

        if (existing >= 0) {
            // Update if better score
            if (stars > completed[existing].stars) {
                completed[existing] = record;
            }
        } else {
            completed.push(record);
        }

        this.set(CONFIG.STORAGE.COMPLETED_LEVELS, completed);

        // Trigger Pi reward if integrated
        if (this.mode === 'pi') {
            this.rewardPiUser(levelId);
        }
    },

    /**
     * Check if level is completed
     * @param {number} levelId
     * @returns {boolean}
     */
    isLevelCompleted(levelId) {
        const completed = this.getCompletedLevels();
        return completed.some(c => c.id === levelId);
    },

    /**
     * Get stars for level
     * @param {number} levelId
     * @returns {number}
     */
    getLevelStars(levelId) {
        const completed = this.getCompletedLevels();
        const record = completed.find(c => c.id === levelId);
        return record ? record.stars : 0;
    },

    /**
     * Check if level is unlocked
     * @param {number} levelId
     * @returns {boolean}
     */
    isLevelUnlocked(levelId) {
        if (levelId === 1) return true;
        return this.isLevelCompleted(levelId - 1);
    },

    /**
     * Get last played level
     * @returns {number}
     */
    getCurrentLevel() {
        return this.get(CONFIG.STORAGE.CURRENT_LEVEL, 1);
    },

    /**
     * Set last played level
     * @param {number} levelId
     */
    setCurrentLevel(levelId) {
        this.set(CONFIG.STORAGE.CURRENT_LEVEL, levelId);
    },

    /**
     * Get game settings
     * @returns {Object}
     */
    getSettings() {
        return this.get(CONFIG.STORAGE.SETTINGS, {
            sound: true,
            vibration: true,
            theme: 'wood'
        });
    },

    /**
     * Save game settings
     * @param {Object} settings
     */
    saveSettings(settings) {
        this.set(CONFIG.STORAGE.SETTINGS, settings);
    },

    // ==================== PI SDK INTEGRATION ====================

    /**
     * Initialize Pi SDK
     * @returns {Promise<boolean>}
     */
    async initPiSDK() {
        try {
            // Check if Pi SDK is available
            if (typeof Pi === 'undefined') {
                Logger.warn('Pi SDK not available');
                return false;
            }

            // Initialize Pi
            await Pi.init({ 
                version: "2.0",
                sandbox: false 
            });

            Logger.info('Pi SDK initialized');
            return true;
        } catch (e) {
            Logger.error('Pi SDK init failed:', e);
            return false;
        }
    },

    /**
     * Authenticate with Pi
     * @returns {Promise<Object|null>}
     */
    async authenticatePi() {
        try {
            if (typeof Pi === 'undefined') return null;

            const scopes = CONFIG.PI.SCOPES;
            const auth = await Pi.authenticate(scopes, this.onPiPayment);

            this.piUser = auth.user;
            this.mode = 'pi';

            // Save Pi user data
            this.set(CONFIG.STORAGE.PI_USER, {
                uid: auth.user.uid,
                username: auth.user.username
            });

            Logger.info('Pi authentication successful:', auth.user.username);
            return auth.user;
        } catch (e) {
            Logger.error('Pi authentication failed:', e);
            return null;
        }
    },

    /**
     * Handle Pi payment callback
     * @param {Object} payment
     */
    onPiPayment(payment) {
        Logger.info('Pi payment received:', payment);
        // Handle in-app purchases or rewards
    },

    /**
     * Reward Pi user for level completion
     * @param {number} levelId
     */
    async rewardPiUser(levelId) {
        if (!this.piUser) return;

        try {
            // Future: Implement Pi payments API
            // const payment = await Pi.createPayment({
            //     amount: CONFIG.PI.REWARD_PER_LEVEL,
            //     memo: `Level ${levelId} completion reward`,
            //     metadata: { levelId, user: this.piUser.uid }
            // });

            Logger.info(`Pi reward queued for level ${levelId}`);
        } catch (e) {
            Logger.error('Pi reward error:', e);
        }
    },

    /**
     * Check if user is authenticated with Pi
     * @returns {boolean}
     */
    isPiAuthenticated() {
        return this.mode === 'pi' && this.piUser !== null;
    },

    /**
     * Get Pi user info
     * @returns {Object|null}
     */
    getPiUser() {
        return this.piUser;
    },

    // ==================== MIGRATION ====================

    /**
     * Migrate old data formats
     */
    migrateData() {
        try {
            // Check for old format (simple array vs object array)
            const completed = localStorage.getItem(CONFIG.STORAGE.COMPLETED_LEVELS);
            if (completed) {
                try {
                    const parsed = JSON.parse(completed);
                    if (parsed.length > 0 && typeof parsed[0] === 'number') {
                        // Old format: convert to new
                        const newFormat = parsed.map(id => ({
                            id,
                            stars: 3,
                            date: Date.now()
                        }));
                        this.set(CONFIG.STORAGE.COMPLETED_LEVELS, newFormat);
                        Logger.info('Migrated completed levels data');
                    }
                } catch (e) {
                    // Invalid data, clear it
                    this.remove(CONFIG.STORAGE.COMPLETED_LEVELS);
                }
            }
        } catch (e) {
            Logger.error('Migration error:', e);
        }
    }
};

// Initialize on load
Storage.init();
