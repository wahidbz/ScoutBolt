/**
 * ScoutBolt Configuration
 * Centralized constants and game settings
 */

const CONFIG = {
    // Game Settings
    GAME: {
        MAX_LEVELS: 10,
        TARGET_FPS: 60,
        GRAVITY: 0.5,
        BOLT_RADIUS: 12,
        PARTICLE_COUNT: 8,
        CANVAS_WIDTH: 400,
        CANVAS_HEIGHT: 500
    },

    // Physics
    PHYSICS: {
        TERMINAL_VELOCITY: 15,
        ROTATION_DAMPING: 0.98,
        BOUNCE_DAMPING: 0.6,
        FRICTION: 0.99
    },

    // Audio
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.3,
        FREQUENCIES: {
            CLICK: 800,
            BOLT: 400,
            ERROR: 200,
            WIN: [523, 659, 784, 1047],
            UNLOCK: 600
        }
    },

    // Scoring
    SCORING: {
        STARS_3: 3,  // moves <= this for 3 stars
        STARS_2: 5,  // moves <= this for 2 stars
        STARS_1: 10  // moves <= this for 1 star
    },

    // Storage Keys
    STORAGE: {
        COMPLETED_LEVELS: 'scoutbolt_completed',
        CURRENT_LEVEL: 'scoutbolt_current',
        SETTINGS: 'scoutbolt_settings',
        PI_USER: 'scoutbolt_pi_user'
    },

    // Pi SDK (Future Integration)
    PI: {
        APP_ID: 'scoutbolt',  // Replace with actual Pi App ID
        SCOPES: ['payments', 'username'],
        NETWORK: 'Pi Network', // or 'Pi Testnet'
        REWARD_PER_LEVEL: 0.1  // Pi coins per level completion
    },

    // Colors
    COLORS: {
        WOOD: {
            DARK: '#4a3728',
            MEDIUM: '#6b5637',
            LIGHT: '#8b6f47',
            BEIGE: '#c9b896'
        },
        UI: {
            GOLD: '#d4a853',
            GOLD_LIGHT: '#f4d03f',
            RED: '#ff6b6b',
            TEAL: '#4ecdc4',
            GREEN: '#2ecc71'
        },
        PARTICLES: {
            GOLD: '#d4a853',
            RED: '#ff6b6b',
            TEAL: '#4ecdc4',
            WOOD: '#8b6f47'
        }
    },

    // Debug
    DEBUG: {
        ENABLED: false,
        SHOW_FPS: false,
        SHOW_COLLISION: false,
        LOG_LEVEL: 'warn' // 'debug', 'info', 'warn', 'error'
    }
};

// Prevent modification of CONFIG
Object.freeze(CONFIG);
Object.freeze(CONFIG.GAME);
Object.freeze(CONFIG.PHYSICS);
Object.freeze(CONFIG.AUDIO);
Object.freeze(CONFIG.SCORING);
Object.freeze(CONFIG.STORAGE);
Object.freeze(CONFIG.PI);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.DEBUG);

// Utility function for logging
const Logger = {
    debug: (...args) => CONFIG.DEBUG.ENABLED && console.log('[ScoutBolt]', ...args),
    info: (...args) => console.info('[ScoutBolt]', ...args),
    warn: (...args) => console.warn('[ScoutBolt]', ...args),
    error: (...args) => console.error('[ScoutBolt]', ...args)
};
