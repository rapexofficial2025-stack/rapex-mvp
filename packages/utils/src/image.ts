/**
 * Platform-agnostic helpers only. Actual image picking/compression/upload uses
 * platform-specific libraries (e.g. expo-image-picker for RN) and lives in each
 * app, not here -- this package stays dependency-free.
 */

export type ImageDimensions = { width: number; height: number };

export function aspectRatio({ width, height }: ImageDimensions): number {
  if (height === 0) return 0;
  return width / height;
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "gif"] as const;

export function isImageFilename(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return (IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
