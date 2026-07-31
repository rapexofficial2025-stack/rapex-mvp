import { useTheme } from "./useTheme";
import { Button } from "./Button";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  retryLabel = "Try Again",
  onRetry,
}: ErrorStateProps) {
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
      <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.error }}>{title}</h3>
      {description ? (
        <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
          {description}
        </p>
      ) : null}
      {onRetry ? (
        <div style={{ marginTop: theme.spacing.md }}>
          <Button label={retryLabel} variant="danger" onClick={onRetry} />
        </div>
      ) : null}
    </div>
  );
}
