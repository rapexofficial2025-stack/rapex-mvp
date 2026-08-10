import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
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
        <View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              backgroundColor: backgroundColor[toast.tone],
              borderRadius: theme.radius.md,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.lg,
              bottom: theme.spacing["4xl"],
            },
          ]}
        >
          <Text style={{ color: theme.colors.textInverse, fontSize: theme.typography.fontSize.sm }}>{toast.message}</Text>
        </View>
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

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    alignItems: "center",
  },
});
