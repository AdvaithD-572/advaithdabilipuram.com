import { describe, expect, it } from 'vitest';
import { alphaHit } from './hand-hover';
describe('hand silhouette hit testing', () => {
  const mask = { width: 2, height: 1, pixels: new Uint8ClampedArray([255, 255, 255, 0, 100, 80, 70, 255]) };
  it('ignores transparent pixels and out-of-image coordinates', () => {
    expect(alphaHit(mask, .1, .5)).toBe(false);
    expect(alphaHit(mask, -1, .5)).toBe(false);
    expect(alphaHit(mask, 1, .5)).toBe(false);
  });
  it('accepts the visible hand silhouette', () => expect(alphaHit(mask, .75, .5)).toBe(true));
});
