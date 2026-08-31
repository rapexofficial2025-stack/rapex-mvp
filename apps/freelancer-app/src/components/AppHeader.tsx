import { Link } from "react-router-dom";
import { useTheme } from "@rapex/ui-web";

export function AppHeader({ crumb }: { crumb?: string }) {
  const theme = useTheme();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.sm,
        padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
      }}
    >
      <Link to="/" style={{ color: theme.colors.brandPrimary, fontWeight: 600, textDecoration: "none" }}>
        Freelancer Professional Service
      </Link>
      {crumb ? (
        <>
          <span>/</span>
          <span>{crumb}</span>
        </>
      ) : null}
    </header>
  );
}
