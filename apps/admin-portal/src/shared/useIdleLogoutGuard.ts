import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_MS = 30 * 60 * 1000;
const GRACE_MS = 5 * 1000;
const COUNTDOWN_S = 10;

export type IdlePhase = "active" | "prompt" | "countdown";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

/**
 * 30 minutes with no input -> silent "Are you still there?" prompt -> 5
 * silent seconds -> a visible 10-second countdown -> auto-logout. Only the
 * final 10 seconds are ever shown on screen, per the founder's spec -- the
 * 30-minute idle window and the 5-second grace window stay invisible.
 *
 * Once the prompt appears, background mouse/keyboard jitter must not
 * silently dismiss it -- only an explicit "Yes, I'm here" click (via
 * confirmPresent) counts as presence, matching a standard banking-style
 * session guard.
 */
export function useIdleLogoutGuard(onTimeout: () => void) {
  const [phase, setPhase] = useState<IdlePhase>("active");
  const [countdown, setCountdown] = useState(COUNTDOWN_S);
  const phaseRef = useRef<IdlePhase>("active");
  const idleTimer = useRef<number | undefined>(undefined);
  const graceTimer = useRef<number | undefined>(undefined);
  const countdownTimer = useRef<number | undefined>(undefined);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const setPhaseBoth = useCallback((next: IdlePhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearAllTimers = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(graceTimer.current);
    window.clearInterval(countdownTimer.current);
  }, []);

  const startCountdown = useCallback(() => {
    setPhaseBoth("countdown");
    setCountdown(COUNTDOWN_S);
    let remaining = COUNTDOWN_S;
    countdownTimer.current = window.setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(countdownTimer.current);
        onTimeoutRef.current();
      }
    }, 1000);
  }, [setPhaseBoth]);

  const armIdleTimer = useCallback(() => {
    clearAllTimers();
    setPhaseBoth("active");
    idleTimer.current = window.setTimeout(() => {
      setPhaseBoth("prompt");
      graceTimer.current = window.setTimeout(startCountdown, GRACE_MS);
    }, IDLE_MS);
  }, [clearAllTimers, setPhaseBoth, startCountdown]);

  const confirmPresent = useCallback(() => {
    armIdleTimer();
  }, [armIdleTimer]);

  useEffect(() => {
    armIdleTimer();
    function handleActivity() {
      if (phaseRef.current === "active") armIdleTimer();
    }
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      clearAllTimers();
    };
  }, [armIdleTimer, clearAllTimers]);

  return { phase, countdown, confirmPresent };
}
