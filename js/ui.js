/**
 * ScoutBolt UI Manager
 */

const UI = {
    currentScreen: 'main-menu',
    isPaused: false,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Main menu
        document.getElementById('btn-play').addEventListener('click', () => {
            Audio.playClick();
            Game.loadLevel(Storage.getCurrentLevel());
        });

        document.getElementById('btn-levels').addEventListener('click', () => {
            Audio.playClick();
            this.showScreen('level-select');
            this.renderLevelSelect();
        });

        // Level select
        document.getElementById('btn-back-menu').addEventListener('click', () => {
            Audio.playClick();
            this.showScreen('main-menu');
        });

        // Game
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

        // Backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal && modal.id === 'pause-modal') {
                    this.togglePause();
                }
            });
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
        }
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            if (modalId === 'pause-modal') this.isPaused = true;
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            if (modalId === 'pause-modal') this.isPaused = false;
        }
    },

    togglePause() {
        if (this.isPaused) {
            this.hideModal('pause-modal');
            Game.resume();
        } else {
            this.showModal('pause-modal');
            Game.pause();
        }
    },

    updateMoves(moves) {
        document.getElementById('moves-display').textContent = `Moves: ${moves}`;
    },

    updateLevelTitle(levelId, levelName) {
        document.getElementById('current-level-title').textContent = 
            levelName ? `Level ${levelId}: ${levelName}` : `Level ${levelId}`;
    },

    showWin(stars, moves) {
        document.getElementById('star-display').textContent = '⭐'.repeat(stars);

        let message = '';
        if (stars === 3) message = 'Perfect! Amazing job!';
        else if (stars === 2) message = 'Great job!';
        else message = 'Level completed!';

        document.getElementById('win-message').textContent = message;

        const nextBtn = document.getElementById('btn-next');
        nextBtn.style.display = LevelData.getNextLevel(Game.currentLevel) ? 'block' : 'none';

        this.showModal('win-modal');
    },

    renderLevelSelect() {
        const container = document.getElementById('levels-container');
        container.innerHTML = '';

        LevelData.levels.forEach(level => {
            const btn = document.createElement('div');
            btn.className = 'level-btn';

            const isCompleted = Storage.isLevelCompleted(level.id);
            const isLocked = !Storage.isLevelUnlocked(level.id);
            const stars = Storage.getLevelStars(level.id);

            if (isCompleted) btn.classList.add('completed');
            if (isLocked) btn.classList.add('locked');

            if (isLocked) {
                btn.innerHTML = '<span class="lock-icon">🔒</span>';
            } else {
                btn.innerHTML = `
                    <span class="level-number">${level.id}</span>
                    ${isCompleted ? `<span class="stars">${'⭐'.repeat(stars)}</span>` : ''}
                `;
                btn.addEventListener('click', () => {
                    Audio.playClick();
                    Game.loadLevel(level.id);
                });
            }

            container.appendChild(btn);
        });
    },

    shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 400);
    }
};
