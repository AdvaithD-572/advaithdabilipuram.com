import { describe, expect, it } from 'vitest';
import { bladeGeometry, swordDimensions, swordPose } from './sword-geometry';

describe('sword geometry and reversible motion', () => {
  it('gives the blade a long pointed silhouette and real front/back thickness', () => {
    const { positions, indices } = bladeGeometry();
    expect(swordDimensions.bladeLength / swordDimensions.totalHeight).toBeGreaterThan(.74);
    expect(Math.max(...positions.filter((_, i) => i % 3 === 2))).toBeGreaterThan(.1);
    expect(Math.min(...positions.filter((_, i) => i % 3 === 2))).toBeLessThan(-.1);
    expect(indices.length % 3).toBe(0);
    expect(indices.every(index => index >= 0 && index < positions.length / 3)).toBe(true);
    const tip = positions.slice(-3);
    expect(tip).toEqual([0, -3.8, 0]);
  });
  it('keeps scroll authoritative and limits the secondary velocity impulse', () => {
    const start = swordPose(.3, 0), end = swordPose(.94, 0);
    expect((end.turn - start.turn) * 180 / Math.PI).toBeCloseTo(320);
    expect(swordPose(.6, 0)).toEqual(swordPose(.6, 0));
    expect(Math.abs(swordPose(.6, 100000).impulse)).toBeLessThanOrEqual(.22);
    expect(swordPose(.6, -100000).impulse).toBe(-swordPose(.6, 100000).impulse);
  });
});
