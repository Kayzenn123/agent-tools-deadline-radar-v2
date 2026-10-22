// E — Reveal: garis sumbu draw-on (scrub), lalu karcis muncul berurutan.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function init() {
  const triggers = [];
  const garis = document.querySelector('[data-garis-sumbu]');
  const sumbu = document.querySelector('[data-sumbu]');

  if (garis && sumbu) {
    const panjang = garis.getTotalLength();
    gsap.set(garis, { strokeDasharray: panjang, strokeDashoffset: panjang });
    triggers.push(
      ScrollTrigger.create({
        trigger: sumbu,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 0.5,
        animation: gsap.to(garis, { strokeDashoffset: 0, ease: 'none' }),
      })
    );
  }

  const karcis = gsap.utils.toArray('.karcis-item');
  if (karcis.length > 0) {
    gsap.set(karcis, { y: 36, opacity: 0 });
    triggers.push(
      ScrollTrigger.batch(karcis, {
        start: 'top 90%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          }),
      })
    );
  }

  return () => {
    triggers.forEach((t) => {
      if (Array.isArray(t)) t.forEach((x) => x.kill());
      else t.kill();
    });
    gsap.set(karcis, { clearProps: 'all' });
    if (garis) gsap.set(garis, { clearProps: 'all' });
    ScrollTrigger.refresh();
  };
}
