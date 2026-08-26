import { useCallback, useEffect, useRef, useState } from 'react';

type OptionWheelProps = {
  items: string[];
  selected?: number;
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: 'left' | 'right';
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  className?: string;
};

export function OptionWheel({
  items,
  selected,
  defaultSelected = 0,
  onChange,
  textColor = '#aaa9a2',
  activeColor = '#aeff46',
  side = 'left',
  fontSize = 3,
  spacing = 1.25,
  curve = 1,
  tilt = 6,
  blur = 1.4,
  fade = 0.22,
  minOpacity = 0.08,
  smoothing = 180,
  inset = 64,
  loop = false,
  draggable = true,
  className = '',
}: OptionWheelProps) {
  const initial = selected ?? defaultSelected;
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const positionRef = useRef(initial);
  const targetRef = useRef(initial);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const wheelTimerRef = useRef(0);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const draggedRef = useRef(false);
  const selectedRef = useRef(initial);
  const [selectedIndex, setSelectedIndex] = useState(initial);
  const [isDragging, setIsDragging] = useState(false);

  const rowHeight = Math.max(fontSize * spacing * 16, 1);
  const reducedMotion = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layout = useCallback((now: number) => {
    const delta = Math.min((now - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = now;
    const smoothingSeconds = Math.max(smoothing, 1) / 1000;
    const amount = reducedMotion ? 1 : 1 - Math.exp(-delta / smoothingSeconds);
    const current = positionRef.current;
    const target = targetRef.current;
    let next = current + (target - current) * amount;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    positionRef.current = next;

    const count = items.length;
    const mirror = side === 'right' ? -1 : 1;
    const tiltRadians = (tilt * Math.PI) / 180;
    const radius = tiltRadians > 0.0005 ? rowHeight / tiltRadians : 0;
    itemRefs.current.forEach((element, index) => {
      if (!element) return;
      let distance = index - next;
      if (loop && count > 1) {
        distance = ((distance % count) + count) % count;
        if (distance > count / 2) distance -= count;
      }
      const absoluteDistance = Math.abs(distance);
      let x = 0;
      let y = distance * rowHeight;
      let rotation = 0;
      if (radius > 0) {
        const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, distance * tiltRadians));
        y = radius * Math.sin(angle);
        x = -mirror * radius * (1 - Math.cos(angle)) * curve;
        rotation = (mirror * angle * 180) / Math.PI;
      }
      element.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rotation.toFixed(2)}deg)`;
      element.style.opacity = String(Math.max(minOpacity, 1 - absoluteDistance * fade));
      element.style.filter = blur > 0 ? `blur(${(absoluteDistance * blur).toFixed(2)}px)` : 'none';
    });
    if (!settled) frameRef.current = requestAnimationFrame(layout);
  }, [blur, curve, fade, items.length, loop, minOpacity, reducedMotion, rowHeight, side, smoothing, tilt]);

  const startLoop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    lastFrameRef.current = performance.now();
    frameRef.current = requestAnimationFrame(layout);
  }, [layout]);

  const applyTarget = useCallback((value: number, snap: boolean) => {
    if (!items.length) return;
    let next = value;
    if (!loop) next = Math.min(Math.max(next, 0), items.length - 1);
    if (snap) next = Math.round(next);
    targetRef.current = next;
    const index = ((Math.round(next) % items.length) + items.length) % items.length;
    if (index !== selectedRef.current) {
      selectedRef.current = index;
      setSelectedIndex(index);
      onChange?.(index, items[index]);
    }
    startLoop();
  }, [items, loop, onChange, startLoop]);

  useEffect(() => {
    if (selected === undefined) return;
    selectedRef.current = selected;
    setSelectedIndex(selected);
    targetRef.current = selected;
    startLoop();
  }, [selected, startLoop]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 24 : event.deltaY;
      applyTarget(targetRef.current + Math.max(-1, Math.min(1, delta / rowHeight)), false);
      clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => applyTarget(targetRef.current, true), 120);
    };
    root.addEventListener('wheel', wheel, { passive: false });
    startLoop();
    return () => {
      root.removeEventListener('wheel', wheel);
      clearTimeout(wheelTimerRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, [applyTarget, rowHeight, startLoop]);

  const chooseItem = (index: number) => {
    if (draggedRef.current) return;
    applyTarget(index, true);
  };

  return <div
    ref={rootRef}
    role="listbox"
    tabIndex={0}
    aria-label="Select a project"
    aria-activedescendant={`project-option-${selectedIndex}`}
    className={`option-wheel ${side === 'right' ? 'option-wheel--right' : ''} ${isDragging ? 'is-dragging' : ''} ${className}`}
    style={{
      '--ow-text': textColor,
      '--ow-active': activeColor,
      '--ow-font-size': `${fontSize}rem`,
      '--ow-inset': `${inset}px`,
    } as React.CSSProperties}
    onPointerDown={event => {
      if (!draggable) return;
      dragRef.current = { y: event.clientY, start: targetRef.current, id: event.pointerId };
      draggedRef.current = false;
      setIsDragging(true);
    }}
    onPointerMove={event => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = event.clientY - drag.y;
      if (!draggedRef.current && Math.abs(delta) > 4) {
        draggedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (draggedRef.current) applyTarget(drag.start - delta / rowHeight, false);
    }}
    onPointerUp={() => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setIsDragging(false);
      if (draggedRef.current) applyTarget(targetRef.current, true);
    }}
    onPointerCancel={() => { dragRef.current = null; setIsDragging(false); }}
    onKeyDown={event => {
      const delta = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : 0;
      if (!delta) return;
      event.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    }}
  >
    {items.map((label, index) => <div
      id={`project-option-${index}`}
      key={`${label}-${index}`}
      ref={element => { itemRefs.current[index] = element; }}
      role="option"
      aria-selected={selectedIndex === index}
      className={`option-wheel__item ${selectedIndex === index ? 'is-selected' : ''}`}
      onClick={() => chooseItem(index)}
    >{label}</div>)}
  </div>;
}
