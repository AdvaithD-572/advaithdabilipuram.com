export function flowRevealHeight(progress: number, drawingHeight: number) {
  const normalized = Math.min(1, Math.max(0, progress));
  return normalized * Math.max(0, drawingHeight);
}
