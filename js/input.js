/**
 * ScoutBolt Input Manager
 * Handles touch and mouse interactions
 */

const Input = {
    canvas: null,
    game: null,

    /**
     * Initialize input handling
     * @param {HTMLCanvasElement} canvas
     * @param {Object} gameRef - Reference to game object
     */
    init(canvas, gameRef) {
        this.canvas = canvas;
        this.game = gameRef;

        this.bindEvents();
        Logger.info('Input initialized');
    },

    /**
     * Bind all input events
     */
    bindEvents() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouse(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard (for accessibility)
        document.addEventListener('keydown', (e) => this.handleKey(e));
    },

    /**
     * Handle touch events
     * @param {TouchEvent} e
     */
    handleTouch(e) {
        e.preventDefault();

        if (!this.game || this.game.isPaused) return;

        const touch = e.touches[0];
        const coords = this.getCoordinates(touch.clientX, touch.clientY);

        this.processInput(coords.x, coords.y);

        // Resume audio context on user interaction
        Audio.resume();
    },

    /**
     * Handle mouse events
     * @param {MouseEvent} e
     */
    handleMouse(e) {
        if (!this.game || this.game.isPaused) return;

        const coords = this.getCoordinates(e.clientX, e.clientY);
        this.processInput(coords.x, coords.y);

        Audio.resume();
    },

    /**
     * Handle mouse move (for hover effects)
     * @param {MouseEvent} e
     */
    handleMouseMove(e) {
        // Could be used for hover effects in future
    },

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e
     */
    handleKey(e) {
        switch(e.key) {
            case 'Escape':
                UI.togglePause();
                break;
            case 'r':
            case 'R':
                if (this.game) this.game.restart();
                break;
            case 'n':
            case 'N':
                if (this.game && this.game.isComplete) this.game.nextLevel();
                break;
        }
    },

    /**
     * Convert screen coordinates to canvas coordinates
     * @param {number} clientX
     * @param {number} clientY
     * @returns {Object} {x, y}
     */
    getCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        return {
            x: (clientX - rect.left) * (this.canvas.width / rect.width) / dpr,
            y: (clientY - rect.top) * (this.canvas.height / rect.height) / dpr
        };
    },

    /**
     * Process input at coordinates
     * @param {number} x
     * @param {number} y
     */
    processInput(x, y) {
        if (!this.game) return;

        // Check bolt clicks
        let boltClicked = false;

        this.game.bolts.forEach(bolt => {
            if (bolt.removed) return;

            const dx = x - bolt.x;
            const dy = y - bolt.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Larger hit area for mobile friendliness
            const hitRadius = bolt.radius * 2.5;

            if (distance < hitRadius) {
                boltClicked = true;
                this.game.onBoltClick(bolt);
            }
        });

        if (boltClicked) {
            // Haptic feedback if available
            if (navigator.vibrate && Storage.getSettings().vibration) {
                navigator.vibrate(50);
            }
        }
    },

    /**
     * Check if point is near a bolt (for hover effects)
     * @param {number} x
     * @param {number} y
     * @returns {Object|null} Bolt or null
     */
    getBoltAt(x, y) {
        if (!this.game) return null;

        for (let bolt of this.game.bolts) {
            if (bolt.removed) continue;

            const dx = x - bolt.x;
            const dy = y - bolt.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bolt.radius * 2) {
                return bolt;
            }
        }

        return null;
    },

    /**
     * Disable input temporarily
     * @param {number} duration - Milliseconds
     */
    disable(duration = 500) {
        this.canvas.style.pointerEvents = 'none';
        setTimeout(() => {
            this.canvas.style.pointerEvents = 'auto';
        }, duration);
    }
};
