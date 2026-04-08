/**
 * ScoutBolt Renderer
 */

const Renderer = {
    canvas: null,
    ctx: null,
    scale: 1,
    dpr: 1,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set display size
        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = container.clientHeight + 'px';

        // Set actual size with DPR
        this.canvas.width = container.clientWidth * this.dpr;
        this.canvas.height = container.clientHeight * this.dpr;

        // Calculate scale based on reference resolution
        this.scale = Math.min(
            container.clientWidth / CONFIG.GAME.CANVAS_WIDTH,
            container.clientHeight / CONFIG.GAME.CANVAS_HEIGHT
        );

        // Reset transform and scale
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
    },

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    },

    drawPlate(plate) {
        if (plate.removed) return;

        const ctx = this.ctx;

        ctx.save();

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

        // Main body
        ctx.fillStyle = gradient;
        this.roundRect(-plate.width / 2, -plate.height / 2, plate.width, plate.height, 8);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Wood grain
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;

        for (let i = -plate.width / 2 + 15; i < plate.width / 2; i += 25) {
            ctx.beginPath();
            ctx.moveTo(i, -plate.height / 2 + 5);
            ctx.bezierCurveTo(
                i + 5, -plate.height / 4,
                i - 5, plate.height / 4,
                i + 3, plate.height / 2 - 5
            );
            ctx.stroke();
        }

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        this.roundRect(-plate.width / 2, -plate.height / 2, plate.width, plate.height, 8);
        ctx.stroke();

        ctx.restore();
    },

    drawBolt(bolt, plate) {
        if (bolt.removed) return;

        const ctx = this.ctx;
        const radius = bolt.radius;

        ctx.save();

        // Apply plate rotation
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

        // Bolt gradient
        const boltGrad = ctx.createRadialGradient(
            bolt.x - 3, bolt.y - 3, 0,
            bolt.x, bolt.y, radius
        );

        if (bolt.locked) {
            boltGrad.addColorStop(0, '#ff6b6b');
            boltGrad.addColorStop(0.7, '#c0392b');
            boltGrad.addColorStop(1, '#922b21');
        } else {
            boltGrad.addColorStop(0, '#f4d03f');
            boltGrad.addColorStop(0.5, '#d4a853');
            boltGrad.addColorStop(1, '#b8941f');
        }

        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = boltGrad;
        ctx.fill();

        // Inner indent
        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = bolt.locked ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        ctx.fill();

        // Hexagon
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

        // Lock icon
        if (bolt.locked) {
            ctx.fillStyle = '#fff';
            ctx.font = `${radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', bolt.x, bolt.y);
        }

        ctx.restore();
    },

    drawGame(plates, bolts) {
        this.clear();

        // Draw plates
        plates.forEach(plate => this.drawPlate(plate));

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

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    getBounds() {
        return {
            width: this.canvas.width / this.dpr,
            height: this.canvas.height / this.dpr
        };
    },

    getScale() {
        return this.scale;
    }
};
