import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useTheme } from "./useTheme";

export type ToastTone = "neutral" | "success" | "error";

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, tone: ToastTone = "neutral") => {
    const id = nextId.current++;
    setToast({ id, message, tone });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, AUTO_DISMISS_MS);
  }, []);

  const backgroundColor: Record<ToastTone, string> = {
    neutral: theme.colors.textPrimary,
    success: theme.colors.successStrong,
    error: theme.colors.errorStrong,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          style={{
            position: "fixed",
            bottom: theme.spacing["4xl"],
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: backgroundColor[toast.tone],
            color: theme.colors.textInverse,
            borderRadius: theme.radius.md,
            padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
            fontSize: theme.typography.fontSize.sm,
            pointerEvents: "none",
          }}
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
