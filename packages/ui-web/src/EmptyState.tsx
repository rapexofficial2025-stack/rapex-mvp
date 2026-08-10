import { useTheme } from "./useTheme";
import { Button } from "./Button";

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: theme.spacing.sm,
        padding: theme.spacing["3xl"],
      }}
    >
      <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>{title}</h3>
      {description ? (
        <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <div style={{ marginTop: theme.spacing.md }}>
          <Button label={actionLabel} onClick={onAction} />
        </div>
      ) : null}
    </div>
  );
}
