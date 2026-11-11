/**
 * Realistic Multi-Layer Synthesized Paper Page-Turn Audio using Web Audio API
 * Accurately models paper friction, aerodynamic curl resonance, and landing snap
 */

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdf_flip_sound_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pdf_flip_sound_muted', String(muted));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Generates an authentic physical paper page-flip sound:
   * Layer 1: Sliding friction & micro-flutter (tactile paper grain)
   * Layer 2: Aerodynamic page curl whoosh (body flex resonance)
   * Layer 3: Delicate landing snap (page settling transient)
   */
  public playPageFlip() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;
      const totalDuration = 0.24;
      const bufferSize = Math.floor(sampleRate * totalDuration);

      // --- Layer 1: Paper Surface Friction & Flutter ---
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);

      // Generate brown/pink noise with subtle paper grain texture
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.15;
        b2 = 0.85 * b2 + white * 0.25;
        // Modulate with paper flutter envelope
        const t = i / sampleRate;
        const flutter = 1.0 + 0.2 * Math.sin(t * 180);
        noiseData[i] = (b0 + b1 + b2) * 0.5 * flutter;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass sweep tracking the paper moving through the air
      const frictionFilter = this.ctx.createBiquadFilter();
      frictionFilter.type = 'bandpass';
      frictionFilter.frequency.setValueAtTime(1200, now);
      frictionFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
      frictionFilter.frequency.exponentialRampToValueAtTime(800, now + totalDuration);
      frictionFilter.Q.setValueAtTime(2.2, now);

      const frictionGain = this.ctx.createGain();
      frictionGain.gain.setValueAtTime(0.001, now);
      frictionGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      frictionGain.gain.linearRampToValueAtTime(0.22, now + 0.12);
      frictionGain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

      noiseSource.connect(frictionFilter);
      frictionFilter.connect(frictionGain);
      frictionGain.connect(this.ctx.destination);

      // --- Layer 2: Page Body Curl Resonance (Low-Mid Air Whoosh) ---
      const curlBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const curlData = curlBuffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = lastVal * 0.85 + white * 0.15;
        curlData[i] = lastVal;
      }

      const curlSource = this.ctx.createBufferSource();
      curlSource.buffer = curlBuffer;

      const curlFilter = this.ctx.createBiquadFilter();
      curlFilter.type = 'lowpass';
      curlFilter.frequency.setValueAtTime(450, now);
      curlFilter.frequency.linearRampToValueAtTime(650, now + 0.07);
      curlFilter.frequency.linearRampToValueAtTime(300, now + 0.19);
      curlFilter.Q.setValueAtTime(1.5, now);

      const curlGain = this.ctx.createGain();
      curlGain.gain.setValueAtTime(0.001, now);
      curlGain.gain.exponentialRampToValueAtTime(0.25, now + 0.06);
      curlGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

      curlSource.connect(curlFilter);
      curlFilter.connect(curlGain);
      curlGain.connect(this.ctx.destination);

      // --- Layer 3: Delicate Landing Snap / Contact ---
      const snapTime = now + 0.14;
      const snapDuration = 0.05;
      const snapBufferSize = Math.floor(sampleRate * snapDuration);
      const snapBuffer = this.ctx.createBuffer(1, snapBufferSize, sampleRate);
      const snapData = snapBuffer.getChannelData(0);
      for (let i = 0; i < snapBufferSize; i++) {
        const decay = Math.exp(-i / (sampleRate * 0.008));
        snapData[i] = (Math.random() * 2 - 1) * decay;
      }

      const snapSource = this.ctx.createBufferSource();
      snapSource.buffer = snapBuffer;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(2800, snapTime);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.2, snapTime);
      snapGain.gain.exponentialRampToValueAtTime(0.001, snapTime + snapDuration);

      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);

      // Start all layers
      noiseSource.start(now);
      noiseSource.stop(now + totalDuration);

      curlSource.start(now);
      curlSource.stop(now + totalDuration);

      snapSource.start(snapTime);
      snapSource.stop(snapTime + snapDuration);
    } catch {
      // AudioContext policy suppression handled gracefully
    }
  }
}

export const soundManager = new SoundSynthesizer();
