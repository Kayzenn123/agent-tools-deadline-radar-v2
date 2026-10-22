// DeadlineRadar — logika aplikasi: hitung mundur, saring, favorit, lembar detil, ekspor.
import { init as initCamera } from './motion/camera.js';
import { init as initMarquee } from './motion/marquee.js';
import { init as initText } from './motion/text.js';
import { init as initInput } from './motion/input.js';
import { init as initReveal } from './motion/reveal.js';

const FAV_KEY = 'deadline-radar/v1';
const GERAK_KEY = 'deadline-radar/gerak';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function parseTanggal(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(y, m - 1, d);
}
function tengahMalamIni() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}
function sisaHari(s) {
  return Math.round((parseTanggal(s).getTime() - tengahMalamIni().getTime()) / 86400000);
}
function stempelUntuk(n) {
  if (n < 0) return 'Sudah tutup';
  if (n === 0) return 'Hari terakhir';
  if (n === 1) return 'Tutup besok';
  return `Tutup ${n} hari`;
}
function formatTanggal(s) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseTanggal(s));
}
function icsEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
function csvQuote(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

function bacaKartu(el) {
  return {
    id: el.dataset.id || '',
    cat: el.dataset.cat || 'lomba',
    profils: (el.dataset.profils || '').split(',').filter(Boolean),
    deadline: el.dataset.deadline || '',
    nama: el.dataset.nama || '',
    penyelenggara: el.dataset.penyelenggara || '',
    biaya: el.dataset.biaya || '',
    kategori: el.dataset.kategori || '',
    profil: el.dataset.profil || '',
    url: el.dataset.url || '',
    sumber: el.dataset.sumber || '',
    unverified: el.dataset.unverified === '1',
  };
}

function unduh(namaFile, isi, tipe) {
  const blob = new Blob([isi], { type: tipe });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 800);
}

function icsUntuk(daftar) {
  const baris = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DeadlineRadar//ID',
  ];
  const cap = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  daftar.forEach((d) => {
    const dt = d.deadline.replace(/-/g, '');
    baris.push(
      'BEGIN:VEVENT',
      `UID:${d.id}@deadlineradar`,
      `DTSTAMP:${cap}`,
      `DTSTART;VALUE=DATE:${dt}`,
      `SUMMARY:${icsEscape(d.nama)}`,
      `DESCRIPTION:${icsEscape(`${d.penyelenggara} — ${d.url}`)}`,
      `URL:${icsEscape(d.url)}`,
      'END:VEVENT'
    );
  });
  baris.push('END:VCALENDAR');
  return baris.join('\r\n');
}

function csvUntuk(daftar) {
  const kepala = ['id', 'nama', 'penyelenggara', 'deadline', 'jenis', 'profil', 'biaya', 'tautan'];
  const baris = daftar.map((d) =>
    [d.id, d.nama, d.penyelenggara, d.deadline, d.kategori, d.profil, d.biaya, d.url].map(csvQuote).join(',')
  );
  return [kepala.join(','), ...baris].join('\n');
}

async function salinTeks(teks) {
  try {
    await navigator.clipboard.writeText(teks);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = teks;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function initApp() {
  const kartu = $$('.karcis-item').map(bacaKartu).filter((d) => d.id && d.deadline);
  const kartuRaksasa = $('.panggung .karcis') ? bacaKartu($('.panggung .karcis')) : null;
  const semuaData = kartuRaksasa ? [kartuRaksasa, ...kartu.filter((d) => d.id !== kartuRaksasa.id)] : kartu;

  /* ---------- Hitung mundur live ---------- */
  const segarkanHitung = () => {
    $$('[data-hitung]').forEach((el) => {
      const n = sisaHari(el.dataset.deadline || '');
      el.textContent = stempelUntuk(n);
    });
    $$('[data-stempel]').forEach((el) => {
      const host = el.closest('[data-deadline]');
      if (host) el.textContent = stempelUntuk(sisaHari(host.dataset.deadline || ''));
    });
  };
  segarkanHitung();

  /* ---------- Favorit (localStorage + fallback) ---------- */
  let favorit = new Set();
  const galatEl = $('#keadaan-galat');
  try {
    const mentah = localStorage.getItem(FAV_KEY);
    if (mentah) {
      const arr = JSON.parse(mentah);
      if (Array.isArray(arr)) favorit = new Set(arr.filter((x) => typeof x === 'string'));
    }
  } catch {
    if (galatEl) galatEl.hidden = false;
  }
  const simpanFavorit = () => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favorit]));
    } catch {
      if (galatEl) galatEl.hidden = false;
    }
  };

  const hitungEl = $('#hitung-simpan-angka');
  const terapkanFavoritUI = () => {
    if (hitungEl) hitungEl.textContent = String(favorit.size);
    $$('[data-aksi="simpan"]').forEach((btn) => {
      const host = btn.closest('[data-id]');
      const id = host ? host.dataset.id || '' : '';
      const aktif = favorit.has(id);
      btn.setAttribute('aria-pressed', String(aktif));
      const label = btn.querySelector('span');
      if (label && btn.classList.contains('tombol')) label.textContent = aktif ? 'Tersimpan' : 'Simpan karcis';
      if (btn.id === 'lembar-simpan' && label) label.textContent = aktif ? 'Tersimpan' : 'Simpan karcis';
    });
    perbaruiBanner();
  };

  const banner = $('#banner-mendesak');
  const bannerTeks = $('#banner-mendesak-teks');
  let bannerDitutup = false;
  const perbaruiBanner = () => {
    if (!banner || !bannerTeks || bannerDitutup || favorit.size === 0) {
      if (banner) banner.hidden = true;
      return;
    }
    const mendesak = [...favorit]
      .map((id) => kartu.find((d) => d.id === id) || (kartuRaksasa && kartuRaksasa.id === id ? kartuRaksasa : null))
      .filter(Boolean)
      .map((d) => ({ d, n: sisaHari(d.deadline) }))
      .filter((x) => x.n >= 0 && x.n <= 3)
      .sort((a, b) => a.n - b.n)[0];
    if (!mendesak) {
      banner.hidden = true;
      return;
    }
    const kapan = mendesak.n === 0 ? 'hari ini hari terakhir' : mendesak.n === 1 ? 'tinggal 1 hari' : `tinggal ${mendesak.n} hari`;
    bannerTeks.textContent = `Mas, ${mendesak.d.nama} ${kapan}. Jangan sampai nangis di grup angkatan.`;
    banner.hidden = false;
  };
  $('#banner-mendesak-tutup')?.addEventListener('click', () => {
    bannerDitutup = true;
    if (banner) banner.hidden = true;
  });

  const alihkanFavorit = (id) => {
    if (favorit.has(id)) favorit.delete(id);
    else favorit.add(id);
    simpanFavorit();
    terapkanFavoritUI();
  };

  /* ---------- Lembar detil ---------- */
  const lembar = $('#lembar');
  const latar = $('#latar-lembar');
  let fokusTerakhir = null;
  let idLembar = '';

  const bukaLembar = (id) => {
    const d = semuaData.find((x) => x.id === id);
    if (!d || !lembar || !latar) return;
    idLembar = id;
    fokusTerakhir = document.activeElement;
    $('#lembar-judul').textContent = d.nama;
    $('#lembar-stempel').textContent = stempelUntuk(sisaHari(d.deadline));
    $('#lembar-penyelenggara').textContent = d.penyelenggara || 'penyelenggara tidak tercantum di sumber';
    $('#lembar-tanggal').textContent = `${formatTanggal(d.deadline)} (${stempelUntuk(sisaHari(d.deadline)).toLowerCase()})`;
    $('#lembar-jenis').textContent = d.kategori || d.cat;
    $('#lembar-profil').textContent = d.profil || 'cek situs resmi';
    $('#lembar-biaya').textContent = d.biaya || 'cek situs resmi';
    $('#lembar-verifikasi').textContent = d.unverified
      ? 'belum terverifikasi — cek ulang ke panitia'
      : 'terverifikasi dari sumber tercantum';
    const situs = $('#lembar-situs');
    situs.href = d.url;
    $('#lembar-sumber').textContent = `Sumber: ${d.sumber}`;
    const btnSimpan = $('#lembar-simpan');
    btnSimpan.dataset.idLembar = id;
    btnSimpan.setAttribute('aria-pressed', String(favorit.has(id)));
    const labelSimpan = btnSimpan.querySelector('span');
    if (labelSimpan) labelSimpan.textContent = favorit.has(id) ? 'Tersimpan' : 'Simpan karcis';
    latar.hidden = false;
    lembar.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lembar-tutup').focus();
    try {
      history.replaceState(null, '', `#d=${id}`);
    } catch {
      /* abaikan */
    }
  };

  const tutupLembar = () => {
    if (!lembar || !latar || lembar.hidden) return;
    idLembar = '';
    latar.hidden = true;
    lembar.hidden = true;
    document.body.style.overflow = '';
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* abaikan */
    }
    if (fokusTerakhir && typeof fokusTerakhir.focus === 'function') fokusTerakhir.focus();
  };

  $('#lembar-tutup')?.addEventListener('click', tutupLembar);
  latar?.addEventListener('click', tutupLembar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tutupLembar();
  });
  $('#lembar-simpan')?.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.idLembar;
    if (id) alihkanFavorit(id);
  });
  $('#lembar-ics')?.addEventListener('click', () => {
    const d = semuaData.find((x) => x.id === idLembar);
    if (d) unduh(`deadline-${d.id}.ics`, icsUntuk([d]), 'text/calendar');
  });
  $('#lembar-salin')?.addEventListener('click', async () => {
    const ok = await salinTeks(`${window.location.origin}${window.location.pathname}#d=${idLembar}`);
    pesanAksi(ok ? 'Tautan karcis tersalin, Mas.' : 'Gagal menyalin — salin manual dari bilah alamat.');
  });

  // Klik kartu & tombol di dalamnya
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const btnSimpan = target.closest('[data-aksi="simpan"]');
    if (btnSimpan) {
      e.stopPropagation();
      const host = btnSimpan.closest('[data-id]');
      if (host && host.dataset.id) alihkanFavorit(host.dataset.id);
      return;
    }
    if (target.closest('[data-aksi="detil"]')) {
      const host = target.closest('[data-id]');
      if (host && host.dataset.id) bukaLembar(host.dataset.id);
      return;
    }
    const buka = target.closest('[data-buka-detil]');
    if (buka && buka.dataset.bukaDetil) {
      bukaLembar(buka.dataset.bukaDetil);
      return;
    }
    const item = target.closest('.karcis-item');
    if (item && item.dataset.id) bukaLembar(item.dataset.id);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element) {
      const item = e.target.closest('.karcis-item');
      if (item && e.target === item && item.dataset.id) {
        e.preventDefault();
        bukaLembar(item.dataset.id);
      }
    }
  });

  // Deep-link #d=<id>
  const dariHash = () => {
    const m = window.location.hash.match(/^#d=([\w-]+)$/);
    if (m && semuaData.some((d) => d.id === m[1])) bukaLembar(m[1]);
  };
  window.addEventListener('hashchange', dariHash);

  /* ---------- Saring + cari ---------- */
  const saring = { q: '', kat: 'semua', profil: 'semua', rentang: 'semua' };
  const hasilHitung = $('#hasil-hitung');
  const kosongEl = $('#keadaan-kosong');

  const cocok = (d) => {
    if (saring.kat !== 'semua' && d.cat !== saring.kat) return false;
    if (saring.profil !== 'semua' && d.profils.length > 0 && !d.profils.includes(saring.profil)) return false;
    if (saring.rentang !== 'semua') {
      const n = sisaHari(d.deadline);
      if (n < 0 || n > Number(saring.rentang)) return false;
    }
    if (saring.q) {
      const hay = `${d.nama} ${d.penyelenggara}`.toLowerCase();
      if (!hay.includes(saring.q)) return false;
    }
    return true;
  };

  const terapkanSaring = () => {
    let tampil = 0;
    $$('.karcis-item').forEach((el) => {
      const ok = cocok(bacaKartu(el));
      el.hidden = !ok;
      if (ok) tampil += 1;
    });
    if (hasilHitung) hasilHitung.textContent = `${tampil} karcis di papan`;
    if (kosongEl) kosongEl.hidden = tampil !== 0;
  };

  const grupChip = (attr, kunci) => {
    $$(`[data-filter-${attr}]`).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$(`[data-filter-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        saring[kunci] = btn.dataset[`filter${attr[0].toUpperCase()}${attr.slice(1)}`] || 'semua';
        terapkanSaring();
      });
    });
  };
  grupChip('kat', 'kat');
  grupChip('profil', 'profil');
  grupChip('rentang', 'rentang');

  let debat = 0;
  $('#input-cari')?.addEventListener('input', (e) => {
    window.clearTimeout(debat);
    debat = window.setTimeout(() => {
      saring.q = e.target.value.trim().toLowerCase();
      terapkanSaring();
    }, 150);
  });

  $('#tombol-reset-saring')?.addEventListener('click', () => {
    saring.q = '';
    saring.kat = 'semua';
    saring.profil = 'semua';
    saring.rentang = 'semua';
    const input = $('#input-cari');
    if (input) input.value = '';
    ['kat', 'profil', 'rentang'].forEach((attr) => {
      $$(`[data-filter-${attr}]`).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset[`filter${attr[0].toUpperCase()}${attr.slice(1)}`] === 'semua'));
      });
    });
    terapkanSaring();
  });

  terapkanSaring();
  terapkanFavoritUI();

  /* ---------- Ekspor & lapor ---------- */
  const pesanAksi = (teks) => {
    const el = $('#pesan-aksi');
    if (el) el.textContent = teks;
  };
  const akanDatangData = semuaData.filter((d) => sisaHari(d.deadline) >= 0);

  $('#tombol-ics')?.addEventListener('click', () => {
    unduh('deadline-radar.ics', icsUntuk(akanDatangData), 'text/calendar');
    pesanAksi(`${akanDatangData.length} deadline masuk ke berkas ICS.`);
  });
  $('#tombol-csv')?.addEventListener('click', () => {
    unduh('deadline-radar.csv', csvUntuk(akanDatangData), 'text/csv');
    pesanAksi(`${akanDatangData.length} baris masuk ke berkas CSV.`);
  });
  $('#tombol-salin-tautan')?.addEventListener('click', async () => {
    const ok = await salinTeks(window.location.href);
    pesanAksi(ok ? 'Tautan halaman tersalin, Mas.' : 'Gagal menyalin — salin manual dari bilah alamat.');
  });
  $('#tombol-lapor')?.addEventListener('click', async () => {
    const format =
      'LAPOR DEADLINE BARU\n' +
      'Nama: \n' +
      'Penyelenggara: \n' +
      'Jenis (lomba/hackathon/beasiswa): \n' +
      'Batas akhir (YYYY-MM-DD): \n' +
      'Untuk (pelajar/mahasiswa/umum): \n' +
      'Biaya: \n' +
      'Tautan resmi: ';
    const ok = await salinTeks(format);
    pesanAksi(
      ok
        ? 'Format laporan tersalin. Isi, lalu kirim ke kanal komunitasmu — biar Pak Raden tempel di papan.'
        : 'Gagal menyalin format laporan.'
    );
  });

  /* ---------- Gerak: toggle + mode ringan ---------- */
  const tombolGerak = $('#tombol-gerak');
  const tombolGerakTeks = $('#tombol-gerak-teks');
  const sukaKurangi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const perangkatKecil =
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4 ||
    Boolean(navigator.connection && navigator.connection.saveData);

  let gerakNyala = true;
  try {
    const simpan = localStorage.getItem(GERAK_KEY);
    gerakNyala = simpan === null ? !sukaKurangi : simpan === 'nyala';
  } catch {
    gerakNyala = !sukaKurangi;
  }

  let hancurkan = [];
  const pasangGerak = () => {
    hancurkan.forEach((fn) => {
      try {
        fn();
      } catch {
        /* abaikan */
      }
    });
    hancurkan = [];
    document.body.classList.toggle('gerak-mati', !gerakNyala);
    document.body.classList.toggle('mode-ringan', gerakNyala && perangkatKecil && !sukaKurangi);
    if (!gerakNyala) return;
    const ringan = perangkatKecil || sukaKurangi;
    // A & D mati di mode ringan; marquee/teks/reveal tetap jalan versi hemat.
    if (!ringan) hancurkan.push(initCamera());
    hancurkan.push(initMarquee());
    hancurkan.push(initText());
    if (!ringan) hancurkan.push(initInput());
    hancurkan.push(initReveal());
  };

  const segarkanTombolGerak = () => {
    tombolGerak?.setAttribute('aria-pressed', String(gerakNyala));
    if (tombolGerakTeks) tombolGerakTeks.textContent = gerakNyala ? 'Gerak: nyala' : 'Gerak: mati';
  };
  tombolGerak?.addEventListener('click', () => {
    gerakNyala = !gerakNyala;
    try {
      localStorage.setItem(GERAK_KEY, gerakNyala ? 'nyala' : 'mati');
    } catch {
      /* abaikan */
    }
    segarkanTombolGerak();
    pasangGerak();
  });
  segarkanTombolGerak();
  pasangGerak();

  /* ---------- Easter egg: ketuk RADAR 5x ---------- */
  const kataRadar = $('#kata-radar');
  const hujan = $('#hujan');
  let ketuk = 0;
  let pewaktuKetuk = 0;
  kataRadar?.addEventListener('click', () => {
    ketuk += 1;
    window.clearTimeout(pewaktuKetuk);
    pewaktuKetuk = window.setTimeout(() => {
      ketuk = 0;
    }, 2500);
    if (ketuk >= 5 && hujan) {
      ketuk = 0;
      for (let i = 0; i < 24; i += 1) {
        const s = document.createElement('span');
        s.className = 'stiker';
        s.textContent = 'AYO DAFTAR';
        s.style.left = `${Math.random() * 92}vw`;
        s.style.transform = `rotate(${Math.random() * 24 - 12}deg)`;
        hujan.appendChild(s);
        const jatuh = s.animate(
          [
            { transform: `${s.style.transform} translateY(-10vh)`, opacity: 1 },
            { transform: `${s.style.transform} translateY(115vh)`, opacity: 1 },
          ],
          { duration: 2200 + Math.random() * 1600, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 500 }
        );
        jatuh.onfinish = () => s.remove();
      }
    }
  });

  /* ---------- Deep-link saat muat ---------- */
  dariHash();
}
