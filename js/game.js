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
    loadToken: 0,
    layoutScale: 1,
    layoutOffsetX: 0,
    layoutOffsetY: 0,

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

        UI.showScreen('game-screen');

        const token = ++this.loadToken;
        const finalizeLoad = () => {
            if (token !== this.loadToken) return;

            Renderer.resize();
            const layout = Renderer.getLayout();

            if (!layout.scale || !Number.isFinite(layout.scale) || layout.scale <= 0.01) {
                requestAnimationFrame(finalizeLoad);
                return;
            }

            this.buildLevel(levelData, layout);
            UI.updateLevelTitle(levelId, levelData.name);
            UI.updateMoves(0);
            Storage.setCurrentLevel(levelId);
        };

        requestAnimationFrame(finalizeLoad);
    },

    buildLevel(levelData, layout) {
        this.layoutScale = layout.scale;
        this.layoutOffsetX = layout.offsetX;
        this.layoutOffsetY = layout.offsetY;
        this.plates = [];
        this.bolts = [];

        levelData.plates.forEach((plateData, index) => {
            const plate = {
                id: index,
                x: layout.offsetX + plateData.x * layout.scale,
                y: layout.offsetY + plateData.y * layout.scale,
                width: plateData.width * layout.scale,
                height: plateData.height * layout.scale,
                color: plateData.color,
                bolts: plateData.bolts || [],
                supports: plateData.supports || [],
                vx: 0,
                vy: 0,
                rotation: 0,
                vRotation: 0,
                prevX: layout.offsetX + plateData.x * layout.scale,
                prevY: layout.offsetY + plateData.y * layout.scale,
                falling: false,
                removed: false
            };

            this.plates.push(plate);

            (plateData.bolts || []).forEach((boltData, boltIdx) => {
                const offsetX = (boltData.x - plateData.x) * layout.scale;
                const offsetY = (boltData.y - plateData.y) * layout.scale;

                this.bolts.push({
                    id: `${index}-${boltIdx}`,
                    x: plate.x + offsetX,
                    y: plate.y + offsetY,
                    offsetX,
                    offsetY,
                    radius: CONFIG.GAME.BOLT_RADIUS * layout.scale,
                    plateId: index,
                    locked: boltData.locked || false,
                    unlocksAfter: boltData.unlocksAfter || 0,
                    removed: false
                });
            });
        });
    },

    handleResize() {
        if (UI.currentScreen !== 'game-screen' || !this.plates.length) return;

        const layout = Renderer.getLayout();
        if (!layout.scale || !Number.isFinite(layout.scale)) return;

        const prevScale = this.layoutScale || 1;
        const prevOffsetX = this.layoutOffsetX || 0;
        const prevOffsetY = this.layoutOffsetY || 0;
        const ratio = layout.scale / prevScale;

        this.plates.forEach(plate => {
            plate.x = layout.offsetX + (plate.x - prevOffsetX) * ratio;
            plate.y = layout.offsetY + (plate.y - prevOffsetY) * ratio;
            plate.width *= ratio;
            plate.height *= ratio;
            plate.prevX = layout.offsetX + (plate.prevX - prevOffsetX) * ratio;
            plate.prevY = layout.offsetY + (plate.prevY - prevOffsetY) * ratio;
            plate.vx *= ratio;
            plate.vy *= ratio;
        });

        this.bolts.forEach(bolt => {
            bolt.offsetX *= ratio;
            bolt.offsetY *= ratio;
            bolt.radius *= ratio;
        });

        this.layoutScale = layout.scale;
        this.layoutOffsetX = layout.offsetX;
        this.layoutOffsetY = layout.offsetY;
        this.syncBolts();
    },

    syncBolts() {
        this.bolts.forEach(bolt => {
            if (bolt.removed) return;
            const plate = this.plates[bolt.plateId];
            if (!plate || plate.removed) return;
            bolt.x = plate.x + bolt.offsetX;
            bolt.y = plate.y + bolt.offsetY;
        });
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

        let unlocked = false;
        this.bolts.forEach(b => {
            if (b.locked && b.unlocksAfter === this.moves) {
                b.locked = false;
                unlocked = true;
                Particles.createUnlockEffect(b.x, b.y);
            }
        });
        if (unlocked) Audio.playUnlock();

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

        setTimeout(() => UI.showWin(stars), 500);
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
            UI.renderLevelSelect();
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
            this.syncBolts();
            Particles.update();
            this.checkWin();
        }

        Renderer.drawGame(this.plates, this.bolts);
        requestAnimationFrame(() => this.loop());
    }
};