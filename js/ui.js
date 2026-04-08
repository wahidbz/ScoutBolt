/**
 * ScoutBolt UI Manager
 * Handles all UI transitions, modals, and screen management
 */

const UI = {
    screens: {},
    currentScreen: 'menu',
    isPaused: false,

    /**
     * Initialize UI
     */
    init() {
        this.cacheScreens();
        this.bindEvents();
        Logger.info('UI initialized');
    },

    /**
     * Cache screen elements
     */
    cacheScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            const name = screen.id.replace('-', '_');
            this.screens[name] = screen;
        });
    },

    /**
     * Bind UI events
     */
    bindEvents() {
        // Main menu
        document.getElementById('btn-play').addEventListener('click', () => {
            Audio.playClick();
            const currentLevel = Storage.getCurrentLevel();
            Game.loadLevel(currentLevel);
        });

        document.getElementById('btn-levels').addEventListener('click', () => {
            Audio.playClick();
            this.showScreen('level-select');
            Game.loadLevelSelect();
        });

        // Level select
        document.getElementById('btn-back-menu').addEventListener('click', () => {
            Audio.playClick();
            this.showScreen('main-menu');
        });

        // Game header
        document.getElementById('btn-menu').addEventListener('click', () => {
            Audio.playClick();
            this.togglePause();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            Audio.playClick();
            Game.restart();
        });

        // Win modal
        document.getElementById('btn-replay').addEventListener('click', () => {
            Audio.playClick();
            this.hideModal('win-modal');
            Game.restart();
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            Audio.playClick();
            this.hideModal('win-modal');
            Game.nextLevel();
        });

        // Pause modal
        document.getElementById('btn-resume').addEventListener('click', () => {
            Audio.playClick();
            this.togglePause();
        });

        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            Audio.playClick();
            this.togglePause();
            this.showScreen('level-select');
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'pause-modal') {
                        this.togglePause();
                    }
                }
            });
        });
    },

    /**
     * Show a screen
     * @param {string} screenName - Screen ID (with or without hyphens)
     */
    showScreen(screenName) {
        // Normalize screen name
        const normalizedName = screenName.replace('-', '_');

        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;

            // Update Pi UI if needed
            this.updatePiUI();
        }

        Logger.debug('Screen changed to:', screenName);
    },

    /**
     * Show modal
     * @param {string} modalId
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            if (modalId === 'pause-modal') {
                this.isPaused = true;
            }
        }
    },

    /**
     * Hide modal
     * @param {string} modalId
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            if (modalId === 'pause-modal') {
                this.isPaused = false;
            }
        }
    },

    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.hideModal('pause-modal');
            Game.resume();
        } else {
            this.showModal('pause-modal');
            Game.pause();
        }
    },

    /**
     * Update moves display
     * @param {number} moves
     */
    updateMoves(moves) {
        document.getElementById('moves-display').textContent = `Moves: ${moves}`;
    },

    /**
     * Update level title
     * @param {number} levelId
     * @param {string} levelName
     */
    updateLevelTitle(levelId, levelName) {
        document.getElementById('current-level-title').textContent = 
            levelName ? `Level ${levelId}: ${levelName}` : `Level ${levelId}`;
    },

    /**
     * Show win screen
     * @param {number} stars
     * @param {number} moves
     */
    showWin(stars, moves) {
        const starDisplay = document.getElementById('star-display');
        const winMessage = document.getElementById('win-message');

        starDisplay.textContent = '⭐'.repeat(stars);

        let message = '';
        if (stars === 3) message = 'Perfect! Amazing job!';
        else if (stars === 2) message = 'Great job! Almost perfect!';
        else message = 'Level completed!';

        if (moves <= 3) message += ` (${moves} moves)`;

        winMessage.textContent = message;

        // Check if there's a next level
        const nextBtn = document.getElementById('btn-next');
        if (LevelData.getNextLevel(Game.currentLevel)) {
            nextBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'none';
        }

        this.showModal('win-modal');
    },

    /**
     * Render level select buttons
     * @param {number[]} completedLevels
     */
    renderLevelSelect(completedLevels) {
        const container = document.getElementById('levels-container');
        container.innerHTML = '';

        const totalLevels = LevelData.getTotalLevels();

        for (let i = 1; i <= totalLevels; i++) {
            const levelBtn = document.createElement('div');
            levelBtn.className = 'level-btn';

            const isCompleted = completedLevels.some(c => c.id === i);
            const isLocked = i > 1 && !completedLevels.some(c => c.id === i - 1);
            const stars = isCompleted ? completedLevels.find(c => c.id === i).stars : 0;

            if (isCompleted) levelBtn.classList.add('completed');
            if (isLocked) levelBtn.classList.add('locked');

            if (isLocked) {
                levelBtn.innerHTML = '<span class="lock-icon">🔒</span>';
            } else {
                levelBtn.innerHTML = `
                    <span class="level-number">${i}</span>
                    ${isCompleted ? `<span class="stars">${'⭐'.repeat(stars)}</span>` : ''}
                `;

                levelBtn.addEventListener('click', () => {
                    Audio.playClick();
                    Game.loadLevel(i);
                });
            }

            container.appendChild(levelBtn);
        }
    },

    /**
     * Update Pi SDK UI elements
     */
    updatePiUI() {
        const piLoginBtn = document.getElementById('btn-pi-login');

        if (Storage.isPiAuthenticated()) {
            piLoginBtn.style.display = 'none';
            // Could show user badge here
        } else {
            // Show Pi login button if Pi SDK is available
            if (typeof Pi !== 'undefined') {
                piLoginBtn.style.display = 'block';
                piLoginBtn.addEventListener('click', () => {
                    Storage.authenticatePi().then(user => {
                        if (user) {
                            this.showNotification(`Welcome, ${user.username}!`);
                            piLoginBtn.style.display = 'none';
                        }
                    });
                });
            }
        }
    },

    /**
     * Show notification toast
     * @param {string} message
     * @param {string} type - 'success', 'error', 'info'
     */
    showNotification(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#d4a853'};
            color: ${type === 'error' || type === 'success' ? '#fff' : '#2d1f16'};
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Shake effect for errors
     * @param {HTMLElement} element
     */
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 400);
    }
};
