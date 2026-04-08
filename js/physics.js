/**
 * ScoutBolt Physics Engine
 * Handles gravity, collisions, and plate dynamics
 */

const Physics = {
    gravity: CONFIG.PHYSICS.GRAVITY,
    terminalVelocity: CONFIG.PHYSICS.TERMINAL_VELOCITY,

    /**
     * Initialize physics engine
     */
    init() {
        Logger.info('Physics engine initialized');
    },

    /**
     * Apply physics to a plate
     * @param {Object} plate - Plate object
     * @param {Object} bounds - Canvas bounds {width, height}
     */
    updatePlate(plate, bounds) {
        if (!plate.falling || plate.removed) return;

        // Apply gravity
        plate.vy += this.gravity;

        // Terminal velocity
        if (plate.vy > this.terminalVelocity) {
            plate.vy = this.terminalVelocity;
        }

        // Apply velocity
        plate.y += plate.vy;
        plate.x += plate.vx;

        // Apply rotation
        plate.rotation += plate.vRotation;
        plate.vRotation *= CONFIG.PHYSICS.ROTATION_DAMPING;

        // Air resistance
        plate.vx *= CONFIG.PHYSICS.FRICTION;

        // Check if off-screen
        if (plate.y > bounds.height + 100) {
            plate.removed = true;
        }
    },

    /**
     * Check collision between two plates
     * @param {Object} p1 - Plate 1
     * @param {Object} p2 - Plate 2
     * @returns {boolean}
     */
    checkCollision(p1, p2) {
        if (p1.removed || p2.removed) return false;

        // Simple AABB collision
        return (
            p1.x < p2.x + p2.width &&
            p1.x + p1.width > p2.x &&
            p1.y + p1.height > p2.y &&
            p1.y < p2.y + p2.height
        );
    },

    /**
     * Check if a falling plate hits a stationary plate
     * @param {Object} falling - Falling plate
     * @param {Object} stationary - Stationary plate
     * @returns {boolean}
     */
    checkImpact(falling, stationary) {
        if (!falling.falling || falling.removed || stationary.removed) return false;
        if (stationary.falling) return false;

        // Check if falling plate's bottom hits stationary plate's top
        const prevY = falling.y - falling.vy;

        return (
            falling.x < stationary.x + stationary.width &&
            falling.x + falling.width > stationary.x &&
            prevY + falling.height <= stationary.y &&
            falling.y + falling.height >= stationary.y
        );
    },

    /**
     * Handle collision response
     * @param {Object} falling - Falling plate
     * @param {Object} hit - Plate that was hit
     */
    handleCollision(falling, hit) {
        // Transfer momentum
        hit.falling = true;
        hit.vy = falling.vy * 0.8;
        hit.vx = falling.vx * 0.5;
        hit.vRotation = falling.vRotation * 0.5;

        // Bounce falling plate slightly
        falling.vy *= -CONFIG.PHYSICS.BOUNCE_DAMPING;
        falling.y = hit.y - falling.height;

        // Audio feedback
        Audio.playThud();

        // Dust effect
        const hitX = (falling.x + falling.width / 2);
        Particles.createDust(hitX, hit.y, hit.width);

        Logger.debug('Collision handled between plates');
    },

    /**
     * Check if a plate has support from another plate
     * @param {Object} plate - Plate to check
     * @param {Object[]} allPlates - All plates array
     * @returns {boolean}
     */
    hasSupport(plate, allPlates) {
        if (!plate.supports || plate.supports.length === 0) return false;

        // Check if any supporting plate still exists and is not falling
        return plate.supports.some(supportIdx => {
            const support = allPlates[supportIdx];
            return support && !support.removed && !support.falling;
        });
    },

    /**
     * Start plate falling
     * @param {Object} plate
     */
    startFalling(plate) {
        plate.falling = true;
        plate.vy = 2; // Initial push
        plate.vRotation = (Math.random() - 0.5) * 0.1;

        Logger.debug('Plate started falling:', plate.id);
    },

    /**
     * Get bounding box of plate considering rotation
     * @param {Object} plate
     * @returns {Object} {x, y, width, height}
     */
    getBoundingBox(plate) {
        if (plate.rotation === 0) {
            return {
                x: plate.x,
                y: plate.y,
                width: plate.width,
                height: plate.height
            };
        }

        // For rotated plates, approximate with larger box
        const cos = Math.abs(Math.cos(plate.rotation));
        const sin = Math.abs(Math.sin(plate.rotation));

        return {
            x: plate.x,
            y: plate.y,
            width: plate.width * cos + plate.height * sin,
            height: plate.width * sin + plate.height * cos
        };
    },

    /**
     * Update all physics for plates
     * @param {Object[]} plates
     * @param {Object} bounds
     */
    updateAll(plates, bounds) {
        // First pass: update falling plates
        plates.forEach(plate => {
            this.updatePlate(plate, bounds);
        });

        // Second pass: check collisions
        plates.forEach(plate => {
            if (!plate.falling || plate.removed) return;

            plates.forEach(other => {
                if (other.id === plate.id || other.removed || other.falling) return;

                if (this.checkImpact(plate, other)) {
                    this.handleCollision(plate, other);
                }
            });
        });
    },

    /**
     * Reset physics state for all plates
     * @param {Object[]} plates
     */
    reset(plates) {
        plates.forEach(plate => {
            plate.vx = 0;
            plate.vy = 0;
            plate.vRotation = 0;
            plate.rotation = 0;
            plate.falling = false;
            plate.removed = false;
        });
    }
};
