export type SoundType = 'plus' | 'minus' | 'tick' | 'wheelTick' | 'win' | 'fanfare' | 'schoolBell' | 'schoolDrum' | 'electricBell' | 'silenceGavel' | 'silenceWhistle' | 'silenceChime';

class AudioService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.muted && this.currentAudioElement) {
      this.currentAudioElement.pause();
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted && this.currentAudioElement) {
      this.currentAudioElement.pause();
    }
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

  public stopAll(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
  }

  public isPlaying(): boolean {
    return !!(this.currentAudioElement && !this.currentAudioElement.paused);
  }

  public playCustomAudio(src: string, onEnded?: () => void): Promise<boolean> {
    if (this.muted) return Promise.resolve(false);
    this.stopAll();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(src);
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.currentAudioElement = null;
          if (onEnded) onEnded();
          resolve(true);
        };

        audio.onerror = () => {
          this.currentAudioElement = null;
          resolve(false);
        };

        audio.play().then(() => resolve(true)).catch(() => resolve(false));
      } catch {
        resolve(false);
      }
    });
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
      } else if (type === 'schoolBell') {
        // Chuông trường Ting-Toong (Westminster Chimes) với âm hưởng kim loại ngân vang
        const chimeNotes: [number, number, number][] = [
          [329.63, 0.00, 0.75], // E4
          [261.63, 0.55, 0.75], // C4
          [293.66, 1.10, 0.75], // D4
          [196.00, 1.65, 1.20], // G3
          // Đoạn 2
          [196.00, 2.70, 0.75], // G3
          [293.66, 3.25, 0.75], // D4
          [329.63, 3.80, 0.75], // E4
          [261.63, 4.35, 2.20], // C4 (Ngân vang kết thúc)
        ];

        chimeNotes.forEach(([freq, delay, dur]) => {
          // Fundamental
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.24, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
          osc.start(now + delay);
          osc.stop(now + delay + dur);

          // Metallic bell harmonic overtone (x 2.4)
          const harmOsc = ctx.createOscillator();
          const harmGain = ctx.createGain();
          harmOsc.connect(harmGain);
          harmGain.connect(ctx.destination);

          harmOsc.type = 'triangle';
          harmOsc.frequency.setValueAtTime(freq * 2.4, now + delay);
          harmGain.gain.setValueAtTime(0.08, now + delay);
          harmGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + (dur * 0.6));
          harmOsc.start(now + delay);
          harmOsc.stop(now + delay + (dur * 0.6));
        });
      } else if (type === 'schoolDrum') {
        // Hồi trống trường truyền thống: Tùng! Tùng! Tùng! ... Cắc! Tùng!
        const drumHits: [number, boolean][] = [
          [0.0, false], [0.5, false], [1.0, false],
          [1.5, false], [1.9, false], [2.3, false],
          [2.65, false], [3.0, false], [3.3, false],
          [3.55, false], [3.8, false], [4.05, false],
          [4.35, true],  // Cắc (gõ vành)
          [4.65, false], // TÙNG! (kết thúc)
        ];

        drumHits.forEach(([delay, isRim]) => {
          if (isRim) {
            // Tiếng gõ vành "Cắc!"
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(1400, now + delay);
            osc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.05);

            gain.gain.setValueAtTime(0.22, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);

            osc.start(now + delay);
            osc.stop(now + delay + 0.05);
          } else {
            // Tiếng mặt trống "Tùng!"
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now + delay);
            osc.frequency.exponentialRampToValueAtTime(45, now + delay + 0.35);

            gain.gain.setValueAtTime(0.32, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.42);

            osc.start(now + delay);
            osc.stop(now + delay + 0.42);
          }
        });
      } else if (type === 'electricBell') {
        // Chuông điện trường học (Reng reng reng reng...)
        const totalDuration = 3.5;
        const pulseRate = 22; // 22 nhịp búa gõ mỗi giây
        const totalPulses = Math.floor(totalDuration * pulseRate);

        for (let i = 0; i < totalPulses; i++) {
          const delay = i / pulseRate;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1850 + (i % 2 === 0 ? 80 : -80), now + delay);

          gain.gain.setValueAtTime(0.18, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.035);

          osc.start(now + delay);
          osc.stop(now + delay + 0.035);
        }
      } else if (type === 'silenceGavel') {
        // Tiếng gõ búa / thước gỗ hiệu lệnh Trật tự: CỐC! CỐC! CỐC! (3 nhịp dứt khoát)
        const gavelHits = [0.0, 0.42, 0.84];
        gavelHits.forEach((delay) => {
          // 1. Tiếng va chạm mặt gỗ đanh (Wood impact transient)
          const snapOsc = ctx.createOscillator();
          const snapGain = ctx.createGain();
          snapOsc.connect(snapGain);
          snapGain.connect(ctx.destination);

          snapOsc.type = 'square';
          snapOsc.frequency.setValueAtTime(1600, now + delay);
          snapOsc.frequency.exponentialRampToValueAtTime(320, now + delay + 0.025);

          snapGain.gain.setValueAtTime(0.35, now + delay);
          snapGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.025);

          snapOsc.start(now + delay);
          snapOsc.stop(now + delay + 0.025);

          // 2. Thân gỗ cộng hưởng (Wooden block resonance)
          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.connect(bodyGain);
          bodyGain.connect(ctx.destination);

          bodyOsc.type = 'triangle';
          bodyOsc.frequency.setValueAtTime(420, now + delay);
          bodyOsc.frequency.exponentialRampToValueAtTime(160, now + delay + 0.18);

          bodyGain.gain.setValueAtTime(0.4, now + delay);
          bodyGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

          bodyOsc.start(now + delay);
          bodyOsc.stop(now + delay + 0.18);
        });
      } else if (type === 'silenceWhistle') {
        // Tiếng còi hiệu lệnh giáo viên: Tuýt! Tuýt! (2 hồi còi vang)
        const whistleBlasts: [number, number][] = [
          [0.0, 0.45],
          [0.6, 0.65],
        ];

        whistleBlasts.forEach(([delay, dur]) => {
          // Sóng 1
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.connect(gain1);
          gain1.connect(ctx.destination);

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(2800, now + delay);

          gain1.gain.setValueAtTime(0.22, now + delay);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

          osc1.start(now + delay);
          osc1.stop(now + delay + dur);

          // Sóng 2 (tạo độ rung rè đặc trưng của còi)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(3120, now + delay);

          gain2.gain.setValueAtTime(0.18, now + delay);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

          osc2.start(now + delay);
          osc2.stop(now + delay + dur);
        });
      } else if (type === 'silenceChime') {
        // Tiếng chuông gõ nhắc nhở đanh sáng: KÍNH! KÍNH! KÍNH!
        const chimeHits = [0.0, 0.35, 0.70];
        chimeHits.forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now + delay);
          osc.frequency.exponentialRampToValueAtTime(800, now + delay + 0.55);

          gain.gain.setValueAtTime(0.3, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.55);

          osc.start(now + delay);
          osc.stop(now + delay + 0.55);
        });
      }
    } catch {
      // Browser blocked autoplay or audio error
    }
  }
}

export const audioService = new AudioService();

