import { describe, expect, it } from 'vitest';
import { flowingLetters, namePoses } from './name-flow';
describe('one continuous name', () => {
  const widths = flowingLetters.map(() => 100);
  it('starts with exactly ADVAITH and inserts only additional I glyphs', () => {
    const initial = namePoses(0, 1440, 900, widths);
    expect(flowingLetters.filter((_, i) => initial[i].opacity > 0).join('')).toBe('ADVAITH');
    const extended = namePoses(.1, 1440, 900, widths);
    expect(flowingLetters.filter((_, i) => extended[i].opacity > 0).join('')).toBe('ADVAIIIIIIITH');
    expect(extended[0].scale).toBe(initial[0].scale);
  });
  it('releases the same letters left to right, and scroll reversal reconstructs their poses', () => {
    const poses = namePoses(.2, 1440, 900, widths);
    expect(poses[0].flow).toBeGreaterThan(poses[12].flow);
    expect(namePoses(.6, 1440, 900, widths)).toEqual(namePoses(.6, 1440, 900, widths));
  });
  it('wraps both in front and behind the sword and changes phase with scroll', () => {
    const a = namePoses(.55, 375, 812, widths);
    const b = namePoses(.6, 375, 812, widths);
    expect(a.some(pose => pose.z < 0)).toBe(true);
    expect(a.some(pose => pose.z > 0)).toBe(true);
    expect(a[0].x).not.toBe(b[0].x);
    expect(a.every(pose => Number.isFinite(pose.x + pose.y + pose.rotationY))).toBe(true);
  });
});
