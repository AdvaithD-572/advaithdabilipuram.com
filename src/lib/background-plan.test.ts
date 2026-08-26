import { describe, expect, it } from 'vitest';
import {
  MAX_CANVAS_CELLS,
  MAX_CANVAS_PIXELS,
  planBackground,
  shouldAnimateBackground,
} from './background-plan';

describe('background render plan', () => {
  it('caps extreme displays to a predictable amount of work', () => {
    const plan = planBackground({ width: 7680, height: 4320, dpr: 3 });

    expect(plan.backingWidth * plan.backingHeight).toBeLessThanOrEqual(MAX_CANVAS_PIXELS);
    expect(plan.columns * plan.rows).toBeLessThanOrEqual(MAX_CANVAS_CELLS);
    expect(plan.dpr).toBeLessThanOrEqual(1.25);
  });

  it('keeps tiny and zero-sized containers finite', () => {
    for (const dimensions of [{ width: 0, height: 0, dpr: 2 }, { width: 2, height: 1, dpr: 1 }]) {
      const plan = planBackground(dimensions);
      expect(Object.values(plan).every(Number.isFinite)).toBe(true);
      expect(plan.cellSize).toBeGreaterThanOrEqual(8);
    }
  });

  it('stops animation when hidden, offscreen, or reduced motion is requested', () => {
    expect(shouldAnimateBackground({ reducedMotion: true, documentVisible: true, inView: true })).toBe(false);
    expect(shouldAnimateBackground({ reducedMotion: false, documentVisible: false, inView: true })).toBe(false);
    expect(shouldAnimateBackground({ reducedMotion: false, documentVisible: true, inView: false })).toBe(false);
    expect(shouldAnimateBackground({ reducedMotion: false, documentVisible: true, inView: true })).toBe(true);
  });
});
