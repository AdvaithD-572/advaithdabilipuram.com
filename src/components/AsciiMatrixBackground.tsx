import { useEffect, useRef } from 'react';
import { luminance, mapLuminanceToGlyph } from '../lib/ascii';

const CHARS = ' 01アイウエオカキクケコサシスセソ';
type RenderMode = 'characters' | 'dither' | 'mosaic' | 'pixel' | 'dots' | 'cross' | 'diamond' | 'voxel' | 'lego' | 'mixed' | 'lines' | 'diagonal' | 'braille' | 'disco' | 'hexdump' | 'matrix' | 'rings' | 'hearts' | 'stars' | 'hexagons' | 'triangles' | 'bubbles' | 'hatch' | 'contour' | 'halfblocks';

function drawPrimitive(ctx: CanvasRenderingContext2D, mode: RenderMode, x: number, y: number, size: number, lum: number, glyph: string) {
  const n = lum / 255;
  const radius = Math.max(.5, n * size * .45);
  ctx.beginPath();
  switch (mode) {
    case 'characters': case 'matrix': ctx.fillText(glyph, x, y); return;
    case 'hexdump': ctx.fillText(Math.round(n * 15).toString(16).toUpperCase(), x, y); return;
    case 'braille': ctx.fillText(String.fromCharCode(0x2800 + Math.round(n * 255)), x, y); return;
    case 'halfblocks': ctx.fillText(n > .5 ? '▀' : '▄', x, y); return;
    case 'dots': case 'bubbles': case 'disco': ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2); break;
    case 'rings': ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2); ctx.stroke(); return;
    case 'cross': ctx.moveTo(x, y + size / 2); ctx.lineTo(x + size, y + size / 2); ctx.moveTo(x + size / 2, y); ctx.lineTo(x + size / 2, y + size); ctx.stroke(); return;
    case 'diamond': ctx.moveTo(x + size / 2, y); ctx.lineTo(x + size, y + size / 2); ctx.lineTo(x + size / 2, y + size); ctx.lineTo(x, y + size / 2); ctx.closePath(); break;
    case 'triangles': ctx.moveTo(x + size / 2, y); ctx.lineTo(x + size, y + size); ctx.lineTo(x, y + size); ctx.closePath(); break;
    case 'hexagons': case 'voxel': for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; const px = x + size / 2 + Math.cos(a) * radius; const py = y + size / 2 + Math.sin(a) * radius; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); break;
    case 'lines': case 'diagonal': case 'hatch': ctx.moveTo(x, y + size); ctx.lineTo(x + size, y); if (mode === 'hatch') { ctx.moveTo(x, y); ctx.lineTo(x + size, y + size); } ctx.stroke(); return;
    case 'contour': ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 1.5); ctx.stroke(); return;
    case 'hearts': ctx.moveTo(x + size / 2, y + size); ctx.bezierCurveTo(x - size * .15, y + size * .55, x + size * .08, y, x + size / 2, y + size * .3); ctx.bezierCurveTo(x + size * .92, y, x + size * 1.15, y + size * .55, x + size / 2, y + size); break;
    case 'stars': for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? radius * .45 : radius; const px = x + size / 2 + Math.cos(a) * r; const py = y + size / 2 + Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); break;
    case 'mixed': if ((x / size + y / size) % 2 < 1) ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2); else ctx.rect(x + (size - radius * 2) / 2, y + (size - radius * 2) / 2, radius * 2, radius * 2); break;
    default: ctx.rect(x, y, size, size); break;
  }
  ctx.fill();
}

export function AsciiMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const source = document.createElement('canvas');
    const sourceCtx = source.getContext('2d', { willReadFrequently: true });
    if (!sourceCtx) return;
    const image = new Image();
    image.src = '/assets/sports-intelligence-frame.jpg';
    let frame = 0;
    let visible = true;
    let started = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const state = { width: 0, height: 0, cells: [] as { x: number; y: number; lum: number; r: number; g: number; b: number; seed: number }[] };

    const prepare = () => {
      const width = innerWidth;
      const height = innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      source.width = width;
      source.height = height;
      const scale = Math.max(width / image.width, height / image.height);
      const sw = image.width * scale;
      const sh = image.height * scale;
      sourceCtx.filter = 'brightness(112%) contrast(115%) saturate(100%)';
      sourceCtx.drawImage(image, (width - sw) / 2, (height - sh) / 2, sw, sh);
      const pixels = sourceCtx.getImageData(0, 0, width, height).data;
      const cell = width < 600 ? 9 : 11;
      const cells = [];
      for (let y = 0; y < height; y += cell) {
        for (let x = 0; x < width; x += cell) {
          let r = 0, g = 0, b = 0, samples = 0;
          for (let sy = y; sy < Math.min(y + cell, height); sy += 2) for (let sx = x; sx < Math.min(x + cell, width); sx += 2) { const i = (sy * width + sx) * 4; r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; samples++; }
          r /= samples; g /= samples; b /= samples;
          cells.push({ x, y, lum: luminance(r, g, b), r, g, b, seed: ((x * 13 + y * 7) % 97) / 97 });
        }
      }
      state.width = width;
      state.height = height;
      state.cells = cells;
      draw(performance.now());
    };

    const draw = (time: number) => {
      const { width, height, cells } = state;
      if (!width || !height) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#050607';
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.4;
      ctx.drawImage(source, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      ctx.font = `${width < 600 ? 9 : 11}px "Roboto Mono", monospace`;
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(60,166,255,.42)';
      ctx.shadowBlur = 6.25;
      const t = time * 0.001;
      for (const cell of cells) {
        const wave = Math.sin(cell.x * 0.018 + t * 2.4 + cell.seed * 8) * 0.5 + 0.5;
        const rain = ((cell.y / Math.max(height, 1) + t * 0.12 + cell.seed) % 1);
        const animatedLum = Math.min(255, cell.lum * (0.72 + wave * 0.42) + (rain > 0.89 ? 80 : 0));
        const glyph = mapLuminanceToGlyph(animatedLum, CHARS);
        const alpha = 0.1 + animatedLum / 255 * 0.48;
        ctx.fillStyle = `rgba(${Math.round(40 + cell.r * .08)},${Math.round(158 + cell.g * .2)},${Math.round(165 + cell.b * .28)},${alpha})`;
        drawPrimitive(ctx, 'matrix', cell.x, cell.y, width < 600 ? 9 : 11, animatedLum, glyph);
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * .1, width / 2, height / 2, Math.max(width, height) * .68);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      if (!reduce && visible) frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      visible = !document.hidden;
      cancelAnimationFrame(frame);
      if (visible && started && !reduce) frame = requestAnimationFrame(draw);
    };
    const resize = () => image.complete && prepare();
    image.onload = () => { started = true; prepare(); };
    image.onerror = () => { ctx.fillStyle = '#050607'; ctx.fillRect(0, 0, innerWidth, innerHeight); };
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { cancelAnimationFrame(frame); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  return <canvas ref={canvasRef} className="ascii-bg" aria-hidden="true" />;
}
