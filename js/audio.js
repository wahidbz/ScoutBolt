/**
 * ScoutBolt Audio System
 * Web Audio API with synthesized sounds (no external files)
 */

const Audio = {
    ctx: null,
    enabled: true,
    volume: CONFIG.AUDIO.VOLUME,

    /**
     * Initialize audio context
     */
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = Storage.getSettings().sound;
            Logger.info('Audio initialized');
        } catch (e) {
            Logger.warn('Audio not supported');
            this.enabled = false;
        }
    },

    /**
     * Resume audio context (required for some browsers)
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    /**
     * Play a tone
     * @param {number} freq - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type
     * @param {number} vol - Volume (0-1)
     */
    playTone(freq, duration, type = 'sine', vol = null) {
        if (!this.enabled || !this.ctx) return;

        const volume = vol !== null ? vol : this.volume;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.frequency.value = freq;
            osc.type = type;

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            Logger.error('Audio play error:', e);
        }
    },

    /**
     * Play a sequence of tones
     * @param {number[]} freqs - Array of frequencies
     * @param {number} interval - Interval between tones (ms)
     * @param {number} duration - Duration of each tone
     */
    playSequence(freqs, interval = 100, duration = 0.3) {
        if (!this.enabled) return;

        freqs.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, duration), i * interval);
        });
    },

    // ==================== SOUND EFFECTS ====================

    /**
     * UI Click sound
     */
    playClick() {
        this.playTone(CONFIG.AUDIO.FREQUENCIES.CLICK, 0.1);
    },

    /**
     * Bolt removal sound
     */
    playBolt() {
        this.playTone(CONFIG.AUDIO.FREQUENCIES.BOLT, 0.15, 'square');
    },

    /**
     * Bolt unlock sound
     */
    playUnlock() {
        this.playTone(CONFIG.AUDIO.FREQUENCIES.UNLOCK, 0.2, 'sine');
    },

    /**
     * Error/locked bolt sound
     */
    playError() {
        this.playTone(CONFIG.AUDIO.FREQUENCIES.ERROR, 0.3, 'sawtooth');
    },

    /**
     * Level complete sound
     */
    playWin() {
        this.playSequence(CONFIG.AUDIO.FREQUENCIES.WIN, 100, 0.3);
    },

    /**
     * Plate fall thud
     */
    playThud() {
        this.playTone(100, 0.2, 'triangle', 0.4);
    },

    /**
     * Star rating sound
     * @param {number} count - Number of stars
     */
    playStars(count) {
        const baseFreq = 523;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.playTone(baseFreq + (i * 100), 0.4);
            }, i * 200);
        }
    },

    // ==================== CONTROL ====================

    /**
     * Enable/disable audio
     * @param {boolean} state
     */
    setEnabled(state) {
        this.enabled = state;
        const settings = Storage.getSettings();
        settings.sound = state;
        Storage.saveSettings(settings);
    },

    /**
     * Set volume
     * @param {number} vol - 0-1
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    },

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }
};
