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
        if (window.PointerEvent) {
            this.canvas.addEventListener('pointerdown', (e) => this.handlePointer(e), { passive: false });
            this.canvas.addEventListener('pointermove', (e) => {
                if (e.pointerType === 'touch') e.preventDefault();
            }, { passive: false });
            this.canvas.addEventListener('pointercancel', (e) => e.preventDefault(), { passive: false });
        } else {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
            this.canvas.addEventListener('mousedown', (e) => this.handleMouse(e));
        }

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        let lastTouchEnd = 0;
        this.canvas.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, false);
    },

    handlePointer(e) {
        if (e.pointerType === 'touch') e.preventDefault();
        if (!this.game || this.game.isPaused) return;

        const coords = this.getCoordinates(e.clientX, e.clientY);
        this.processInput(coords.x, coords.y);
        Audio.resume();
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

        const x = (clientX - rect.left) * (this.canvas.width / rect.width) / dpr;
        const y = (clientY - rect.top) * (this.canvas.height / rect.height) / dpr;

        return { x, y };
    },

    processInput(x, y) {
        if (!this.game) return;

        let closestBolt = null;
        let closestDistanceSq = Infinity;

        this.game.bolts.forEach(bolt => {
            const plate = this.game.plates[bolt.plateId];
            if (!plate || bolt.removed || plate.removed || plate.falling) return;

            const dx = x - bolt.x;
            const dy = y - bolt.y;
            const distanceSq = dx * dx + dy * dy;
            const hitRadius = Math.max(bolt.radius * 2.1, 18);
            const hitRadiusSq = hitRadius * hitRadius;

            if (distanceSq <= hitRadiusSq && distanceSq < closestDistanceSq) {
                closestBolt = bolt;
                closestDistanceSq = distanceSq;
            }
        });

        if (!closestBolt) return;

        this.game.onBoltClick(closestBolt);

        if (navigator.vibrate) {
            navigator.vibrate(closestBolt.locked ? 80 : 50);
        }
    }
};