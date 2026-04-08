/**
 * ScoutBolt - Main Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
    Logger.info('ScoutBolt initializing...');

    try {
        Audio.init();
        UI.init();
        Game.init();

        Logger.info('ScoutBolt ready');
    } catch (error) {
        Logger.error('Initialization failed:', error);
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !Game.isComplete) {
        Game.pause();
    }
});

// Prevent zoom
document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) e.preventDefault();
}, { passive: false });

// Prevent pull-to-refresh
document.body.style.overscrollBehavior = 'none';
