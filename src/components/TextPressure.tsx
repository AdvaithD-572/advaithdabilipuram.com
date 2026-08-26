import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pressureAttributes, RESTING_VARIATION } from '../lib/pressure';

type TextPressureProps = {
  text?: string;
  fontFamily?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
};

export function TextPressure({
  text = 'ADVAITH',
  fontFamily = 'Roboto Flex',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#f7f7f2',
  strokeColor = '#aeff46',
  className = '',
  minFontSize = 24,
}: TextPressureProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef(0);
  const [fontSize, setFontSize] = useState(minFontSize);
  const characters = useMemo(() => [...text], [text]);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return;
    const rect = root.getBoundingClientRect();
    setFontSize(Math.max(rect.width / Math.max(characters.length / 1.9, 1), minFontSize));
  }, [characters.length, minFontSize]);

  const applyPressure = useCallback((clientX: number, clientY: number) => {
    const title = titleRef.current;
    if (!title) return;
    const rect = title.getBoundingClientRect();
    const radius = Math.max(rect.width * 0.22, rect.height * 1.75);
    spansRef.current.forEach((span) => {
      if (!span) return;
      const glyph = span.getBoundingClientRect();
      const distance = Math.hypot(clientX - (glyph.left + glyph.width / 2), clientY - (glyph.top + glyph.height / 2));
      const pressure = pressureAttributes(distance, radius);
      const settings = [
        `'wght' ${weight ? pressure.weight : 400}`,
        `'wdth' ${width ? pressure.width : 100}`,
        `'ital' ${italic ? pressure.italic : 0}`,
      ].join(', ');
      span.style.fontVariationSettings = settings;
      if (alpha) span.style.opacity = String(pressure.alpha);
    });
  }, [alpha, italic, weight, width]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      spansRef.current.forEach(span => {
        if (span) span.style.fontVariationSettings = RESTING_VARIATION;
      });
      return;
    }
    const pointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => applyPressure(event.clientX, event.clientY));
    };
    addEventListener('pointermove', pointerMove, { passive: true });
    return () => {
      removeEventListener('pointermove', pointerMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [applyPressure]);

  return <div ref={rootRef} className={`text-pressure ${className}`}>
    <h1
      ref={titleRef}
      aria-label={text}
      className={`${flex ? 'is-flex' : ''} ${stroke ? 'has-stroke' : ''}`}
      style={{
        color: textColor,
        fontFamily,
        fontSize,
        WebkitTextStroke: stroke ? `1px ${strokeColor}` : undefined,
        transform: scale ? 'scaleY(1.08)' : undefined,
      }}
    >
      {characters.map((character, index) => <span
        key={`${character}-${index}`}
        ref={element => { spansRef.current[index] = element; }}
        aria-hidden="true"
        style={{ fontVariationSettings: RESTING_VARIATION }}
      >{character === ' ' ? '\u00a0' : character}</span>)}
    </h1>
  </div>;
}
