class SoundManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      // Initialize AudioContext only on user interaction to comply with browser policies
      // We'll check and resume in play methods
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  private async ensureContext() {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  playPick() {
    if (!this.context || !this.masterGain) return;
    this.ensureContext();

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  playPlace() {
    if (!this.context || !this.masterGain) return;
    this.ensureContext();

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  playClear(combo: number = 1) {
    if (!this.context || !this.masterGain) return;
    this.ensureContext();

    const now = this.context.currentTime;
    const baseFreq = 440 + (combo * 50);

    // Arpeggio effect
    [0, 0.1, 0.2].forEach((delay, i) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq * (1 + i * 0.5), now + delay);
      
      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);

      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    });
  }

  playGameOver() {
    if (!this.context || !this.masterGain) return;
    this.ensureContext();

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.context.currentTime + 1);

    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.context.currentTime + 1);

    osc.start();
    osc.stop(this.context.currentTime + 1);
  }
}

export const soundManager = new SoundManager();
