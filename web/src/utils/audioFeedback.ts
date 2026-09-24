/**
 * Tactile Mechanical Audio Feedback System for Baiti Atelier
 * Synthesizes subtle industrial acoustic responses using the standard Web Audio API.
 * Operates without external audio assets, zero latency, zero bandwidth.
 */

import { safeStorage } from '../lib/safeStorage';

let audioCtx: AudioContext | null = null;
let soundEnabled = false;

// Initialize or resume AudioContext on first user gesture
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  const stored = safeStorage.getItem('baiti_sound_enabled') ?? safeStorage.getItem('monyun_sound_enabled');
  if (stored !== null) {
    soundEnabled = stored === 'true';
  } else {
    soundEnabled = false;
  }
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  safeStorage.setItem('baiti_sound_enabled', String(enabled));
  if (enabled) {
    playTactileClick();
  }
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  return next;
}

/**
 * High-frequency precision click resembling an aluminum caliper or CNC dial notch
 */
export function playTactileClick(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.022);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Graceful silent fallback
  }
}

/**
 * Dual micro-tone for toggle buttons, switches, and dark/light mode transitions
 */
export function playSwitchSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.035);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.035);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.045);
    osc2.stop(now + 0.045);
  } catch {
    // Graceful silent fallback
  }
}

/**
 * Solid low-frequency pneumatic mechanical clamp thud for quotes, PDF downloads, and orders
 */
export function playClampSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Sub-bass thud
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
    subGain.gain.setValueAtTime(0.09, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // High transient snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    snapGain.gain.setValueAtTime(0.07, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);

    subOsc.start(now);
    snapOsc.start(now);
    subOsc.stop(now + 0.1);
    snapOsc.stop(now + 0.04);
  } catch {
    // Graceful silent fallback
  }
}

/**
 * Soft subtle slider notch sound during dimensional adjustments
 */
export function playSlideTick(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.012);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch {
    // Graceful silent fallback
  }
}
