import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const clampAttribute = (distance: number, maxDistance: number, minimum: number, maximum: number) =>
  Math.max(minimum, maximum - (maximum * distance) / Math.max(maxDistance, 1));

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

  const applyPressure = useCallback((clientX: number) => {
    const title = titleRef.current;
    if (!title) return;
    const rect = title.getBoundingClientRect();
    const maxDistance = rect.width / 2;
    spansRef.current.forEach((span, index) => {
      if (!span) return;
      const center = rect.left + ((index + 0.5) / characters.length) * rect.width;
      const distance = Math.abs(clientX - center);
      const settings = [
        `'wght' ${weight ? Math.round(clampAttribute(distance, maxDistance, 160, 900)) : 500}`,
        `'wdth' ${width ? Math.round(clampAttribute(distance, maxDistance, 45, 151)) : 100}`,
        `'ital' ${italic ? Math.min(1, clampAttribute(distance, maxDistance, 0, 1)).toFixed(2) : 0}`,
      ].join(', ');
      span.style.fontVariationSettings = settings;
      if (alpha) span.style.opacity = String(Math.max(0.25, clampAttribute(distance, maxDistance, 0.25, 1)));
    });
  }, [alpha, characters.length, italic, weight, width]);

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
        if (span) span.style.fontVariationSettings = "'wght' 560, 'wdth' 100, 'ital' 0";
      });
      return;
    }
    const pointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => applyPressure(event.clientX));
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
      >{character === ' ' ? '\u00a0' : character}</span>)}
    </h1>
  </div>;
}
