import { clamp, range, smooth } from './motion';
export const flowingLetters = [...'ADVAIIIIIIITH'];
export function namePoses(progress: number, viewport: number, height: number, widths: number[]) {
  const expansion = smooth(range(progress, .004, .1));
  const tracking = -viewport * .007;
  const factors = widths.map((_, index) => index >= 5 && index <= 10 ? expansion : 1);
  const advances = widths.map((width, index) => (width + tracking) * factors[index]);
  const total = advances.reduce((sum, value) => sum + value, 0);
  const center = viewport * (viewport < 600 ? .59 : .5);
  const radius = clamp(viewport * .13, 80, 200);
  const phase = range(progress, .24, .945) * Math.PI * 5;
  return flowingLetters.map((_, index) => {
    const flow = smooth(range(progress, .105 + index * .011, .27 + index * .011));
    const startX = (viewport - total) / 2 + advances.slice(0, index).reduce((sum, value) => sum + value, 0);
    const angle = index * .53 - phase;
    const finalScale = viewport < 600 ? .47 : .29;
    const scale = 1 + (finalScale - 1) * flow;
    const endX = center + Math.sin(angle) * radius - widths[index] * finalScale / 2;
    const endY = height * (.2 + index * .041) + range(progress, .4, .94) * height * .07;
    const arc = Math.sin(flow * Math.PI);
    return { x: startX + (endX - startX) * flow + arc * viewport * .06,
      y: height * .515 + (endY - height * .515) * flow + arc * height * .14,
      z: Math.cos(angle) * 100 * flow,
      rotationY: -angle * 180 / Math.PI * flow,
      rotation: Math.sin(angle) * 13 * flow,
      scale, scaleX: factors[index], opacity: factors[index] > .001 ? 1 - range(progress, .93, .975) : 0, flow };
  });
}
