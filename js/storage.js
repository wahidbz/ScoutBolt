/**
 * ScoutBolt Storage Manager
 */

const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (e) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            return false;
        }
    },

    getCompletedLevels() {
        return this.get(CONFIG.STORAGE.COMPLETED_LEVELS, []);
    },

    completeLevel(levelId, stars) {
        const completed = this.getCompletedLevels();
        const existing = completed.findIndex(c => c.id === levelId);
        const record = { id: levelId, stars, date: Date.now() };

        if (existing >= 0) {
            if (stars > completed[existing].stars) {
                completed[existing] = record;
            }
        } else {
            completed.push(record);
        }

        this.set(CONFIG.STORAGE.COMPLETED_LEVELS, completed);
    },

    isLevelCompleted(levelId) {
        return this.getCompletedLevels().some(c => c.id === levelId);
    },

    getLevelStars(levelId) {
        const record = this.getCompletedLevels().find(c => c.id === levelId);
        return record ? record.stars : 0;
    },

    isLevelUnlocked(levelId) {
        if (levelId === 1) return true;
        return this.isLevelCompleted(levelId - 1);
    },

    getCurrentLevel() {
        return this.get(CONFIG.STORAGE.CURRENT_LEVEL, 1);
    },

    setCurrentLevel(levelId) {
        this.set(CONFIG.STORAGE.CURRENT_LEVEL, levelId);
    }
};
