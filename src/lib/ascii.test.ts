import { describe, expect, it } from 'vitest';
import { clamp, mapLuminanceToGlyph, scrollProgressFromPointer } from './ascii';

describe('ASCII effect helpers', () => {
  it('clamps values to a range', () => {
    expect(clamp(-4, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
    expect(clamp(9, 0, 1)).toBe(1);
  });

  it('maps brighter pixels to later glyphs', () => {
    expect(mapLuminanceToGlyph(0, ' .:-=+*#%@')).toBe(' ');
    expect(mapLuminanceToGlyph(255, ' .:-=+*#%@')).toBe('@');
  });

  it('turns a pointer position into exact page progress', () => {
    expect(scrollProgressFromPointer(34, 0, 100)).toBeCloseTo(0.34);
    expect(scrollProgressFromPointer(120, 0, 100)).toBe(1);
  });
});
