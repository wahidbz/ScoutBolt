/**
 * ScoutBolt - Main Entry Point
 * Initializes all game systems and starts the game loop
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    Logger.info('ScoutBolt initializing...');

    // Initialize systems in order
    try {
        // 1. Audio (must be initialized on user interaction)
        Audio.init();

        // 2. Storage
        Storage.init();

        // 3. UI
        UI.init();

        // 4. Game (initializes renderer, input, physics, particles)
        Game.init();

        // 5. Start game loop
        Game.loop();

        Logger.info('ScoutBolt fully initialized and running');

    } catch (error) {
        Logger.error('Initialization failed:', error);
        console.error('ScoutBolt failed to start:', error);
    }
});

// Handle page visibility changes (pause when tab hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (Game && !Game.isComplete) {
            Game.pause();
        }
    } else {
        if (Game && UI.currentScreen === 'game-screen') {
            // Don't auto-resume, let user click resume
        }
    }
});

// Handle orientation change on mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (Renderer) Renderer.resize();
    }, 100);
});

// Prevent zoom on double-tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent pull-to-refresh on mobile
document.body.style.overscrollBehavior = 'none';

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Prevent scrolling with space/arrows
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }
});

// Service Worker registration (for PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                Logger.info('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                Logger.warn('ServiceWorker registration failed:', error);
            });
    });
}

// Expose game to global scope for debugging (remove in production)
if (CONFIG.DEBUG.ENABLED) {
    window.ScoutBolt = {
        Game,
        UI,
        Storage,
        Audio,
        Particles,
        Physics,
        Renderer,
        LevelData,
        CONFIG
    };
}
