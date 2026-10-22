// B — Marquee: 2 band berlawanan arah + skew mengikuti kecepatan scroll.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function init() {
  const bands = gsap.utils.toArray('[data-marquee]');
  const pauseBtn = document.getElementById('tombol-jeda-marquee');
  if (bands.length === 0) return () => {};

  const state = { paused: false, visible: true, tabVisible: !document.hidden };
  const movers = bands.map((rel) => {
    const arah = Number(rel.dataset.arah || '-1');
    return { rel, arah, x: 0, half: 1, speed: 1.1 };
  });

  const ukur = () => {
    movers.forEach((m) => {
      m.half = m.rel.scrollWidth / 2 || 1;
    });
  };
  ukur();

  let raf = 0;
  const putar = () => {
    raf = requestAnimationFrame(putar);
    if (state.paused || !state.visible || !state.tabVisible) return;
    movers.forEach((m) => {
      m.x += m.speed * m.arah;
      if (m.x <= -m.half) m.x += m.half;
      if (m.x >= 0) m.x -= m.half;
      m.rel.style.transform = `translate3d(${m.x}px,0,0)`;
    });
  };
  putar();

  // Skew mengikuti kecepatan scroll (velocity), lalu meluruh.
  const skewKe = gsap.quickTo(
    bands,
    'skewX',
    { duration: 0.4, ease: 'power2.out', overwrite: 'auto' }
  );
  const stSkew = ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-8, 8, self.getVelocity() / -350);
      skewKe(v);
    },
  });

  const io = new IntersectionObserver(
    (entries) => {
      state.visible = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0 }
  );
  bands.forEach((b) => io.observe(b.closest('.marquee') || b));

  const onVis = () => {
    state.tabVisible = !document.hidden;
  };
  const onResize = () => ukur();
  const onToggle = () => {
    state.paused = !state.paused;
    pauseBtn?.setAttribute('aria-pressed', String(state.paused));
    const label = pauseBtn?.querySelector('span:last-child');
    if (label) label.textContent = state.paused ? 'Jalankan pita berjalan' : 'Jeda pita berjalan';
  };

  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('resize', onResize);
  pauseBtn?.addEventListener('click', onToggle);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('resize', onResize);
    pauseBtn?.removeEventListener('click', onToggle);
    io.disconnect();
    stSkew.kill();
    movers.forEach((m) => {
      m.rel.style.transform = '';
    });
    gsap.set(bands, { clearProps: 'transform' });
  };
}
