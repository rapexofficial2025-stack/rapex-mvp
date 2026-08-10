import { useTheme } from "./useTheme";

export type SkeletonProps = {
  width?: string | number;
  height?: number;
  radius?: number;
};

export function Skeleton({ width = "100%", height = 16, radius }: SkeletonProps) {
  const theme = useTheme();

  return (
    <>
      <div
        style={{
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.surfaceAlt,
          animation: "rapex-pulse 1.4s ease-in-out infinite",
        }}
      />
      <style>{"@keyframes rapex-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }"}</style>
    </>
  );
}
