/**
 * ScoutBolt Particle System
 */

const Particles = {
    particles: [],

    init() {
        this.particles = [];
    },

    create(x, y, color, count = 8) {
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
                gravity: 0.3
            });
        }
    },

    createBoltEffect(x, y) {
        this.create(x, y, CONFIG.COLORS.GOLD, 10);
        this.create(x, y, '#fff', 5);
    },

    createUnlockEffect(x, y) {
        this.create(x, y, CONFIG.COLORS.TEAL, 6);
    },

    createErrorEffect(x, y) {
        this.create(x, y, CONFIG.COLORS.RED, 5);
    },

    createWinEffect(x, y) {
        const colors = [CONFIG.COLORS.GOLD, CONFIG.COLORS.GOLD_LIGHT, '#fff', CONFIG.COLORS.TEAL];
        colors.forEach((color, i) => {
            setTimeout(() => this.create(x, y, color, 12), i * 100);
        });
    },

    update() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;
            return p.life > 0;
        });
    },

    render(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    },

    clear() {
        this.particles = [];
    }
};
