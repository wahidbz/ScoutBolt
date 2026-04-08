/**
 * ScoutBolt Particle System
 * Visual effects for game interactions
 */

const Particles = {
    particles: [],

    /**
     * Initialize particle system
     */
    init() {
        this.particles = [];
        Logger.info('Particles initialized');
    },

    /**
     * Create explosion particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {number} count - Number of particles
     * @param {string} type - Particle type: 'explosion', 'sparkle', 'dust'
     */
    create(x, y, color, count = 8, type = 'explosion') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 8 + 4;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.02,
                color: color,
                size: Math.random() * 4 + 2,
                type: type,
                gravity: type === 'dust' ? 0.1 : 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    },

    /**
     * Create bolt removal effect
     * @param {number} x
     * @param {number} y
     */
    createBoltEffect(x, y) {
        this.create(x, y, CONFIG.COLORS.PARTICLES.GOLD, 10, 'explosion');
        this.create(x, y, '#fff', 5, 'sparkle');
    },

    /**
     * Create unlock effect
     * @param {number} x
     * @param {number} y
     */
    createUnlockEffect(x, y) {
        this.create(x, y, CONFIG.COLORS.PARTICLES.TEAL, 6, 'sparkle');
    },

    /**
     * Create error/locked effect
     * @param {number} x
     * @param {number} y
     */
    createErrorEffect(x, y) {
        this.create(x, y, CONFIG.COLORS.PARTICLES.RED, 5, 'dust');
    },

    /**
     * Create plate fall dust
     * @param {number} x
     * @param {number} y
     * @param {number} width
     */
    createDust(x, y, width) {
        const count = Math.floor(width / 20);
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (i * 20),
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2,
                life: 0.8,
                decay: 0.015,
                color: CONFIG.COLORS.PARTICLES.WOOD,
                size: Math.random() * 3 + 1,
                type: 'dust',
                gravity: 0.05,
                rotation: 0,
                rotationSpeed: 0
            });
        }
    },

    /**
     * Create win celebration
     * @param {number} x
     * @param {number} y
     */
    createWinEffect(x, y) {
        const colors = [
            CONFIG.COLORS.PARTICLES.GOLD,
            CONFIG.COLORS.UI.GOLD_LIGHT,
            '#fff',
            CONFIG.COLORS.PARTICLES.TEAL
        ];

        colors.forEach((color, i) => {
            setTimeout(() => {
                this.create(x, y, color, 12, 'sparkle');
            }, i * 100);
        });
    },

    /**
     * Update all particles
     */
    update() {
        this.particles = this.particles.filter(p => {
            // Physics
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;

            // Air resistance
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Life decay
            p.life -= p.decay;

            return p.life > 0;
        });
    },

    /**
     * Render particles to canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            // Draw based on type
            if (p.type === 'sparkle') {
                // Star shape
                ctx.fillStyle = p.color;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const r = i % 2 === 0 ? p.size : p.size / 2;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'dust') {
                // Soft circle
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Default square
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            }

            ctx.restore();
        });

        ctx.globalAlpha = 1;
    },

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    },

    /**
     * Get active particle count
     * @returns {number}
     */
    getCount() {
        return this.particles.length;
    }
};
