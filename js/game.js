/**
 * ScoutBolt Game Engine
 * Core game logic, state management, and Pi SDK integration
 */

const Game = {
    // Game state
    currentLevel: 1,
    moves: 0,
    isComplete: false,
    isPaused: false,

    // Entities
    plates: [],
    bolts: [],

    // References
    canvas: null,

    /**
     * Initialize game
     */
    init() {
        this.canvas = document.getElementById('game-canvas');

        // Initialize subsystems
        Renderer.init(this.canvas);
        Particles.init();
        Input.init(this.canvas, this);
        Physics.init();

        // Initialize Pi SDK if available
        this.initPiSDK();

        Logger.info('Game initialized');
    },

    /**
     * Initialize Pi SDK
     */
    async initPiSDK() {
        // Check if Pi SDK is available
        if (typeof Pi === 'undefined') {
            Logger.warn('Pi SDK not available');
            return;
        }

        try {
            // Initialize Pi SDK
            Pi.init({ 
                version: "2.0",
                sandbox: false // Set to true for development
            });

            Logger.info('Pi SDK initialized');

            // Show Pi login button if not authenticated
            if (!Storage.isPiAuthenticated()) {
                this.showPiLoginButton();
            }
        } catch (e) {
            Logger.error('Pi SDK init failed:', e);
        }
    },

    /**
     * Show Pi login button
     */
    showPiLoginButton() {
        const btn = document.getElementById('btn-pi-login');
        if (btn) {
            btn.style.display = 'block';
            btn.addEventListener('click', () => this.authenticatePi());
        }
    },

    /**
     * Authenticate with Pi Network
     */
    async authenticatePi() {
        if (typeof Pi === 'undefined') {
            UI.showNotification('Pi Browser required for authentication', 'error');
            return;
        }

        const scopes = ['username', 'payments'];

        try {
            const auth = await Pi.authenticate(scopes, this.onIncompletePaymentFound.bind(this));

            // Store Pi user data
            Storage.set(CONFIG.STORAGE.PI_USER, {
                uid: auth.user.uid,
                username: auth.user.username,
                accessToken: auth.accessToken
            });

            // Switch to Pi storage mode
            Storage.mode = 'pi';
            Storage.piUser = auth.user;

            UI.showNotification(`Welcome, ${auth.user.username}!`, 'success');

            // Hide login button
            const btn = document.getElementById('btn-pi-login');
            if (btn) btn.style.display = 'none';

            Logger.info('Pi authentication successful:', auth.user.username);

        } catch (error) {
            Logger.error('Pi authentication failed:', error);
            UI.showNotification('Authentication failed', 'error');
        }
    },

    /**
     * Handle incomplete payment found during authentication
     * @param {Object} payment
     */
    onIncompletePaymentFound(payment) {
        Logger.info('Incomplete payment found:', payment);

        // Send to backend to resolve
        // This is required by Pi SDK
        fetch('/api/payments/incomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment })
        }).catch(err => Logger.error('Failed to resolve incomplete payment:', err));
    },

    /**
     * Create Pi payment for level unlock or hints
     * @param {string} type - 'hint', 'unlock', 'premium'
     */
    async createPayment(type = 'hint') {
        if (typeof Pi === 'undefined') {
            UI.showNotification('Pi Browser required for payments', 'error');
            return;
        }

        const paymentConfigs = {
            hint: { amount: 0.1, memo: 'Buy a hint for current level' },
            unlock: { amount: 0.5, memo: 'Unlock all levels' },
            premium: { amount: 1.0, memo: 'Premium version - no ads' }
        };

        const config = paymentConfigs[type] || paymentConfigs.hint;

        const paymentData = {
            amount: config.amount,
            memo: config.memo,
            metadata: {
                type: type,
                level: this.currentLevel,
                timestamp: Date.now()
            }
        };

        const paymentCallbacks = {
            onReadyForServerApproval: (paymentId) => {
                Logger.info('Payment ready for approval:', paymentId);
                this.approvePayment(paymentId);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                Logger.info('Payment ready for completion:', paymentId, txid);
                this.completePayment(paymentId, txid, type);
            },
            onCancel: (paymentId) => {
                Logger.info('Payment cancelled:', paymentId);
                UI.showNotification('Payment cancelled', 'info');
            },
            onError: (error, payment) => {
                Logger.error('Payment error:', error);
                UI.showNotification('Payment failed', 'error');
            }
        };

        try {
            Pi.createPayment(paymentData, paymentCallbacks);
        } catch (e) {
            Logger.error('Failed to create payment:', e);
        }
    },

    /**
     * Approve payment on server
     * @param {string} paymentId
     */
    async approvePayment(paymentId) {
        try {
            const response = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });

            if (!response.ok) {
                throw new Error('Approval failed');
            }

            Logger.info('Payment approved:', paymentId);
        } catch (e) {
            Logger.error('Payment approval failed:', e);
        }
    },

    /**
     * Complete payment on server
     * @param {string} paymentId
     * @param {string} txid
     * @param {string} type
     */
    async completePayment(paymentId, txid, type) {
        try {
            const response = await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, type })
            });

            if (!response.ok) {
                throw new Error('Completion failed');
            }

            Logger.info('Payment completed:', paymentId);
            UI.showNotification('Payment successful!', 'success');

            // Apply purchased item
            this.applyPurchase(type);

        } catch (e) {
            Logger.error('Payment completion failed:', e);
        }
    },

    /**
     * Apply purchased item
     * @param {string} type
     */
    applyPurchase(type) {
        switch(type) {
            case 'hint':
                this.showHint();
                break;
            case 'unlock':
                this.unlockAllLevels();
                break;
            case 'premium':
                this.enablePremium();
                break;
        }
    },

    /**
     * Load a level
     * @param {number} levelId
     */
    loadLevel(levelId) {
        const levelData = LevelData.getLevel(levelId);
        if (!levelData) {
            Logger.error('Level not found:', levelId);
            return;
        }

        // Reset state
        this.currentLevel = levelId;
        this.moves = 0;
        this.isComplete = false;
        this.isPaused = false;

        // Clear entities
        this.plates = [];
        this.bolts = [];
        Particles.clear();

        // Get scale from renderer
        const scale = Renderer.getScale();

        // Create plates
        levelData.plates.forEach((plateData, index) => {
            this.plates.push({
                id: index,
                x: plateData.x * scale,
                y: plateData.y * scale,
                width: plateData.width * scale,
                height: plateData.height * scale,
                color: plateData.color,
                bolts: plateData.bolts || [],
                supports: plateData.supports || [],

                // Physics properties
                vx: 0,
                vy: 0,
                rotation: 0,
                vRotation: 0,
                falling: false,
                removed: false
            });
        });

        // Create bolts
        this.plates.forEach((plate, plateIdx) => {
            plate.bolts.forEach((boltData, boltIdx) => {
                this.bolts.push({
                    id: `${plateIdx}-${boltIdx}`,
                    x: boltData.x * scale,
                    y: boltData.y * scale,
                    radius: CONFIG.GAME.BOLT_RADIUS * scale,
                    plateId: plateIdx,
                    locked: boltData.locked || false,
                    unlocksAfter: boltData.unlocksAfter || 0,
                    removed: false
                });
            });
        });

        // Update UI
        UI.updateLevelTitle(levelId, levelData.name);
        UI.updateMoves(0);
        UI.showScreen('game-screen');

        // Save current level
        Storage.setCurrentLevel(levelId);

        Logger.info('Level loaded:', levelId);
    },

    /**
     * Handle bolt click
     * @param {Object} bolt
     */
    onBoltClick(bolt) {
        if (this.isPaused || this.isComplete) return;

        if (bolt.locked) {
            // Locked bolt - show error
            Audio.playError();
            Particles.createErrorEffect(bolt.x, bolt.y);
            UI.shake(document.getElementById('game-canvas'));
            return;
        }

        // Remove bolt
        bolt.removed = true;
        this.moves++;

        // Effects
        Audio.playBolt();
        Particles.createBoltEffect(bolt.x, bolt.y);

        // Update UI
        UI.updateMoves(this.moves);

        // Unlock dependent bolts
        this.unlockBolts();

        // Check if plate should fall
        this.checkPlateFall(bolt.plateId);

        // Check win condition
        this.checkWin();
    },

    /**
     * Unlock bolts that should unlock after current move count
     */
    unlockBolts() {
        let unlocked = false;

        this.bolts.forEach(bolt => {
            if (bolt.locked && bolt.unlocksAfter === this.moves) {
                bolt.locked = false;
                unlocked = true;
                Particles.createUnlockEffect(bolt.x, bolt.y);
            }
        });

        if (unlocked) {
            Audio.playUnlock();
        }
    },

    /**
     * Check if a plate should start falling
     * @param {number} plateId
     */
    checkPlateFall(plateId) {
        const plate = this.plates[plateId];

        // Count remaining bolts on this plate
        const remainingBolts = this.bolts.filter(
            b => b.plateId === plateId && !b.removed
        );

        if (remainingBolts.length === 0 && !plate.falling) {
            Physics.startFalling(plate);
        }
    },

    /**
     * Check win condition
     */
    checkWin() {
        // Target is usually the last plate (top of stack)
        const targetPlate = this.plates[this.plates.length - 1];

        if (!targetPlate) return;

        // Win if target is removed or fell off screen
        if (targetPlate.removed || 
            (targetPlate.falling && targetPlate.y > Renderer.getBounds().height + 100)) {

            if (!this.isComplete) {
                this.win();
            }
        }
    },

    /**
     * Handle win
     */
    win() {
        this.isComplete = true;

        // Calculate stars
        let stars = 1;
        if (this.moves <= CONFIG.SCORING.STARS_3) stars = 3;
        else if (this.moves <= CONFIG.SCORING.STARS_2) stars = 2;

        // Save progress
        Storage.completeLevel(this.currentLevel, stars);

        // Effects
        Audio.playWin();
        Particles.createWinEffect(
            Renderer.getBounds().width / 2,
            Renderer.getBounds().height / 2
        );

        // Show win screen after delay
        setTimeout(() => {
            UI.showWin(stars, this.moves);
        }, 1000);

        Logger.info('Level complete:', this.currentLevel, 'Stars:', stars);
    },

    /**
     * Restart current level
     */
    restart() {
        this.loadLevel(this.currentLevel);
        Logger.info('Level restarted:', this.currentLevel);
    },

    /**
     * Load next level
     */
    nextLevel() {
        const next = LevelData.getNextLevel(this.currentLevel);
        if (next) {
            this.loadLevel(next);
        } else {
            UI.showScreen('level-select');
        }
    },

    /**
     * Pause game
     */
    pause() {
        this.isPaused = true;
    },

    /**
     * Resume game
     */
    resume() {
        this.isPaused = false;
    },

    /**
     * Load level select screen
     */
    loadLevelSelect() {
        const completed = Storage.getCompletedLevels();
        UI.renderLevelSelect(completed);
    },

    /**
     * Main game loop
     */
    loop() {
        if (!this.isPaused && !this.isComplete) {
            // Update physics
            Physics.updateAll(this.plates, Renderer.getBounds());

            // Update particles
            Particles.update();

            // Check win condition during gameplay
            this.checkWin();
        }

        // Render
        Renderer.drawGame(this.plates, this.bolts);

        requestAnimationFrame(() => this.loop());
    },

    // ==================== FEATURES ====================

    /**
     * Show hint for current level
     */
    showHint() {
        // Implementation for hints
        UI.showNotification('Hint: Start from the top plate', 'info');
    },

    /**
     * Unlock all levels (premium feature)
     */
    unlockAllLevels() {
        // Mark all levels as completed with 1 star
        for (let i = 1; i <= LevelData.getTotalLevels(); i++) {
            if (!Storage.isLevelCompleted(i)) {
                Storage.completeLevel(i, 1);
            }
        }
        UI.showNotification('All levels unlocked!', 'success');
    },

    /**
     * Enable premium features
     */
    enablePremium() {
        Storage.set('scoutbolt_premium', true);
        UI.showNotification('Premium features enabled!', 'success');
    }
};
