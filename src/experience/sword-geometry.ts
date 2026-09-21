const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const swordDimensions = { totalHeight: 7.55, bladeLength: 5.7 };

/** Eight-sided cross sections create a central ridge, broad faces and actual honed edges. */
export function bladeGeometry() {
  const rings = [
    { y: 1.9, width: .49, depth: .13 },
    { y: 1.67, width: .55, depth: .155 },
    { y: -2.47, width: .43, depth: .13 },
    { y: -3.12, width: .31, depth: .105 },
    { y: -3.51, width: .145, depth: .052 },
  ];
  const positions = rings.flatMap(({ y, width: w, depth: d }) => [
    -w, y, 0, -w * .82, y, d * .48, 0, y, d, w * .82, y, d * .48,
    w, y, 0, w * .82, y, -d * .48, 0, y, -d, -w * .82, y, -d * .48,
  ]);
  const indices: number[] = [];
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let edge = 0; edge < 8; edge++) {
      const a = ring * 8 + edge, b = ring * 8 + (edge + 1) % 8;
      indices.push(a, a + 8, b, b, a + 8, b + 8);
    }
  }
  const tip = positions.length / 3;
  positions.push(0, -3.8, 0);
  for (let edge = 0; edge < 8; edge++) indices.push(32 + edge, tip, 32 + (edge + 1) % 8);
  for (let edge = 1; edge < 7; edge++) indices.push(0, edge, edge + 1);
  return { positions, indices };
}

export function swordPose(progress: number, velocity: number) {
  const phase = clamp((progress - .30) / .64, 0, 1);
  return { turn: (-14 + phase * 320) * Math.PI / 180,
    tilt: (-4 + phase * 8) * Math.PI / 180,
    impulse: clamp(velocity / 18000, -.22, .22) };
}
