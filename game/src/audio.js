// Sizzle & Serve — audio: every sound is synthesized with WebAudio, so the
// game ships no audio files and plays offline. Created lazily on the first
// user gesture, since browsers block audio before one.
let audioCtx = null;
let sizzleTimer = 0;

function ensureAudioContext() {
  if (audioCtx) return audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  return audioCtx;
}

export function unlockAudio() {
  const ctx = ensureAudioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(freq, duration, type, volume, when = 0, slideTo = null) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(duration, volume, filterFreq) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

export const sfx = {
  pickup() { tone(520, 0.07, 'sine', 0.12); },
  place() { tone(220, 0.08, 'triangle', 0.14); noiseBurst(0.05, 0.06, 900); },
  chop() { noiseBurst(0.07, 0.16, 1400); tone(180, 0.05, 'square', 0.05); },
  chopDone() { tone(660, 0.09, 'sine', 0.14); tone(880, 0.12, 'sine', 0.12, 0.07); },
  sizzle() { noiseBurst(0.12, 0.05, 3200); },
  ding() { tone(880, 0.15, 'sine', 0.16); tone(1320, 0.25, 'sine', 0.14, 0.1); },
  coin() { tone(990, 0.08, 'square', 0.07); tone(1320, 0.08, 'square', 0.07, 0.07); tone(1760, 0.16, 'square', 0.07, 0.14); },
  buzz() { tone(140, 0.25, 'sawtooth', 0.12, 0, 90); },
  burn() { tone(220, 0.4, 'sawtooth', 0.1, 0, 110); noiseBurst(0.2, 0.08, 500); },
  tick() { tone(1200, 0.04, 'square', 0.05); },
  orderIn() { tone(660, 0.08, 'triangle', 0.1); tone(880, 0.1, 'triangle', 0.1, 0.08); },
  rush() { tone(440, 0.12, 'square', 0.1); tone(587, 0.12, 'square', 0.1, 0.12); tone(880, 0.2, 'square', 0.1, 0.24); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, i * 0.12)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.14)); },
};

// Call once per frame while anything is cooking: a soft sizzle every so often.
export function sizzleAmbience(active, dt) {
  if (!active) return;
  sizzleTimer -= dt;
  if (sizzleTimer <= 0) {
    sizzleTimer = 0.28 + Math.random() * 0.2;
    sfx.sizzle();
  }
}
