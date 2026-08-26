import { describe, expect, it } from 'vitest';
import { pressureAttributes } from './pressure';

describe('TextPressure variable font mapping', () => {
  it('keeps letters fully thin outside the pointer influence radius', () => {
    expect(pressureAttributes(300, 150)).toEqual({ weight: 100, width: 35, italic: 0, alpha: 1 });
  });

  it('makes a letter wide and heavy directly under the pointer', () => {
    expect(pressureAttributes(0, 150)).toEqual({ weight: 900, width: 151, italic: 1, alpha: 1 });
  });

  it('interpolates smoothly inside the influence radius', () => {
    const middle = pressureAttributes(75, 150);
    expect(middle.weight).toBe(500);
    expect(middle.width).toBe(93);
    expect(middle.italic).toBe(0.5);
  });
});
