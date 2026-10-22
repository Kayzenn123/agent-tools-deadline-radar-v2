// D — Input: drag inertia flick pada strip karcis (touch-action: pan-y di CSS).
export function init() {
  const strip = document.querySelector('[data-flick]');
  if (!strip) return () => {};

  let menyeret = false;
  let xAwal = 0;
  let scrollAwal = 0;
  let vx = 0;
  let xTerakhir = 0;
  let tTerakhir = 0;
  let raf = 0;
  let bergerak = false;

  const hentikan = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const luruh = () => {
    raf = requestAnimationFrame(luruh);
    strip.scrollLeft += vx;
    vx *= 0.94;
    if (Math.abs(vx) < 0.4) hentikan();
  };

  const onDown = (e) => {
    menyeret = true;
    bergerak = false;
    hentikan();
    xAwal = e.clientX;
    xTerakhir = e.clientX;
    tTerakhir = performance.now();
    vx = 0;
    scrollAwal = strip.scrollLeft;
    strip.classList.add('menyeret');
  };

  const onMove = (e) => {
    if (!menyeret) return;
    const dx = e.clientX - xTerakhir;
    const dt = Math.max(1, performance.now() - tTerakhir);
    if (Math.abs(e.clientX - xAwal) > 8) bergerak = true;
    vx = (dx / dt) * 16;
    xTerakhir = e.clientX;
    tTerakhir = performance.now();
    strip.scrollLeft = scrollAwal + (xAwal - e.clientX);
  };

  const onUp = () => {
    if (!menyeret) return;
    menyeret = false;
    strip.classList.remove('menyeret');
    if (Math.abs(vx) > 1.5) luruh();
  };

  // Bedakan sentil vs ketuk: kalau bergeser, telan kliknya.
  const onClick = (e) => {
    if (bergerak) {
      e.preventDefault();
      e.stopPropagation();
      bergerak = false;
    }
  };

  strip.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  window.addEventListener('pointercancel', onUp, { passive: true });
  strip.addEventListener('click', onClick, true);

  return () => {
    hentikan();
    strip.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    strip.removeEventListener('click', onClick, true);
    strip.classList.remove('menyeret');
  };
}
