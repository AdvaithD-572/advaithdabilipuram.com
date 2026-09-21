import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapterOpacity, clamp, destinationOffset, handGeometry, range, smooth } from './motion';
import { flowingLetters, namePoses } from './name-flow';
import { alphaHit, approvedGlitchSources, loadHandMask, type AlphaMask, type HandSide } from './hand-hover';
import { Sword3D, type SwordHandle } from './Sword3D';

gsap.registerPlugin(ScrollTrigger);
const chapters = [
  ['Who I am', 'A little context.', 'This space will introduce the person behind the work: where the curiosity began, what matters now, and what comes next.'],
  ['How I think', 'A point of view.', 'A short personal perspective will live here, connecting the questions worth asking with the decisions that shape the work.'],
  ['What I build', 'Ideas into systems.', 'Full-stack applications, applied AI and mobile experiences. Explore the actual projects in the next world.'],
  ['How I build', 'From first question.', 'This space will describe the working process, from understanding a problem to making, testing and refining a useful result.'],
];
export function Opening({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<HTMLElement>(null);
  const sword = useRef<SwordHandle>(null);
  useLayoutEffect(() => {
    if (!root.current || reducedMotion) return;
    const section = root.current;
    const select = gsap.utils.selector(section);
    const stage = section.querySelector<HTMLElement>('.opening-stage')!;
    const letters = [...section.querySelectorAll<HTMLElement>('.flow-letter')];
    const video = section.querySelector<HTMLVideoElement>('video')!;
    let introDone = false;
    let frame = 0;
    let progress = 0;
    let loaded = false;
    let desiredTime = 0;
    let active = true;
    let alive = true;
    let fade = 0;
    let world = '';
    let geometry = handGeometry(section.clientWidth);
    let widths = letters.map(letter => letter.offsetWidth);
    let hovered: HandSide | null = null;
    let hoverTimer = 0;
    const masks: Partial<Record<HandSide, AlphaMask>> = {};
    (['left', 'right'] as HandSide[]).forEach(side => {
      void loadHandMask(`/assets/worlds/${side}-hand.webp`).then(mask => { if (alive && mask) masks[side] = mask; });
    });
    const introStart = performance.now();
    const seek = () => {
      if (document.hidden || !active || !loaded || video.readyState < 1 || video.seeking) return;
      if (Math.abs(video.currentTime - desiredTime) > .07) video.currentTime = Math.min(desiredTime, Math.max(0, video.duration - .04));
    };
    video.addEventListener('seeked', seek);
    video.addEventListener('loadedmetadata', seek);
    const drawLetters = (p: number) => namePoses(p, section.clientWidth, innerHeight, widths).forEach((pose, index) => {
      gsap.set(letters[index], { x: pose.x, y: pose.y, rotationY: pose.rotationY, rotation: pose.rotation,
        scaleX: pose.scale * pose.scaleX, scaleY: pose.scale, opacity: pose.opacity * fade, zIndex: pose.z >= 0 ? 5 : 3 });
    });
    const poseHands = (convergence: number) => {
      const travel = (1 - smooth(convergence)) * section.clientWidth * .62;
      gsap.set(select('.hand-left'), { width: geometry.width, x: geometry.left - travel });
      gsap.set(select('.hand-right'), { width: geometry.width, x: geometry.right + travel });
      gsap.set(select('.hero-scenery'), { opacity: smooth(range(convergence, .22, 1)) });
    };
    const resetHover = () => {
      clearTimeout(hoverTimer);
      hovered = null;
      select('.hand-plane').forEach((hand: HTMLElement) => { hand.dataset.treatment = 'photo'; });
    };
    const finish = () => {
      introDone = true;
      fade = 1;
      cancelAnimationFrame(frame);
      poseHands(1);
      drawLetters(progress);
      gsap.set(select('.hero-caption'), { opacity: 1 });
    };
    const introduction = (now: number) => {
      if (progress > .002) { finish(); return; }
      const elapsed = now - introStart;
      poseHands(clamp(elapsed / 2900));
      fade = smooth(range(elapsed, 3100, 3950));
      drawLetters(0);
      gsap.set(select('.hero-caption'), { opacity: fade });
      if (elapsed >= 3950) { finish(); return; }
      frame = requestAnimationFrame(introduction);
    };
    const context = gsap.context(() => {
      const draw = (p: number) => {
        drawLetters(p);
        const transition = smooth(range(p, .2, .345));
        gsap.set(select('.hero-hands'), { opacity: 1 - range(p, .055, .18), yPercent: -range(p, .05, .2) * 18 });
        gsap.set(select('.hero-caption'), { opacity: 1 - range(p, .015, .07) });
        gsap.set(select('.hero-world'), { yPercent: -transition * 100 });
        gsap.set(select('.sky-world'), { y: 0, yPercent: 100 - transition * 100 });
        gsap.set(select('.sword-position'), { y: 0, yPercent: -150 + smooth(range(p, .255, .42)) * 150, opacity: 1 - range(p, .925, .975) });
        sword.current?.setActive(p > .24 && p < .975);
        sword.current?.setPose(p, 0);
        select('.sky-chapter').forEach((chapter: HTMLElement, index: number) => {
          const opacity = chapterOpacity(p, index);
          gsap.set(chapter, { opacity, y: (1 - opacity) * (index % 2 ? -30 : 30), scale: .96 + opacity * .04, visibility: opacity > .005 ? 'visible' : 'hidden' });
        });
        const plunge = Math.pow(range(p, .945, 1), 2);
        gsap.set(select('.sky-camera'), { yPercent: -plunge * 75, scale: 1 + plunge * .7 });
        gsap.set(select('.landing-cue'), { opacity: range(p, .965, 1), yPercent: 140 * (1 - range(p, .955, 1)) });
        if (p > .2 && p < 1 && !loaded) { video.src = '/assets/worlds/sky.mp4'; loaded = true; video.load(); }
        desiredTime = range(p, .28, .94) * 7.95;
        seek();
        stage.dataset.phase = p < .25 ? 'hero' : p > .94 ? 'plunge' : 'sky';
        const nextWorld = p < .25 ? 'Home' : 'Intro';
        if (world !== nextWorld && active) { world = nextWorld; dispatchEvent(new CustomEvent('experience:world', { detail: { label: world, light: p >= .25 } })); }
        if (p > .1) resetHover();
      };
      const trigger = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
        onUpdate(self) {
          progress = self.progress;
          if (!introDone && progress > .002) finish();
          if (!introDone) return;
          active = self.isActive;
          draw(progress);
          sword.current?.setPose(progress, self.getVelocity());
        },
        onRefresh(self) { progress = self.progress; geometry = handGeometry(section.clientWidth); widths = letters.map(letter => letter.offsetWidth); if (!introDone && progress > .002) finish(); if (introDone) { poseHands(1); draw(progress); } },
        onToggle(self) { active = self.isActive; if (!active) { video.pause(); resetHover(); sword.current?.setActive(false); } },
      });
      const skip = () => { finish(); draw(trigger.progress); };
      addEventListener('experience:skip-intro', skip);
      frame = requestAnimationFrame(introduction);
      const pointerX = gsap.quickTo(select('.hand-pointer'), 'x', { duration: .65, ease: 'power3.out' });
      const pointerY = gsap.quickTo(select('.hand-pointer'), 'y', { duration: .65, ease: 'power3.out' });
      const hoverHand = (side: HandSide) => {
        if (hovered === side) return;
        resetHover();
        hovered = side;
        const plane = section.querySelector<HTMLElement>(`.hand-${side}`)!;
        if (!approvedGlitchSources[side]) { plane.dataset.treatment = 'ink'; return; }
        plane.dataset.treatment = 'glitch';
        hoverTimer = window.setTimeout(() => { if (hovered === side) plane.dataset.treatment = 'ink'; }, 140);
      };
      const move = (event: PointerEvent) => {
        if (!introDone || progress > .1 || event.pointerType !== 'mouse') return;
        pointerX(clamp(event.clientX / innerWidth * 2 - 1, -1, 1) * geometry.parallax);
        pointerY(clamp(event.clientY / innerHeight * 2 - 1, -1, 1) * geometry.parallax);
        const obscured = letters.some(letter => {
          if (Number(gsap.getProperty(letter, 'opacity')) < .1) return false;
          const rect = letter.getBoundingClientRect();
          return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        });
        if (obscured) { resetHover(); return; }
        for (const side of ['left', 'right'] as HandSide[]) {
          const photo = section.querySelector<HTMLImageElement>(`.hand-${side} .hand-photo`)!;
          const rect = photo.getBoundingClientRect();
          const mask = masks[side];
          if (mask && alphaHit(mask, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height)) { hoverHand(side); return; }
        }
        resetHover();
      };
      const leave = () => { pointerX(0); pointerY(0); resetHover(); };
      section.addEventListener('pointermove', move, { passive: true });
      section.addEventListener('pointerleave', leave);
      return () => { removeEventListener('experience:skip-intro', skip); section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave); };
    }, section);
    return () => { alive = false; cancelAnimationFrame(frame); clearTimeout(hoverTimer); context.revert(); video.pause(); video.removeEventListener('seeked', seek); video.removeEventListener('loadedmetadata', seek); };
  }, [reducedMotion]);

  const goToIntro = () => {
    dispatchEvent(new Event('experience:skip-intro'));
    const target = document.getElementById('intro');
    scrollTo({ top: reducedMotion ? (target?.getBoundingClientRect().top ?? 0) + scrollY : destinationOffset('intro'), behavior: 'instant' });
    target?.focus({ preventScroll: true });
  };
  return <section id="home" ref={root} className={`opening ${reducedMotion ? 'opening-static' : ''}`} data-world-label="Home / Intro" tabIndex={-1}>
    <div className="opening-stage">
      <div className="hero-world">
        <img className="hero-scenery" src="/assets/worlds/hero.webp" width="2048" height="1152" alt="" fetchPriority="high" />
        <div className="hero-topline"><span>Advaith Dabilipuram</span><span>Full-stack / AI / Mobile</span></div>
        <div className="hero-hands" aria-hidden="true">{(['left', 'right'] as HandSide[]).map(side => <div className={`hand-plane hand-${side}`} key={side} data-treatment="photo"><div className="hand-pointer">
          <img className="hand-photo" src={`/assets/worlds/${side}-hand.webp`} alt="" width="876" height="432" />
          {approvedGlitchSources[side] && <img className="hand-glitch" src={approvedGlitchSources[side]} alt="" width="876" height="432" />}
          <img className="hand-ink" src={`/assets/worlds/${side}-hand-ink.webp`} alt="" width="876" height="432" />
        </div></div>)}</div>
        <div className="hero-caption"><p>Full-stack · Applied AI · Mobile</p><a href="#intro" onClick={event => { event.preventDefault(); goToIntro(); }}>Scroll to unfold <span>↓</span></a></div>
      </div>
      <h1 className="living-name" aria-label="Advaith">{flowingLetters.map((letter, index) => <span className={`flow-letter ${index >= 5 && index <= 10 ? 'extra-i' : ''}`} data-letter-index={index} key={index} aria-hidden="true">{letter}</span>)}</h1>
      <div className="sky-world" id="intro" tabIndex={-1}>
        <div className="sky-seam" />
        <div className="sky-camera"><img className="sky-poster" src="/assets/worlds/sky.webp" width="1672" height="941" alt="" loading="lazy" /><video className="sky-film" muted playsInline preload="none" aria-hidden="true" poster="/assets/worlds/sky.webp" />
        </div>
      </div>
      {!reducedMotion && <Sword3D ref={sword} />}
      <div className="sky-copy">{chapters.map(([label, title, copy], index) => <article className={`sky-chapter sky-chapter-${index}`} key={label}>
        <span className="chapter-label">{label}</span><h2>{title}</h2><p>{copy}</p>{index !== 2 && <small className="placeholder-label">Personal copy · placeholder</small>}
      </article>)}</div>
      <div className="landing-cue" aria-hidden="true">A WAY<br /><em>OF THINKING.</em></div>
    </div>
  </section>;
}
