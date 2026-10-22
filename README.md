# DeadlineRadar — Radar Deadline Lomba, Beasiswa & Hackathon

Papan warteg radar: satu sumbu waktu tegak tempat setiap deadline adalah karcis,
tersusun dari paling mendesak ke paling jauh. Dibuka langsung dengan karcis paling
mendesak setinggi layar — tanpa hero, tanpa navbar, tanpa basa-basi.

Dijaga Pak Raden, juru kunci radar. "Mas, tinggal 2 hari. Jangan sampai nangis di
grup angkatan."

## Fitur

- **19 deadline nyata** (riset 22 Okt 2026): lomba, hackathon, beasiswa — nama,
  penyelenggara, deadline, hitung mundur hari tersisa (live), biaya, profil, kategori,
  tautan resmi. Item "belum terverifikasi" diberi label; biaya kosong → "cek situs resmi".
- **Saring + cari**: kategori (lomba/hackathon/beasiswa), profil (pelajar/mahasiswa/umum),
  rentang (≤7 / ≤30 hari / semua), pencarian nama/penyelenggara. Penghitung hasil via
  `aria-live="polite"`.
- **Karcis favorit**: simpan ke `localStorage` (key `deadline-radar/v1`, try/catch +
  fallback + pesan galat ala Pak Raden). Banner "mendesak ≤3 hari" muncul otomatis
  untuk favorit yang hampir tutup.
- **Deep-link**: `#d=<id>` membuka lembar detil langsung; bisa dibagikan.
- **Ekspor**: ICS (satu/​semua), CSV (semua), salin tautan — dengan fallback clipboard.
- **Lembar detil** (side sheet): semua info + tautan resmi (`rel="noopener noreferrer"`) +
  sumber data.
- **Lapor deadline**: tombol salin format laporan (diisi manual, tanpa data karangan).
- **Easter egg**: ketuk tulisan RADAR 5× → hujan stiker "AYO DAFTAR".
- **Gerak** (GSAP ScrollTrigger, modul `init`/`destroy` terpisah):
  A. pinned horizontal pan 3 panel (H-7/H-30/semua) + zoom 1,6× per panel + tombol
     prev/next + keyboard ←/→;
  B. 2 band marquee berlawanan + skew velocity + tombol jeda;
  C. kata judul jatuh menumpuk;
  D. drag inertia flick strip karcis (`touch-action: pan-y`);
  E. garis sumbu draw-on (scrub).
  Hormat `prefers-reduced-motion`, toggle UI "Gerak: nyala/mati", MODE RINGAN otomatis
  (perangkat kecil → A jadi stack vertikal, D mati).

## Teknologi

Astro 7 (statis) · GSAP 3 + ScrollTrigger (npm, di-bundle) · astro-icon (Bootstrap Icons
`bi:*` + 3 SVG pixel-art custom: `radar-sweep`, `ticket-perforated`, `stamp-tutup`) ·
Astro Fonts API (Noto Serif Grantha / Hind Madurai 400+600 / Hachi Maru Pop, self-host) ·
CSS token oklch + grain SVG `feTurbulence` · tanpa framework CSS di halaman utama.

## Cara jalanin

```bash
npm install
npm run dev      # http://localhost:4321/agent-tools-deadline-radar-v2/
npm run build    # → dist/ (statis)
npm run check    # astro check + eslint + prettier
```

Deploy: `dist/` diserve di subpath `/agent-tools-deadline-radar-v2/`
(base dikonfigurasi di `src/config.yaml` → `site.base`).

## Struktur

```
src/
  pages/index.astro          # satu halaman (server-render 19 karcis)
  pages/404.astro            # 404 ala Pak Raden
  layouts/RadarLayout.astro  # layout minimal + Font API
  assets/styles/radar.css    # seluruh desain (token, karcis, sumbu, gerak)
  assets/icons/              # 3 SVG pixel-art custom
  data/deadlines.json        # 19 deadline + id/cat/profils normalisasi
  scripts/app.js             # logika aplikasi
  scripts/motion/{camera,marquee,text,input,reveal}.js
```

## Skor

- Lighthouse: Performance [ISI MANUAL] · Accessibility [ISI MANUAL] ·
  Best Practices [ISI MANUAL] · SEO [ISI MANUAL]
- `npm run build`: sukses · `npm run check`: 0 error, 0 warning
- Screenshot mobile 390px: menunggu QA (lihat `~/agent-lab/proof/`)

## Kredit

- Ikon: Bootstrap Icons (MIT) via astro-icon; 3 ikon pixel-art digambar sendiri.
- Font: Noto Serif Grantha, Hind Madurai, Hachi Maru Pop (OFL) via Fontsource.
- Data deadline: riset 2026-10-22 (`~/workspace/deadline-radar-research/deadlines.json`),
  agregator + situs resmi tercantum per item di lembar detil.
