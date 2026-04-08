/**
 * ScoutBolt Configuration
 */

const CONFIG = {
    GAME: {
        MAX_LEVELS: 10,
        BOLT_RADIUS: 12,
        CANVAS_WIDTH: 400,
        CANVAS_HEIGHT: 500
    },

    PHYSICS: {
        GRAVITY: 0.45,
        TERMINAL_VELOCITY: 14,
        BOUNCE_DAMPING: 0.42,
        AIR_DRAG: 0.995,
        ROTATION_DAMPING: 0.985,
        HORIZONTAL_BOUNCE: 0.35,
        IMPACT_TRANSFER: 0.72,
        MIN_BOUNCE_VELOCITY: 1.2
    },

    AUDIO: {
        ENABLED: true,
        VOLUME: 0.3
    },

    SCORING: {
        STARS_3: 3,
        STARS_2: 5,
        STARS_1: 10
    },

    STORAGE: {
        COMPLETED_LEVELS: 'scoutbolt_completed',
        CURRENT_LEVEL: 'scoutbolt_current'
    },

    COLORS: {
        WOOD_DARK: '#4a3728',
        WOOD_MEDIUM: '#6b5637',
        WOOD_LIGHT: '#8b6f47',
        GOLD: '#d4a853',
        GOLD_LIGHT: '#f4d03f',
        RED: '#ff6b6b',
        TEAL: '#4ecdc4'
    }
};

const Logger = {
    debug: (...args) => console.log('[ScoutBolt]', ...args),
    info: (...args) => console.info('[ScoutBolt]', ...args),
    error: (...args) => console.error('[ScoutBolt]', ...args)
};