export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
export const smooth = (value: number) => value * value * (3 - 2 * value);

export function handGeometry(viewport: number) {
  const width = Math.min(viewport * .69, 1100);
  const gap = clamp(viewport * .045, 26, 76);
  return { width, gap, parallax: Math.min(9.6, gap / 3.5),
    left: viewport / 2 - gap / 2 - width * .8847,
    right: viewport / 2 + gap / 2 - width * .15 - (viewport - width) };
}

export function chapterOpacity(progress: number, index: number) {
  const center = .39 + index * .155;
  return Math.min(range(progress, center - .065, center - .035), 1 - range(progress, center + .035, center + .068));
}

export const swordAngle = (velocity: number) => clamp(velocity / 65, -55, 55);
const sections = ['home', 'intro', 'projects', 'about', 'skills', 'services', 'credibility', 'contact'];
const slugs = ['intelli-credit', 'recovery-companion', 'sienna', 'sports-intelligence'];
export function sectionTarget(path: string, hash: string): string | null {
  const input = (hash ? hash.replace(/^#/, '') : path).replace(/^\//, '').replace(/\/$/, '');
  if (!input) return 'home';
  if (sections.includes(input)) return input;
  if (input.startsWith('projects/') && slugs.includes(input.slice(9))) return input.slice(9);
  if (slugs.includes(input)) return input;
  return null;
}

export function destinationOffset(id: string, reducedMotion = false) {
  const element = document.getElementById(id);
  if (!element) return 0;
  if (reducedMotion) return element.getBoundingClientRect().top + scrollY;
  const projectIndex = slugs.indexOf(id);
  const journey = document.getElementById('work-journey');
  if (journey && (projectIndex >= 0 || id === 'projects')) {
    const progress = .4 + Math.max(0, projectIndex) * .145;
    return journey.offsetTop + (journey.offsetHeight - innerHeight) * progress;
  }
  const opening = document.getElementById('home');
  if (id === 'intro' && opening) return opening.offsetTop + (opening.offsetHeight - innerHeight) * .39;
  return element.getBoundingClientRect().top + scrollY;
}
