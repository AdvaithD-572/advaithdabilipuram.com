import { useRef } from 'react';

export function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    e.currentTarget.style.setProperty('--tilt-x', `${-y * 11}deg`); e.currentTarget.style.setProperty('--tilt-y', `${x * 11}deg`); e.currentTarget.style.setProperty('--spot-x', `${(x + .5) * 100}%`); e.currentTarget.style.setProperty('--spot-y', `${(y + .5) * 100}%`);
  };
  const reset = () => { ref.current?.style.setProperty('--tilt-x', '0deg'); ref.current?.style.setProperty('--tilt-y', '0deg'); };
  return <div ref={ref} className={`tilt-card ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}<i className="tilt-card__light" aria-hidden="true" /></div>;
}
