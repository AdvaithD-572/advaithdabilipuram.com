export const MAX_CANVAS_PIXELS = 820_000;
export const MAX_CANVAS_CELLS = 6_500;

type Dimensions = { width: number; height: number; dpr: number };
type AnimationState = { reducedMotion: boolean; documentVisible: boolean; inView: boolean };

const finitePositive = (value: number, fallback = 1) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export function planBackground({ width, height, dpr }: Dimensions) {
  const cssWidth = finitePositive(width);
  const cssHeight = finitePositive(height);
  const cappedDpr = Math.min(1.25, finitePositive(dpr));
  const requestedPixels = cssWidth * cssHeight * cappedDpr * cappedDpr;
  const pixelScale = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / requestedPixels));
  const backingWidth = Math.max(1, Math.floor(cssWidth * cappedDpr * pixelScale));
  const backingHeight = Math.max(1, Math.floor(cssHeight * cappedDpr * pixelScale));

  let cellSize = Math.max(8, Math.ceil(Math.sqrt((cssWidth * cssHeight) / MAX_CANVAS_CELLS)));
  let columns = Math.ceil(cssWidth / cellSize);
  let rows = Math.ceil(cssHeight / cellSize);
  while (columns * rows > MAX_CANVAS_CELLS) {
    cellSize += 1;
    columns = Math.ceil(cssWidth / cellSize);
    rows = Math.ceil(cssHeight / cellSize);
  }

  return { cssWidth, cssHeight, backingWidth, backingHeight, dpr: cappedDpr, cellSize, columns, rows };
}

export const shouldAnimateBackground = ({ reducedMotion, documentVisible, inView }: AnimationState) =>
  !reducedMotion && documentVisible && inView;
