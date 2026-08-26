import { useEffect, useRef } from 'react';
import { luminance, mapLuminanceToGlyph } from '../lib/ascii';
import { planBackground, shouldAnimateBackground } from '../lib/background-plan';

const SOURCE_IMAGE = '/assets/advaith-ascii-source.webp';
const MATRIX_GLYPHS = ' 01アイウエオカキクケコサシスセソ';
const FRAME_INTERVAL = 1000 / 12;

type Cell = { x: number; y: number; luminance: number; seed: number };

export function AsciiMatrixBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!root || !canvas || !context) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = SOURCE_IMAGE;
    const sampleCanvas = document.createElement('canvas');
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cells: Cell[] = [];
    let frame = 0;
    let lastFrame = 0;
    let inView = true;
    let documentVisible = !document.hidden;
    let cssWidth = 1;
    let cssHeight = 1;

    const draw = (time: number) => {
      frame = 0;
      if (time - lastFrame < FRAME_INTERVAL && lastFrame > 0) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;
      context.clearRect(0, 0, cssWidth, cssHeight);
      context.save();
      context.font = `${Math.max(8, Math.min(13, cssWidth / 92))}px "IBM Plex Mono", monospace`;
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.shadowColor = 'rgba(174, 255, 70, .28)';
      context.shadowBlur = 4;

      const waveTime = time * 0.0014;
      for (const cell of cells) {
        const wave = Math.sin(cell.x * 0.022 + waveTime + cell.seed * 4) * 0.5 + 0.5;
        const lit = Math.min(255, cell.luminance * (0.82 + wave * 0.24));
        const glyph = mapLuminanceToGlyph(lit, MATRIX_GLYPHS);
        const alpha = Math.min(0.92, 0.22 + lit / 330);
        context.fillStyle = wave > 0.72
          ? `rgba(255,255,255,${alpha})`
          : `rgba(174,255,70,${alpha})`;
        context.fillText(glyph, cell.x, cell.y);
      }
      context.restore();

      if (shouldAnimateBackground({ reducedMotion, documentVisible, inView })) {
        frame = requestAnimationFrame(draw);
      }
    };

    const prepare = () => {
      if (!image.complete || !image.naturalWidth) return;
      const rect = root.getBoundingClientRect();
      const plan = planBackground({ width: rect.width, height: rect.height, dpr: devicePixelRatio || 1 });
      cssWidth = plan.cssWidth;
      cssHeight = plan.cssHeight;
      canvas.width = plan.backingWidth;
      canvas.height = plan.backingHeight;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      context.setTransform(plan.backingWidth / cssWidth, 0, 0, plan.backingHeight / cssHeight, 0, 0);

      sampleCanvas.width = plan.columns;
      sampleCanvas.height = plan.rows;
      sampleContext.clearRect(0, 0, plan.columns, plan.rows);
      const scale = Math.max(plan.columns / image.naturalWidth, plan.rows / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      sampleContext.drawImage(image, (plan.columns - width) / 2, (plan.rows - height) / 2, width, height);
      const pixels = sampleContext.getImageData(0, 0, plan.columns, plan.rows).data;
      const nextCells: Cell[] = [];
      for (let row = 0; row < plan.rows; row += 1) {
        for (let column = 0; column < plan.columns; column += 1) {
          const index = (row * plan.columns + column) * 4;
          const value = luminance(pixels[index], pixels[index + 1], pixels[index + 2]);
          if (value < 24) continue;
          nextCells.push({
            x: (column + 0.5) * (cssWidth / plan.columns),
            y: (row + 0.5) * (cssHeight / plan.rows),
            luminance: value,
            seed: ((column * 17 + row * 11) % 101) / 101,
          });
        }
      }
      cells = nextCells;
      cancelAnimationFrame(frame);
      draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(prepare);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (shouldAnimateBackground({ reducedMotion, documentVisible, inView })) frame = requestAnimationFrame(draw);
    }, { threshold: 0.05 });
    const onVisibility = () => {
      documentVisible = !document.hidden;
      cancelAnimationFrame(frame);
      if (shouldAnimateBackground({ reducedMotion, documentVisible, inView })) frame = requestAnimationFrame(draw);
    };

    image.addEventListener('load', prepare, { once: true });
    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      image.removeEventListener('load', prepare);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <div ref={rootRef} className="ascii-portrait" aria-hidden="true">
    <img src={SOURCE_IMAGE} alt="" className="ascii-portrait__fallback" />
    <canvas ref={canvasRef} />
  </div>;
}
