/**
 * ScoutBolt Audio System
 */

const Audio = {
    ctx: null,
    enabled: true,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        } catch (e) {
            this.enabled = false;
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone(freq, duration, type = 'sine', vol = 0.3) {
        if (!this.enabled || !this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.frequency.value = freq;
            osc.type = type;

            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    },

    playClick() {
        this.playTone(800, 0.1);
    },

    playBolt() {
        this.playTone(400, 0.15, 'square');
    },

    playUnlock() {
        this.playTone(600, 0.2);
    },

    playError() {
        this.playTone(200, 0.3, 'sawtooth');
    },

    playWin() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3), i * 100);
        });
    },

    playThud() {
        this.playTone(100, 0.2, 'triangle', 0.4);
    }
};
