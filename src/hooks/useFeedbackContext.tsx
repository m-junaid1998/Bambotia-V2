import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { feedback as runFeedback, prefs, primeAudioContext, type FeedbackEvent } from "@/lib/feedback";

interface FeedbackContextValue {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  setHapticsEnabled: (v: boolean) => void;
  feedback: (event: FeedbackEvent) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

type ToastFn = (...args: unknown[]) => unknown;

const FEEDBACK_FLAG = "__bambotia_feedback_wrapped";

function wrapToast() {
  if (typeof window === "undefined") return;
  const t = toast as unknown as Record<string, ToastFn> & {
    [FEEDBACK_FLAG]?: boolean;
  };
  if (t[FEEDBACK_FLAG]) return;
  t[FEEDBACK_FLAG] = true;

  const baseClass = "shadow-lg border border-border";
  const variants: Record<string, { event: FeedbackEvent; cls: string }> = {
    success: {
      event: "success",
      cls: `${baseClass} animate-[fade-in_0.3s_ease-out,slide-in-right_0.35s_ease-out]`,
    },
    error: {
      event: "error",
      cls: `${baseClass} animate-shake`,
    },
    warning: {
      event: "warning",
      cls: `${baseClass} animate-[fade-in_0.3s_ease-out]`,
    },
    info: {
      event: "info",
      cls: `${baseClass} animate-[fade-in_0.3s_ease-out]`,
    },
    message: {
      event: "info",
      cls: `${baseClass} animate-[fade-in_0.3s_ease-out]`,
    },
  };

  for (const [key, { event, cls }] of Object.entries(variants)) {
    const orig = t[key];
    if (typeof orig !== "function") continue;
    t[key] = function patched(...args: unknown[]) {
      runFeedback(event);
      const opts = args[1];
      if (opts && typeof opts === "object") {
        const o = opts as { className?: string };
        o.className = o.className ? `${o.className} ${cls}` : cls;
      } else {
        args[1] = { className: cls };
      }
      return orig.apply(t, args);
    } as ToastFn;
  }
}

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [soundEnabled, setSoundEnabledState] = useState(prefs.sound);
  const [hapticsEnabled, setHapticsEnabledState] = useState(prefs.haptics);
  const handlerRef = useRef<((e: PointerEvent) => void) | null>(null);

  useEffect(() => {
    primeAudioContext();
    wrapToast();
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        'button, a, [role="button"], [role="tab"], [role="menuitem"], [data-feedback="on"]',
      ) as HTMLElement | null;
      if (!el) return;
      if (el.closest('[data-feedback="off"]')) return;
      if (el.hasAttribute("disabled")) return;
      runFeedback("tap");
    };
    handlerRef.current = onDown;
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const setSoundEnabled = useCallback((v: boolean) => {
    prefs.setSound(v);
    setSoundEnabledState(v);
  }, []);
  const setHapticsEnabled = useCallback((v: boolean) => {
    prefs.setHaptics(v);
    setHapticsEnabledState(v);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      soundEnabled,
      hapticsEnabled,
      setSoundEnabled,
      setHapticsEnabled,
      feedback: runFeedback,
    }),
    [soundEnabled, hapticsEnabled, setSoundEnabled, setHapticsEnabled],
  );

  return (
    <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
};