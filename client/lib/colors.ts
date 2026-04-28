/**
 * Converts a hex colour and 0–1 opacity into a CSS rgba() string.
 * Supports 3-digit (#rgb) and 6-digit (#rrggbb) hex codes.
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
