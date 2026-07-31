import { useTheme } from "./useTheme";

export type LoadingProps = {
  label?: string;
};

export function Loading({ label }: LoadingProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        padding: theme.spacing["3xl"],
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `3px solid ${theme.colors.surfaceAlt}`,
          borderTopColor: theme.colors.brandPrimary,
          animation: "rapex-spin 0.8s linear infinite",
        }}
      />
      <style>{"@keyframes rapex-spin { to { transform: rotate(360deg); } }"}</style>
      {label ? (
        <span style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>{label}</span>
      ) : null}
    </div>
  );
}
