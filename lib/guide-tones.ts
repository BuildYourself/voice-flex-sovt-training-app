/**
 * Guide tones made in the browser with the Web Audio API, so there are no
 * audio files to record or host. A one-time "lower voice / higher voice"
 * choice moves every pattern into a comfortable range.
 */
export type VoiceRange = "lower" | "higher";

/** hold-note = one reference note (Long Hum Hold), the rest loop while the timer runs. */
export type GuidePattern = "hold-note" | "steady-notes" | "slide-151" | "swell";

const VOICE_RANGE_KEY = "voiceflex_voice_range";

/** Starting note (MIDI) for each range: C3 for lower voices, A3 for higher voices. */
const BASE_NOTE: Record<VoiceRange, number> = { lower: 48, higher: 57 };

export function getVoiceRange(): VoiceRange | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(VOICE_RANGE_KEY);
    return value === "lower" || value === "higher" ? value : null;
  } catch {
    return null;
  }
}

export function setVoiceRange(range: VoiceRange) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOICE_RANGE_KEY, range);
  } catch {
    // Storage blocked: the choice still applies until the page reloads.
  }
}

type ToneEvent = { midi: number; start: number; duration: number; style: "held" | "plucked" };

function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** One cycle of a pattern. Times are in seconds from the start of the cycle. */
function buildCycle(pattern: GuidePattern, range: VoiceRange): { events: ToneEvent[]; length: number } {
  const base = BASE_NOTE[range];
  const events: ToneEvent[] = [];

  if (pattern === "hold-note") {
    events.push({ midi: base + 4, start: 0, duration: 1.6, style: "held" });
    return { events, length: 1.8 };
  }

  if (pattern === "steady-notes") {
    // Hold each note for 5 seconds, a short gap, then the next one.
    const steps = [0, 2, 4, 5, 7, 5, 4, 2];
    steps.forEach((offset, index) => {
      events.push({ midi: base + offset, start: index * 6.5, duration: 5, style: "held" });
    });
    return { events, length: steps.length * 6.5 };
  }

  if (pattern === "swell") {
    // One steady note to swell on, then a breath.
    for (let index = 0; index < 4; index += 1) {
      events.push({ midi: base + 4, start: index * 9, duration: 6, style: "held" });
    }
    return { events, length: 36 };
  }

  // slide-151: play the five notes up and back, leave time to slide them,
  // then start one note higher. Up four times, then back down.
  const scale = [0, 2, 4, 5, 7, 5, 4, 2, 0];
  const shifts = [0, 1, 2, 3, 4, 3, 2, 1];
  let time = 0;
  shifts.forEach((shift) => {
    scale.forEach((offset) => {
      events.push({ midi: base + shift + offset, start: time, duration: 0.34, style: "plucked" });
      time += 0.36;
    });
    time += 4;
  });
  return { events, length: time };
}

type AudioContextConstructor = typeof AudioContext;

export class GuideTonePlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources: OscillatorNode[] = [];
  private nextCycleTimer: number | null = null;
  private playing = false;

  get isPlaying() {
    return this.playing;
  }

  private ensureContext() {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      const Ctor: AudioContextConstructor | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
      if (!Ctor) return null;
      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") void this.context.resume();
    return this.context;
  }

  private scheduleTone(event: ToneEvent, at: number) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const frequency = midiToFrequency(event.midi);
    const envelope = context.createGain();
    envelope.connect(master);
    const start = at + event.start;
    const end = start + event.duration;

    if (event.style === "held") {
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(0.5, start + 0.06);
      envelope.gain.setValueAtTime(0.5, end - 0.2);
      envelope.gain.linearRampToValueAtTime(0, end);
    } else {
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(0.7, start + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.08, end - 0.02);
      envelope.gain.linearRampToValueAtTime(0, end);
    }

    // A soft, piano-like colour: the note plus a little of its first overtones.
    const partials: Array<{ multiple: number; type: OscillatorType; level: number }> = [
      { multiple: 1, type: "sine", level: 0.7 },
      { multiple: 1, type: "triangle", level: 0.2 },
      { multiple: 2, type: "sine", level: 0.1 },
    ];
    partials.forEach(({ multiple, type, level }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency * multiple;
      gain.gain.value = level;
      oscillator.connect(gain);
      gain.connect(envelope);
      oscillator.start(start);
      oscillator.stop(end + 0.05);
      oscillator.onended = () => {
        this.sources = this.sources.filter((source) => source !== oscillator);
      };
      this.sources.push(oscillator);
    });
  }

  /** Plays a pattern. Loops until stop() unless loop is false. Returns false if audio is unavailable. */
  start(pattern: GuidePattern, range: VoiceRange, loop = true) {
    this.stop();
    const context = this.ensureContext();
    if (!context) return false;
    this.playing = true;

    const runCycle = (at: number) => {
      if (!this.playing) return;
      const { events, length } = buildCycle(pattern, range);
      events.forEach((event) => this.scheduleTone(event, at));
      if (!loop) {
        this.nextCycleTimer = window.setTimeout(() => {
          this.playing = false;
        }, length * 1000);
        return;
      }
      // Schedule the next cycle a little before this one ends.
      this.nextCycleTimer = window.setTimeout(() => runCycle(at + length), Math.max(0, (at + length - context.currentTime - 0.5) * 1000));
    };

    runCycle(context.currentTime + 0.08);
    return true;
  }

  stop() {
    this.playing = false;
    if (this.nextCycleTimer !== null) {
      window.clearTimeout(this.nextCycleTimer);
      this.nextCycleTimer = null;
    }
    const now = this.context?.currentTime ?? 0;
    this.sources.forEach((source) => {
      try {
        source.stop(now);
      } catch {
        // Already stopped.
      }
    });
    this.sources = [];
  }

  dispose() {
    this.stop();
    void this.context?.close();
    this.context = null;
    this.master = null;
  }
}

/* Long Hum Hold: best hold, kept on this device per product route. */
export function getBestHold(productType: string) {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(`voiceflex_best_hold_${productType}`)) || 0;
  } catch {
    return 0;
  }
}

export function saveBestHold(productType: string, seconds: number) {
  if (typeof window === "undefined") return;
  try {
    const current = getBestHold(productType);
    if (seconds > current) window.localStorage.setItem(`voiceflex_best_hold_${productType}`, String(Math.round(seconds * 10) / 10));
  } catch {
    // Ignore storage errors.
  }
}
