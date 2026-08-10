import { useEffect, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "./useTheme";

export type RapexGlassCardProps = {
  children: ReactNode;
  style?: CSSProperties;
  /** Ambient purple/orange glow behind the card. Default true. */
  glow?: boolean;
};

const STYLE_ELEMENT_ID = "rapex-glass-card-styles";

/**
 * Injected once into <head> rather than shipped as a separate .css file --
 * keeps this a single-file, drop-in component with no build-tool wiring
 * required in consuming apps (no need to remember an extra CSS import).
 * The gradient reflective border needs a real ::before pseudo-element
 * (mask-composite trick), which inline styles can't express -- hence the
 * one shared stylesheet block instead of pure inline styles like the
 * plainer GlassCard.
 */
function injectStylesOnce() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ELEMENT_ID)) return;
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_ELEMENT_ID;
  styleEl.textContent = `
    .rapex-glass-card {
      position: relative;
      isolation: isolate;
      overflow: hidden;
    }
    .rapex-glass-card::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(249, 115, 22, 0.5) 55%, rgba(255, 255, 255, 0.15));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
    .rapex-glass-card::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%);
      pointer-events: none;
    }
    .rapex-glass-card > .rapex-glass-card__content {
      position: relative;
      z-index: 1;
    }
  `;
  document.head.appendChild(styleEl);
}

/**
 * The reflective-glass card described in the RAPEX design system: translucent
 * blurred surface, gradient reflective border, upper-edge highlight, soft
 * shadow, and an optional purple/orange ambient glow. Distinct from the
 * plainer `GlassCard` (background + border only) -- use that one where the
 * full effect isn't needed, this one where the brand glass look matters.
 */
export function RapexGlassCard({ children, style, glow = true }: RapexGlassCardProps) {
  const theme = useTheme();

  useEffect(() => {
    injectStylesOnce();
  }, []);

  return (
    <div
      className="rapex-glass-card"
      style={{
        backgroundColor: theme.glass.background,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        boxShadow: glow
          ? `0 8px 32px rgba(139, 92, 246, 0.18), 0 4px 20px rgba(249, 115, 22, 0.12), ${theme.shadows.lg.css}`
          : theme.shadows.lg.css,
        backdropFilter: theme.glass.backdropFilter,
        WebkitBackdropFilter: theme.glass.backdropFilter,
        ...style,
      }}
    >
      <div className="rapex-glass-card__content">{children}</div>
    </div>
  );
}
