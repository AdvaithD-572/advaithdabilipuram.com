export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function mapLuminanceToGlyph(luminance: number, chars: string) {
  const safe = chars.length ? chars : ' ';
  const index = Math.round(clamp(luminance, 0, 255) / 255 * (safe.length - 1));
  return safe[index];
}

export function scrollProgressFromPointer(pointer: number, start: number, length: number) {
  if (length <= 0) return 0;
  return clamp((pointer - start) / length, 0, 1);
}

export function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
