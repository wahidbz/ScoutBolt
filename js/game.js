/**
 * ScoutBolt Game Engine
 */

const Game = {
    currentLevel: 1,
    moves: 0,
    isComplete: false,
    isPaused: false,

    plates: [],
    bolts: [],

    canvas: null,

    init() {
        this.canvas = document.getElementById('game-canvas');

        Renderer.init(this.canvas);
        Particles.init();
        Input.init(this.canvas, this);

        this.loop();
    },

    loadLevel(levelId) {
        const levelData = LevelData.getLevel(levelId);
        if (!levelData) return;

        this.currentLevel = levelId;
        this.moves = 0;
        this.isComplete = false;
        this.isPaused = false;

        this.plates = [];
        this.bolts = [];
        Particles.clear();

        const scale = Renderer.getScale();

        // Create plates with scaled coordinates
        levelData.plates.forEach((plateData, index) => {
            this.plates.push({
                id: index,
                x: plateData.x * scale,
                y: plateData.y * scale,
                width: plateData.width * scale,
                height: plateData.height * scale,
                color: plateData.color,
                bolts: plateData.bolts || [],
                supports: plateData.supports || [],

                vx: 0,
                vy: 0,
                rotation: 0,
                vRotation: 0,
                falling: false,
                removed: false
            });
        });

        // Create bolts with scaled coordinates
        this.plates.forEach((plate, plateIdx) => {
            plate.bolts.forEach((boltData, boltIdx) => {
                this.bolts.push({
                    id: `${plateIdx}-${boltIdx}`,
                    x: boltData.x * scale,
                    y: boltData.y * scale,
                    radius: CONFIG.GAME.BOLT_RADIUS * scale,
                    plateId: plateIdx,
                    locked: boltData.locked || false,
                    unlocksAfter: boltData.unlocksAfter || 0,
                    removed: false
                });
            });
        });

        UI.updateLevelTitle(levelId, levelData.name);
        UI.updateMoves(0);
        UI.showScreen('game-screen');
        Storage.setCurrentLevel(levelId);
    },

    onBoltClick(bolt) {
        if (this.isPaused || this.isComplete) return;

        if (bolt.locked) {
            Audio.playError();
            Particles.createErrorEffect(bolt.x, bolt.y);
            UI.shake(this.canvas);
            return;
        }

        bolt.removed = true;
        this.moves++;

        Audio.playBolt();
        Particles.createBoltEffect(bolt.x, bolt.y);
        UI.updateMoves(this.moves);

        // Unlock bolts
        let unlocked = false;
        this.bolts.forEach(b => {
            if (b.locked && b.unlocksAfter === this.moves) {
                b.locked = false;
                unlocked = true;
                Particles.createUnlockEffect(b.x, b.y);
            }
        });
        if (unlocked) Audio.playUnlock();

        // Check plate fall
        const plate = this.plates[bolt.plateId];
        const remaining = this.bolts.filter(b => b.plateId === bolt.plateId && !b.removed);
        if (remaining.length === 0 && !plate.falling) {
            Physics.startFalling(plate);
        }

        this.checkWin();
    },

    checkWin() {
        const target = this.plates[this.plates.length - 1];
        if (!target) return;

        if (target.removed || (target.falling && target.y > Renderer.getBounds().height + 50)) {
            if (!this.isComplete) {
                this.win();
            }
        }
    },

    win() {
        this.isComplete = true;

        let stars = 1;
        if (this.moves <= CONFIG.SCORING.STARS_3) stars = 3;
        else if (this.moves <= CONFIG.SCORING.STARS_2) stars = 2;

        Storage.completeLevel(this.currentLevel, stars);

        Audio.playWin();
        Particles.createWinEffect(
            Renderer.getBounds().width / 2,
            Renderer.getBounds().height / 2
        );

        setTimeout(() => UI.showWin(stars, this.moves), 500);
    },

    restart() {
        this.loadLevel(this.currentLevel);
    },

    nextLevel() {
        const next = LevelData.getNextLevel(this.currentLevel);
        if (next) {
            this.loadLevel(next);
        } else {
            UI.showScreen('level-select');
        }
    },

    pause() {
        this.isPaused = true;
    },

    resume() {
        this.isPaused = false;
    },

    loop() {
        if (!this.isPaused && !this.isComplete) {
            Physics.updateAll(this.plates, Renderer.getBounds());
            Particles.update();
            this.checkWin();
        }

        Renderer.drawGame(this.plates, this.bolts);
        requestAnimationFrame(() => this.loop());
    }
};
