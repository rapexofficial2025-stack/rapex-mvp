import { useTheme } from "./useTheme";
import { useThemeMode } from "./ThemeProvider";

export function ThemeToggle() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.textPrimary,
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        fontSize: theme.typography.fontSize.sm,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      <span>{isDark ? "🌙" : "☀️"}</span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
