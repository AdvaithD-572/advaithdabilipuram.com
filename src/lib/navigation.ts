import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function resetPageScroll(behavior: ScrollBehavior = 'auto') {
  if (typeof window === 'undefined') return;
  window.history.scrollRestoration = 'manual';
  ScrollTrigger.clearScrollMemory('manual');
  const root = document.documentElement;
  if (behavior === 'smooth') {
    window.scrollTo({ top: 0, left: 0, behavior });
    return;
  }
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  requestAnimationFrame(() => { root.style.scrollBehavior = previousBehavior; });
}

export function pageScrollProgress() {
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return maximum ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
}

export function scrollToProgress(progress: number, behavior: ScrollBehavior = 'auto') {
  const normalized = Math.min(1, Math.max(0, progress));
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  window.scrollTo({ top: normalized * maximum, left: 0, behavior });
}
