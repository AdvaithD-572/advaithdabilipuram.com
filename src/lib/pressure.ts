export type PressureAttributes = {
  weight: number;
  width: number;
  italic: number;
  alpha: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function pressureAttributes(distance: number, radius: number): PressureAttributes {
  const influence = clamp(1 - distance / Math.max(radius, 1), 0, 1);
  return {
    weight: Math.round(100 + influence * 800),
    width: Math.round(35 + influence * 116),
    italic: Number(influence.toFixed(2)),
    alpha: 1,
  };
}

export const RESTING_VARIATION = "'wght' 100, 'wdth' 35, 'ital' 0";
