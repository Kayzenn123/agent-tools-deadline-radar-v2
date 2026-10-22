// C — Teks: kata judul jatuh lalu menumpuk (sekali saat muat).
import gsap from 'gsap';

export function init() {
  const kata = gsap.utils.toArray('.judul-radar .kata');
  if (kata.length === 0) return () => {};

  const tween = gsap.from(kata, {
    y: -180,
    opacity: 0,
    rotation: () => gsap.utils.random(-18, 18),
    duration: 0.8,
    ease: 'bounce.out',
    stagger: 0.16,
    delay: 0.15,
    clearProps: 'opacity',
  });

  return () => {
    tween.kill();
    gsap.set(kata, { clearProps: 'all' });
  };
}
