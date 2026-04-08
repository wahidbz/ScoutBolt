/**
 * ScoutBolt Renderer
 * Handles all canvas drawing operations
 */

const Renderer = {
    canvas: null,
    ctx: null,
    scale: 1,

    /**
     * Initialize renderer
     * @param {HTMLCanvasElement} canvas
     */
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        Logger.info('Renderer initialized');
    },

    /**
     * Resize canvas to fit container
     */
    resize() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        // Set display size
        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = container.clientHeight + 'px';

        // Set actual size (scaled for retina)
        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = container.clientHeight * dpr;

        // Normalize coordinate system
        this.ctx.scale(dpr, dpr);

        // Calculate game scale
        this.scale = Math.min(
            container.clientWidth / CONFIG.GAME.CANVAS_WIDTH,
            container.clientHeight / CONFIG.GAME.CANVAS_HEIGHT
        );

        Logger.debug('Canvas resized, scale:', this.scale);
    },

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * Draw a wood plate
     * @param {Object} plate
     */
    drawPlate(plate) {
        if (plate.removed) return;

        const ctx = this.ctx;

        ctx.save();

        // Calculate center for rotation
        const centerX = plate.x + plate.width / 2;
        const centerY = plate.y + plate.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(plate.rotation);

        // Wood gradient
        const gradient = ctx.createLinearGradient(
            -plate.width / 2, -plate.height / 2,
            plate.width / 2, plate.height / 2
        );
        gradient.addColorStop(0, plate.color);
        gradient.addColorStop(0.5, this.lightenColor(plate.color, 20));
        gradient.addColorStop(1, plate.color);

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8;

        // Main plate body
        ctx.fillStyle = gradient;
        this.roundRect(-plate.width / 2, -plate.height / 2, plate.width, plate.height, 8);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Wood grain texture
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        for (let i = -plate.width / 2 + 15; i < plate.width / 2; i += 25) {
            ctx.beginPath();
            ctx.moveTo(i, -plate.height / 2 + 5);

            // Wavy grain lines
            const cp1x = i + 5;
            const cp1y = -plate.height / 4;
            const cp2x = i - 5;
            const cp2y = plate.height / 4;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, i + 3, plate.height / 2 - 5);
            ctx.stroke();
        }

        // Border highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        this.roundRect(-plate.width / 2, -plate.height / 2, plate.width, plate.height, 8);
        ctx.stroke();

        // Plate ID (debug only)
        if (CONFIG.DEBUG.SHOW_COLLISION) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(plate.id, 0, 0);
        }

        ctx.restore();
    },

    /**
     * Draw a bolt
     * @param {Object} bolt
     * @param {Object} plate - Parent plate
     */
    drawBolt(bolt, plate) {
        if (bolt.removed) return;

        const ctx = this.ctx;
        const radius = bolt.radius;

        ctx.save();

        // Apply plate rotation to bolt position
        if (plate.rotation !== 0) {
            const centerX = plate.x + plate.width / 2;
            const centerY = plate.y + plate.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(plate.rotation);
            ctx.translate(-centerX, -centerY);
        }

        // Shadow
        ctx.beginPath();
        ctx.arc(bolt.x + 2, bolt.y + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Bolt head gradient
        const boltGrad = ctx.createRadialGradient(
            bolt.x - 3, bolt.y - 3, 0,
            bolt.x, bolt.y, radius
        );

        if (bolt.locked) {
            // Red for locked
            boltGrad.addColorStop(0, '#ff6b6b');
            boltGrad.addColorStop(0.7, '#c0392b');
            boltGrad.addColorStop(1, '#922b21');
        } else {
            // Gold for unlocked
            boltGrad.addColorStop(0, '#f4d03f');
            boltGrad.addColorStop(0.5, '#d4a853');
            boltGrad.addColorStop(1, '#b8941f');
        }

        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = boltGrad;
        ctx.fill();

        // Inner circle (indent)
        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = bolt.locked ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        ctx.fill();

        // Hexagon detail
        ctx.strokeStyle = bolt.locked ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const r = radius * 0.35;
            const px = bolt.x + Math.cos(angle) * r;
            const py = bolt.y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Lock icon for locked bolts
        if (bolt.locked) {
            ctx.fillStyle = '#fff';
            ctx.font = `${radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', bolt.x, bolt.y);

            // Glow effect
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(bolt.x, bolt.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,107,107,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    },

    /**
     * Draw all game objects
     * @param {Object[]} plates
     * @param {Object[]} bolts
     */
    drawGame(plates, bolts) {
        this.clear();

        // Draw plates
        plates.forEach(plate => {
            this.drawPlate(plate);
        });

        // Draw bolts
        bolts.forEach(bolt => {
            const plate = plates[bolt.plateId];
            if (plate && !plate.removed) {
                this.drawBolt(bolt, plate);
            }
        });

        // Draw particles
        Particles.render(this.ctx);
    },

    /**
     * Helper: Draw rounded rectangle
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} radius
     */
    roundRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },

    /**
     * Helper: Lighten color
     * @param {string} color - Hex color
     * @param {number} percent
     * @returns {string}
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    /**
     * Get canvas bounds
     * @returns {Object}
     */
    getBounds() {
        return {
            width: this.canvas.width / (window.devicePixelRatio || 1),
            height: this.canvas.height / (window.devicePixelRatio || 1)
        };
    },

    /**
     * Get current scale
     * @returns {number}
     */
    getScale() {
        return this.scale;
    }
};
