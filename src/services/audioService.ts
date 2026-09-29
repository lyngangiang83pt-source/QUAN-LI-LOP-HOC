type SoundType = 'plus' | 'minus' | 'tick' | 'wheelTick' | 'win' | 'fanfare';

class AudioService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public play(type: SoundType, freqOffset: number = 0): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'wheelTick' || type === 'tick') {
        // Âm thanh cơ học sắc nét (High-Definition Mechanical Ratchet Click)
        // 1. Âm thanh đập cơ học (Wood/Metal Peg Hit)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const baseFreq = Math.max(400, Math.min(2200, 1350 + freqOffset));
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.022);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

        osc.start(now);
        osc.stop(now + 0.022);

        // 2. Tiếng snap gạt kim chỉ (Needle Snap Transient)
        const snapOsc = ctx.createOscillator();
        const snapGain = ctx.createGain();
        snapOsc.connect(snapGain);
        snapGain.connect(ctx.destination);

        snapOsc.type = 'square';
        snapOsc.frequency.setValueAtTime(2400, now);
        snapOsc.frequency.exponentialRampToValueAtTime(400, now + 0.008);

        snapGain.gain.setValueAtTime(0.08, now);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

        snapOsc.start(now);
        snapOsc.stop(now + 0.008);
      } else if (type === 'plus') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'minus') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.12, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.5);
        });
      } else if (type === 'fanfare') {
        // Triumphal Fanfare Award Chords: G4 -> C5 -> E5 -> G5 -> C6 -> Grand Chord
        const sequence: [number, number, number][] = [
          [392.00, 0.00, 0.18], // G4
          [523.25, 0.18, 0.18], // C5
          [659.25, 0.36, 0.18], // E5
          [783.99, 0.54, 0.40], // G5
          [659.25, 0.98, 0.18], // E5
          [1046.50, 1.18, 1.20], // C6 (Grand Long Finish)
          [783.99, 1.18, 1.20],  // G5 harmony
          [523.25, 1.18, 1.20],  // C5 root harmony
        ];

        sequence.forEach(([freq, delay, dur]) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.14, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
          osc.start(now + delay);
          osc.stop(now + delay + dur);
        });
      }
    } catch {
      // Browser blocked autoplay or audio error
    }
  }
}

export const audioService = new AudioService();
