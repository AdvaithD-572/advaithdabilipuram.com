export type HandSide = 'left' | 'right';
// Fill only after the two matching glitch cutouts have been supplied and validated.
export const approvedGlitchSources: Record<HandSide, string | null> = { left: null, right: null };

export type AlphaMask = { pixels: Uint8ClampedArray; width: number; height: number };
export function alphaHit(mask: AlphaMask, x: number, y: number) {
  if (x < 0 || x >= 1 || y < 0 || y >= 1) return false;
  return mask.pixels[(Math.floor(y * mask.height) * mask.width + Math.floor(x * mask.width)) * 4 + 3] > 90;
}

export async function loadHandMask(source: string): Promise<AlphaMask | null> {
  const image = new Image();
  image.src = source;
  try {
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 438;
    canvas.height = 216;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { pixels: context.getImageData(0, 0, canvas.width, canvas.height).data, width: canvas.width, height: canvas.height };
  } catch { return null; }
}
