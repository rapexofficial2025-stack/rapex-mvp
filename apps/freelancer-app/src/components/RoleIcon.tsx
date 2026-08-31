import { useTheme } from "@rapex/ui-web";
import { roleAccent, ROLES, type RoleKey } from "../lib/roles";

export function RoleIcon({ role, size = 64 }: { role: RoleKey; size?: number }) {
  const theme = useTheme();
  const accent = roleAccent(theme, role);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.full,
        backgroundColor: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        flexShrink: 0,
      }}
      aria-hidden
    >
      {ROLES[role].emoji}
    </div>
  );
}
