/**
 * ScoutBolt Physics Engine
 */

const Physics = {
    updatePlate(plate, bounds) {
        if (!plate.falling || plate.removed) return;

        plate.prevX = plate.x;
        plate.prevY = plate.y;

        plate.vy = Math.min(
            plate.vy + CONFIG.PHYSICS.GRAVITY,
            CONFIG.PHYSICS.TERMINAL_VELOCITY
        );

        plate.x += plate.vx;
        plate.y += plate.vy;
        plate.rotation += plate.vRotation;

        plate.vx *= CONFIG.PHYSICS.AIR_DRAG;
        plate.vRotation *= CONFIG.PHYSICS.ROTATION_DAMPING;

        if (plate.x < 0) {
            plate.x = 0;
            plate.vx = Math.abs(plate.vx) * CONFIG.PHYSICS.HORIZONTAL_BOUNCE;
            plate.vRotation *= 0.9;
        }

        if (plate.x + plate.width > bounds.width) {
            plate.x = bounds.width - plate.width;
            plate.vx = -Math.abs(plate.vx) * CONFIG.PHYSICS.HORIZONTAL_BOUNCE;
            plate.vRotation *= 0.9;
        }

        if (plate.y > bounds.height + Math.max(plate.height, 120)) {
            plate.removed = true;
        }
    },

    checkCollision(p1, p2) {
        if (p1.removed || p2.removed) return false;

        return (
            p1.x < p2.x + p2.width &&
            p1.x + p1.width > p2.x &&
            p1.y < p2.y + p2.height &&
            p1.y + p1.height > p2.y
        );
    },

    checkImpact(falling, stationary) {
        if (!falling.falling || falling.removed || stationary.removed) return false;
        if (stationary.falling || falling.vy <= 0) return false;

        const prevBottom = (falling.prevY ?? (falling.y - falling.vy)) + falling.height;
        const currentBottom = falling.y + falling.height;
        const overlapX = Math.min(
            falling.x + falling.width,
            stationary.x + stationary.width
        ) - Math.max(falling.x, stationary.x);

        if (overlapX <= Math.min(falling.width, stationary.width) * 0.15) {
            return false;
        }

        return (
            prevBottom <= stationary.y + Math.max(6, stationary.height * 0.18) &&
            currentBottom >= stationary.y
        );
    },

    handleCollision(falling, hit) {
        const impactVelocity = Math.max(Math.abs(falling.vy), CONFIG.PHYSICS.MIN_BOUNCE_VELOCITY);
        const horizontalBias = (
            (falling.x + falling.width / 2) - (hit.x + hit.width / 2)
        ) / Math.max(hit.width, 1);

        hit.falling = true;
        hit.vy = Math.max(hit.vy, impactVelocity * CONFIG.PHYSICS.IMPACT_TRANSFER);
        hit.vx += horizontalBias * 2.6 + falling.vx * 0.35;
        hit.vRotation += horizontalBias * 0.08;

        falling.y = hit.y - falling.height - 0.5;
        falling.vy = -Math.max(
            impactVelocity * CONFIG.PHYSICS.BOUNCE_DAMPING,
            CONFIG.PHYSICS.MIN_BOUNCE_VELOCITY
        );
        falling.vx += horizontalBias * 1.4;
        falling.vRotation += horizontalBias * 0.05;

        Audio.playThud();
    },

    startFalling(plate) {
        plate.falling = true;
        plate.vy = Math.max(plate.vy, 1.5);
        plate.vx += (Math.random() - 0.5) * 1.1;
        plate.vRotation += (Math.random() - 0.5) * 0.06;
    },

    updateAll(plates, bounds) {
        plates.forEach(plate => this.updatePlate(plate, bounds));

        plates.forEach(plate => {
            if (!plate.falling || plate.removed) return;

            for (const other of plates) {
                if (other.id === plate.id || other.removed || other.falling) continue;
                if (this.checkImpact(plate, other)) {
                    this.handleCollision(plate, other);
                    break;
                }
            }
        });
    },

    reset(plates) {
        plates.forEach(plate => {
            plate.vx = 0;
            plate.vy = 0;
            plate.vRotation = 0;
            plate.rotation = 0;
            plate.prevX = plate.x;
            plate.prevY = plate.y;
            plate.falling = false;
            plate.removed = false;
        });
    }
};