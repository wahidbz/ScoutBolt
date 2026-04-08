/**
 * ScoutBolt Renderer
 */

const Renderer = {
    canvas: null,
    ctx: null,
    scale: 1,
    dpr: 1,
    offsetX: 0,
    offsetY: 0,
    viewportWidth: CONFIG.GAME.CANVAS_WIDTH,
    viewportHeight: CONFIG.GAME.CANVAS_HEIGHT,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.resize();

        window.addEventListener('resize', () => {
            this.resize();
            if (typeof Game !== 'undefined' && Game && typeof Game.handleResize === 'function') {
                Game.handleResize();
            }
        });
    },

    resize() {
        if (!this.canvas || !this.ctx) return;

        this.dpr = window.devicePixelRatio || 1;

        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = Math.max(
            1,
            Math.round(rect.width || this.canvas.clientWidth || Math.min(window.innerWidth, 600) || CONFIG.GAME.CANVAS_WIDTH)
        );
        const displayHeight = Math.max(
            1,
            Math.round(rect.height || this.canvas.clientHeight || Math.max(window.innerHeight - 170, 360) || CONFIG.GAME.CANVAS_HEIGHT)
        );

        this.canvas.width = Math.round(displayWidth * this.dpr);
        this.canvas.height = Math.round(displayHeight * this.dpr);
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        this.scale = Math.min(
            displayWidth / CONFIG.GAME.CANVAS_WIDTH,
            displayHeight / CONFIG.GAME.CANVAS_HEIGHT
        ) || 1;

        this.viewportWidth = CONFIG.GAME.CANVAS_WIDTH * this.scale;
        this.viewportHeight = CONFIG.GAME.CANVAS_HEIGHT * this.scale;
        this.offsetX = (displayWidth - this.viewportWidth) / 2;
        this.offsetY = (displayHeight - this.viewportHeight) / 2;

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = true;
    },

    clear() {
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        const background = ctx.createLinearGradient(0, 0, 0, height);
        background.addColorStop(0, '#4b2d1f');
        background.addColorStop(0.55, '#352116');
        background.addColorStop(1, '#26160f');
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.035)';
        ctx.fillRect(this.offsetX, this.offsetY, this.viewportWidth, this.viewportHeight);
        ctx.strokeStyle = 'rgba(212,168,83,0.14)';
        ctx.lineWidth = 2;
        this.roundRect(this.offsetX + 1, this.offsetY + 1, this.viewportWidth - 2, this.viewportHeight - 2, 14);
        ctx.stroke();
        ctx.restore();
    },

    drawPlate(plate) {
        if (plate.removed) return;

        const ctx = this.ctx;

        ctx.save();

        const centerX = plate.x + plate.width / 2;
        const centerY = plate.y + plate.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(plate.rotation);

        const gradient = ctx.createLinearGradient(
            -plate.width / 2, -plate.height / 2,
            plate.width / 2, plate.height / 2
        );
        gradient.addColorStop(0, this.lightenColor(plate.color, 8));
        gradient.addColorStop(0.35, plate.color);
        gradient.addColorStop(0.7, this.lightenColor(plate.color, 18));
        gradient.addColorStop(1, this.lightenColor(plate.color, -8));

        ctx.shadowColor = 'rgba(0,0,0,0.38)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 10;

        ctx.fillStyle = gradient;
        this.roundRect(-plate.width / 2, -plate.height / 2, plate.width, plate.height, Math.max(8, plate.height * 0.12));
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        this.roundRect(-plate.width / 2 + 4, -plate.height / 2 + 4, plate.width - 8, Math.max(8, plate.height * 0.18), 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.14)';
        ctx.lineWidth = 2;
        for (let i = -plate.width / 2 + 15; i < plate.width / 2; i += 24) {
            ctx.beginPath();
            ctx.moveTo(i, -plate.height / 2 + 6);
            ctx.bezierCurveTo(
                i + 7, -plate.height / 4,
                i - 6, plate.height / 4,
                i + 4, plate.height / 2 - 6
            );
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        this.roundRect(-plate.width / 2, -plate.height / 2, plate.width, plate.height, Math.max(8, plate.height * 0.12));
        ctx.stroke();

        ctx.restore();
    },

    drawBolt(bolt, plate) {
        if (bolt.removed) return;

        const ctx = this.ctx;
        const radius = bolt.radius;
        const interactive = !bolt.locked && !plate.falling;
        const pulse = 0.82 + Math.sin(performance.now() / 220 + bolt.x * 0.025) * 0.18;

        ctx.save();

        if (plate.rotation !== 0) {
            const centerX = plate.x + plate.width / 2;
            const centerY = plate.y + plate.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(plate.rotation);
            ctx.translate(-centerX, -centerY);
        }

        if (interactive) {
            ctx.beginPath();
            ctx.arc(bolt.x, bolt.y, radius * 1.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 208, 63, ${0.10 + pulse * 0.12})`;
            ctx.shadowColor = 'rgba(244, 208, 63, 0.9)';
            ctx.shadowBlur = radius * (1.7 + pulse * 0.5);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(bolt.x + radius * 0.12, bolt.y + radius * 0.2, radius * 0.98, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fill();

        const boltGrad = ctx.createRadialGradient(
            bolt.x - radius * 0.35, bolt.y - radius * 0.45, radius * 0.12,
            bolt.x, bolt.y, radius
        );

        if (bolt.locked) {
            boltGrad.addColorStop(0, '#ffb2b2');
            boltGrad.addColorStop(0.35, '#ff6b6b');
            boltGrad.addColorStop(0.7, '#c0392b');
            boltGrad.addColorStop(1, '#7f1d1d');
        } else {
            boltGrad.addColorStop(0, '#fff8ba');
            boltGrad.addColorStop(0.24, '#f9e27d');
            boltGrad.addColorStop(0.55, '#d4a853');
            boltGrad.addColorStop(0.82, '#b8860b');
            boltGrad.addColorStop(1, '#7f5a00');
        }

        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = boltGrad;
        ctx.shadowColor = interactive ? 'rgba(255, 215, 80, 0.55)' : 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = interactive ? radius * 0.9 : radius * 0.3;
        ctx.fill();
        ctx.shadowBlur = 0;

        const rimGrad = ctx.createLinearGradient(
            bolt.x - radius, bolt.y - radius,
            bolt.x + radius, bolt.y + radius
        );
        rimGrad.addColorStop(0, 'rgba(255,255,255,0.65)');
        rimGrad.addColorStop(0.35, 'rgba(255,255,255,0.12)');
        rimGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius * 0.93, 0, Math.PI * 2);
        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = Math.max(2, radius * 0.14);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(bolt.x - radius * 0.18, bolt.y - radius * 0.24, radius * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.38)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, radius * 0.56, 0, Math.PI * 2);
        ctx.fillStyle = bolt.locked ? 'rgba(255,255,255,0.16)' : 'rgba(68,44,0,0.22)';
        ctx.fill();

        ctx.strokeStyle = bolt.locked ? 'rgba(255,255,255,0.42)' : 'rgba(74,55,15,0.58)';
        ctx.lineWidth = Math.max(2, radius * 0.12);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 + Math.PI / 6;
            const hexRadius = radius * 0.33;
            const px = bolt.x + Math.cos(angle) * hexRadius;
            const py = bolt.y + Math.sin(angle) * hexRadius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        if (bolt.locked) {
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.max(10, radius * 0.9)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', bolt.x, bolt.y + 1);
        }

        ctx.restore();
    },

    drawGame(plates, bolts) {
        this.clear();

        const boltsByPlate = new Map();
        bolts.forEach(bolt => {
            if (!boltsByPlate.has(bolt.plateId)) {
                boltsByPlate.set(bolt.plateId, []);
            }
            boltsByPlate.get(bolt.plateId).push(bolt);
        });

        plates.forEach(plate => {
            this.drawPlate(plate);
            const plateBolts = boltsByPlate.get(plate.id) || [];
            plateBolts.forEach(bolt => {
                if (!plate.removed) {
                    this.drawBolt(bolt, plate);
                }
            });
        });

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
        const clean = color.replace('#', '');
        const num = parseInt(clean, 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    },

    getBounds() {
        return {
            width: this.canvas.width / this.dpr,
            height: this.canvas.height / this.dpr
        };
    },

    getScale() {
        return this.scale;
    },

    getLayout() {
        return {
            scale: this.scale,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            width: this.viewportWidth,
            height: this.viewportHeight
        };
    }
};