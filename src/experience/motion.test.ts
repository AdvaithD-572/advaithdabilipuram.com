import { describe, expect, it } from 'vitest';
import { handGeometry, chapterOpacity, swordAngle, sectionTarget } from './motion';

describe('authored motion invariants', () => {
  it('maintains a positive hand gap at mobile, tablet and desktop widths, including pointer extremes', () => {
    for (const width of [320, 375, 768, 1440, 2560]) {
      const geometry = handGeometry(width);
      const leftTip = geometry.left + geometry.width * .8847;
      const rightTip = width - geometry.width + geometry.right + geometry.width * .15;
      expect(rightTip - leftTip).toBeCloseTo(geometry.gap);
      expect(rightTip - leftTip - 2 * geometry.parallax).toBeGreaterThan(8);
    }
  });
  it('gives each sky chapter a readable plateau and reverses identically', () => {
    for (let index = 0; index < 4; index++) {
      const center = .39 + index * .155;
      expect(chapterOpacity(center, index)).toBe(1);
      expect(chapterOpacity(0, index)).toBe(0);
      expect(chapterOpacity(1, index)).toBe(0);
    }
  });
  it('keeps secondary sword response bounded, reversible and settled without velocity', () => {
    expect(swordAngle(0)).toBe(0);
    expect(swordAngle(-2000)).toBe(-swordAngle(2000));
    expect(Math.abs(swordAngle(500000))).toBeLessThanOrEqual(55);
  });
  it('preserves legacy and section deep links without accepting unknown routes', () => {
    expect(sectionTarget('/about', '')).toBe('about');
    expect(sectionTarget('/skills', '')).toBe('skills');
    expect(sectionTarget('/', '#intro')).toBe('intro');
    expect(sectionTarget('/', '#/contact')).toBe('contact');
    expect(sectionTarget('/projects/sienna', '')).toBe('sienna');
    expect(sectionTarget('/missing', '')).toBe(null);
    expect(sectionTarget('/', '#bad')).toBe(null);
  });
});
