// Premium tactile feedback engine: synthesized sounds + haptics.
// Zero binary assets. SSR-safe. Throttled to avoid overlap on rapid clicks.

export type FeedbackEvent =
  | "tap"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "cartAdd"
  | "cartRemove"
  | "wishlistAdd"
  | "wishlistRemove"
  | "orderPlaced"
  | "couponApplied"
  | "loginSuccess"
  | "registerSuccess"
  | "adminCreate"
  | "adminUpdate"
  | "adminDelete"
  | "adminStatus";

const SOUND_KEY = "bambotia.soundEnabled";
const HAPTIC_KEY = "bambotia.hapticsEnabled";

const isBrowser = typeof window !== "undefined";

function readBool(key: string, fallback = true) {
  if (!isBrowser) return fallback;
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "1" || v === "true";
  } catch {
    return fallback;
  }
}

let soundEnabled = readBool(SOUND_KEY);
let hapticsEnabled = readBool(HAPTIC_KEY);

export const prefs = {
  get sound() {
    return soundEnabled;
  },
  get haptics() {
    return hapticsEnabled;
  },
  setSound(v: boolean) {
    soundEnabled = v;
    if (isBrowser) {
      try {
        localStorage.setItem(SOUND_KEY, v ? "1" : "0");
      } catch {
        /* ignore */
      }
    }
  },
  setHaptics(v: boolean) {
    hapticsEnabled = v;
    if (isBrowser) {
      try {
        localStorage.setItem(HAPTIC_KEY, v ? "1" : "0");
      } catch {
        /* ignore */
      }
    }
  },
};

let ctx: AudioContext | null = null;
let lastPlayedAt = 0;
const MIN_GAP_MS = 35;

function getCtx(): AudioContext | null {
  if (!isBrowser) return null;
  if (ctx) return ctx;
  try {
    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

// Generic envelope tone.
function tone(
  ac: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
  startOffset = 0,
) {
  const t0 = ac.currentTime + startOffset;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// Soft tap reminiscent of iOS keyboard taps.
function playTap(ac: AudioContext) {
  tone(ac, 1800, 0.04, "triangle", 0.05);
  tone(ac, 900, 0.05, "sine", 0.04);
}

function playSuccess(ac: AudioContext) {
  tone(ac, 880, 0.12, "sine", 0.07);
  tone(ac, 1318, 0.18, "sine", 0.06, 0.07);
}

function playError(ac: AudioContext) {
  tone(ac, 220, 0.18, "sawtooth", 0.05);
  tone(ac, 180, 0.22, "sawtooth", 0.05, 0.05);
}

function playWarning(ac: AudioContext) {
  tone(ac, 660, 0.1, "square", 0.04);
  tone(ac, 520, 0.12, "square", 0.04, 0.08);
}

function playInfo(ac: AudioContext) {
  tone(ac, 1200, 0.06, "sine", 0.05);
}

function playCartAdd(ac: AudioContext) {
  tone(ac, 1046, 0.08, "sine", 0.06);
  tone(ac, 1568, 0.1, "sine", 0.05, 0.05);
}

function playCartRemove(ac: AudioContext) {
  tone(ac, 1200, 0.08, "sine", 0.05);
  tone(ac, 700, 0.1, "sine", 0.05, 0.05);
}

function playWishlist(ac: AudioContext) {
  tone(ac, 1400, 0.07, "triangle", 0.05);
  tone(ac, 2100, 0.1, "triangle", 0.04, 0.04);
}

function playOrderPlaced(ac: AudioContext) {
  tone(ac, 784, 0.14, "sine", 0.08);
  tone(ac, 988, 0.16, "sine", 0.07, 0.1);
  tone(ac, 1318, 0.22, "sine", 0.07, 0.2);
}

function playAdminChime(ac: AudioContext) {
  tone(ac, 1100, 0.08, "triangle", 0.05);
  tone(ac, 1650, 0.1, "triangle", 0.04, 0.06);
}

function play(event: FeedbackEvent) {
  if (!soundEnabled) return;
  const now = performance.now();
  if (now - lastPlayedAt < MIN_GAP_MS) return;
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => undefined);
  lastPlayedAt = now;
  try {
    switch (event) {
      case "tap":
        playTap(ac);
        break;
      case "success":
      case "loginSuccess":
      case "registerSuccess":
      case "couponApplied":
        playSuccess(ac);
        break;
      case "error":
        playError(ac);
        break;
      case "warning":
        playWarning(ac);
        break;
      case "info":
        playInfo(ac);
        break;
      case "cartAdd":
        playCartAdd(ac);
        break;
      case "cartRemove":
        playCartRemove(ac);
        break;
      case "wishlistAdd":
      case "wishlistRemove":
        playWishlist(ac);
        break;
      case "orderPlaced":
        playOrderPlaced(ac);
        break;
      case "adminCreate":
      case "adminUpdate":
      case "adminDelete":
      case "adminStatus":
        playAdminChime(ac);
        break;
      default:
        playTap(ac);
    }
  } catch {
    /* ignore audio failures */
  }
}

const PATTERNS: Record<FeedbackEvent, number | number[]> = {
  tap: 20,
  success: 50,
  error: 100,
  warning: [30, 30, 30],
  info: 15,
  cartAdd: 35,
  cartRemove: 25,
  wishlistAdd: 30,
  wishlistRemove: 20,
  orderPlaced: 200,
  couponApplied: 50,
  loginSuccess: 50,
  registerSuccess: 50,
  adminCreate: 40,
  adminUpdate: 30,
  adminDelete: 60,
  adminStatus: 40,
};

function vibrate(event: FeedbackEvent) {
  if (!hapticsEnabled || !isBrowser) return;
  const nav = window.navigator as Navigator & {
    vibrate?: (pattern: number | number[]) => boolean;
  };
  if (typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(PATTERNS[event]);
  } catch {
    /* ignore */
  }
}

export function feedback(event: FeedbackEvent) {
  play(event);
  vibrate(event);
}

// One-shot initializer to unlock the AudioContext on first user gesture.
let primed = false;
export function primeAudioContext() {
  if (primed || !isBrowser) return;
  primed = true;
  const prime = () => {
    const ac = getCtx();
    if (ac && ac.state === "suspended") ac.resume().catch(() => undefined);
    window.removeEventListener("pointerdown", prime);
    window.removeEventListener("keydown", prime);
    window.removeEventListener("touchstart", prime);
  };
  window.addEventListener("pointerdown", prime, { once: true });
  window.addEventListener("keydown", prime, { once: true });
  window.addEventListener("touchstart", prime, { once: true });
}