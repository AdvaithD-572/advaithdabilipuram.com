import { describe, expect, it } from 'vitest';
import { flowRevealHeight } from './scroll-thread';

describe('flow thread reveal', () => {
  it('maps page progress to the same vertical percentage of the drawing', () => {
    expect(flowRevealHeight(0.34, 2669)).toBeCloseTo(907.46);
    expect(flowRevealHeight(0.5, 2669)).toBeCloseTo(1334.5);
  });

  it('clamps progress to the drawing bounds', () => {
    expect(flowRevealHeight(-1, 2669)).toBe(0);
    expect(flowRevealHeight(2, 2669)).toBe(2669);
  });
});
