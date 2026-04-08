/**
 * ScoutBolt Input Manager
 */

const Input = {
    canvas: null,
    game: null,

    init(canvas, gameRef) {
        this.canvas = canvas;
        this.game = gameRef;
        this.bindEvents();
    },

    bindEvents() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouse(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Prevent zoom on double-tap
        let lastTouchEnd = 0;
        this.canvas.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, false);
    },

    handleTouch(e) {
        e.preventDefault();
        if (!this.game || this.game.isPaused) return;

        const touch = e.touches[0];
        const coords = this.getCoordinates(touch.clientX, touch.clientY);
        this.processInput(coords.x, coords.y);
        Audio.resume();
    },

    handleMouse(e) {
        if (!this.game || this.game.isPaused) return;

        const coords = this.getCoordinates(e.clientX, e.clientY);
        this.processInput(coords.x, coords.y);
        Audio.resume();
    },

    getCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Calculate position relative to canvas element
        const x = (clientX - rect.left) * (this.canvas.width / rect.width) / dpr;
        const y = (clientY - rect.top) * (this.canvas.height / rect.height) / dpr;

        return { x, y };
    },

    processInput(x, y) {
        if (!this.game) return;

        let boltClicked = false;

        this.game.bolts.forEach(bolt => {
            if (bolt.removed) return;

            const dx = x - bolt.x;
            const dy = y - bolt.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Larger hit area for mobile
            const hitRadius = bolt.radius * 2.5;

            if (distance < hitRadius) {
                boltClicked = true;
                this.game.onBoltClick(bolt);
            }
        });

        if (boltClicked && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
};
