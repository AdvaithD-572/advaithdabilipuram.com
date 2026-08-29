import { useRef } from 'react';

type TiltCardProps = {
  title?: string;
  description?: string;
  price?: string;
  badgeLabel?: string;
  badgeVariant?: 'success' | 'warning';
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  rotationFactor?: number;
};

export function TiltCard({
  title,
  description,
  price,
  badgeLabel,
  badgeVariant = 'success',
  imageSrc,
  imageAlt = '',
  href,
  children,
  className = '',
  rotationFactor = 8,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${-y * rotationFactor}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x * rotationFactor}deg`);
    event.currentTarget.style.setProperty('--spot-x', `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty('--spot-y', `${(y + 0.5) * 100}%`);
  };

  const reset = () => {
    cardRef.current?.style.setProperty('--tilt-x', '0deg');
    cardRef.current?.style.setProperty('--tilt-y', '0deg');
  };

  const card = <div ref={cardRef} className={`tilt-card ${className}`} onPointerMove={move} onPointerLeave={reset}>
    {(title || description || price) && <div className="tilt-card__header">
      <div>{title && <h3>{title}</h3>}{description && <p>{description}</p>}</div>
      {price && <span className={`tilt-card__badge ${badgeLabel ? `is-${badgeVariant}` : ''}`}>{price}{badgeLabel && <b>{badgeLabel}</b>}</span>}
    </div>}
    {imageSrc && <img src={imageSrc} alt={imageAlt} width={1920} height={1020} loading="lazy" decoding="async" className="tilt-card__image" />}
    {children}
    <i className="tilt-card__light" aria-hidden="true" />
    <i className="tilt-card__circle" aria-hidden="true" />
  </div>;

  return href ? <a href={href} className="tilt-card__link">{card}</a> : card;
}
