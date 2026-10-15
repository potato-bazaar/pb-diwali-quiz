/**
 * Synthesised cracker-burst sound built with the Web Audio API, so no audio files are needed.
 * Browsers only allow audio after a user gesture: call `unlockAudio()` from a tap handler.
 */
type Ctx = AudioContext;

const MUTE_KEY = "pb-diwali-quiz:muted";
let ctx: Ctx | null = null;
let muted = false;

function context(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    try {
      muted = window.localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      // Storage can be unavailable in some WebViews.
    }
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Call from a user gesture (a tap) so the browser lets sounds play afterwards. */
export function unlockAudio() {
  context();
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // Ignore unavailable storage.
  }
}

export function isMuted() {
  return muted;
}

type ToneOptions = {
  freq: number;
  duration: number;
  start?: number;
  to?: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
};

function tone(c: Ctx, { freq, duration, start = 0, to, type = "sine", gain = 0.2, attack = 0.005 }: ToneOptions) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const t0 = c.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

type NoiseOptions = { duration: number; start?: number; gain?: number; from?: number; to?: number };

function noise(c: Ctx, { duration, start = 0, gain = 0.2, from = 3000, to = 300 }: NoiseOptions) {
  const length = Math.ceil(c.sampleRate * duration);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  const t0 = c.currentTime + start;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + duration);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

function play(fn: (c: Ctx) => void) {
  if (muted) return;
  const c = context();
  if (!c) return;
  try {
    fn(c);
  } catch {
    // Never let a sound problem break the game.
  }
}

export const sfx = {
  /** A cracker bursting: a deep thump, the bang, and a short crackle tail. */
  fireworkBurst: () =>
    play((c) => {
      tone(c, { freq: 110, to: 40, duration: 0.28, gain: 0.22 });
      noise(c, { duration: 0.5, gain: 0.16, from: 3200, to: 220 });
      for (let i = 0; i < 7; i++) {
        noise(c, { start: 0.1 + Math.random() * 0.55, duration: 0.04 + Math.random() * 0.03, gain: 0.05, from: 5000, to: 1800 });
      }
    }),
};
