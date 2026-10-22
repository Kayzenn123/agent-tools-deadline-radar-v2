// A — Kamera: pinned horizontal pan 3 panel + zoom 1.6x per panel.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function init() {
  const viewport = document.querySelector('[data-pindai]');
  const rel = document.querySelector('[data-pindai-rel]');
  const panels = gsap.utils.toArray('[data-panel-dalam]');
  const prevBtn = document.getElementById('pindai-sebelum');
  const nextBtn = document.getElementById('pindai-lanjut');
  const posLabel = document.getElementById('pindai-posisi');
  const section = document.getElementById('pindai');
  if (!viewport || !rel || panels.length !== 3) return () => {};

  const state = { panel: 0 };
  const setPos = (i) => {
    state.panel = Math.max(0, Math.min(2, i));
    if (posLabel) posLabel.textContent = `panel ${state.panel + 1} dari 3`;
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: viewport,
      start: 'top 75%',
      end: '+=160%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => setPos(Math.round(self.progress * 2)),
    },
  });

  tl.to(rel, { xPercent: -33.333, duration: 1 }, 0);
  tl.to(rel, { xPercent: -66.667, duration: 1 }, 1);
  // Zoom per panel: panel aktif membesar 1.6x saat jadi fokus.
  panels.forEach((p, i) => {
    tl.fromTo(p, { scale: 1 }, { scale: 1.6, duration: 0.5 }, i);
    tl.to(p, { scale: 1, duration: 0.5 }, i + 0.5);
  });

  const st = tl.scrollTrigger;
  const kePanel = (i) => {
    setPos(i);
    const y = st.start + (st.end - st.start) * (state.panel / 2);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const onPrev = () => kePanel(state.panel - 1);
  const onNext = () => kePanel(state.panel + 1);
  const onKey = (e) => {
    if (!section || !section.contains(document.activeElement)) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    }
  };

  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);
  document.addEventListener('keydown', onKey);

  return () => {
    prevBtn?.removeEventListener('click', onPrev);
    nextBtn?.removeEventListener('click', onNext);
    document.removeEventListener('keydown', onKey);
    st?.kill();
    tl.kill();
    gsap.set(rel, { clearProps: 'all' });
    gsap.set(panels, { clearProps: 'all' });
    ScrollTrigger.refresh();
  };
}
