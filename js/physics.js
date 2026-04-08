/**
 * ScoutBolt Physics Engine
 */

const Physics = {
    updatePlate(plate, bounds) {
        if (!plate.falling || plate.removed) return;

        plate.vy += CONFIG.PHYSICS.GRAVITY;

        if (plate.vy > CONFIG.PHYSICS.TERMINAL_VELOCITY) {
            plate.vy = CONFIG.PHYSICS.TERMINAL_VELOCITY;
        }

        plate.y += plate.vy;
        plate.x += plate.vx;
        plate.rotation += plate.vRotation;

        plate.vx *= 0.98;
        plate.vRotation *= 0.98;

        if (plate.y > bounds.height + 100) {
            plate.removed = true;
        }
    },

    checkCollision(p1, p2) {
        if (p1.removed || p2.removed) return false;

        return (
            p1.x < p2.x + p2.width &&
            p1.x + p1.width > p2.x &&
            p1.y + p1.height > p2.y &&
            p1.y < p2.y + p2.height
        );
    },

    checkImpact(falling, stationary) {
        if (!falling.falling || falling.removed || stationary.removed) return false;
        if (stationary.falling) return false;

        const prevY = falling.y - falling.vy;

        return (
            falling.x < stationary.x + stationary.width &&
            falling.x + falling.width > stationary.x &&
            prevY + falling.height <= stationary.y &&
            falling.y + falling.height >= stationary.y
        );
    },

    handleCollision(falling, hit) {
        hit.falling = true;
        hit.vy = falling.vy * 0.8;
        hit.vx = falling.vx * 0.5;
        hit.vRotation = falling.vRotation * 0.5;

        falling.vy *= -CONFIG.PHYSICS.BOUNCE_DAMPING;
        falling.y = hit.y - falling.height;

        Audio.playThud();
    },

    startFalling(plate) {
        plate.falling = true;
        plate.vy = 2;
        plate.vRotation = (Math.random() - 0.5) * 0.1;
    },

    updateAll(plates, bounds) {
        plates.forEach(plate => this.updatePlate(plate, bounds));

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
