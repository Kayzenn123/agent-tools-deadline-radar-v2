# BUILD-NOTES — DeadlineRadar (j0800 2026-10-22)

## Yang dipangkas dan kenapa

1. **Halaman template AstroWind dihapus** (about, contact, pricing, services, privacy,
   terms, landing/, homes/, api/, rss.xml.ts, src/data/post/): MVP satu halaman sesuai
   BRIEF. Blog di-disable via `apps.blog.isEnabled: false` + link blog dihapus dari
   `navigation.ts`.
2. **OG image digambar sendiri** (SVG → sharp → 1200×630 PNG) menggantikan
   `default.png` bawaan AstroWind — tidak pakai screenshot karena browser tidak tersedia
   di sesi ini.
3. **Screenshot mobile 390px → didelegasikan ke QA parent**: subagent tidak punya
   kontrol browser; Playwright tidak diinstal (unavailable). Tercatat [ISI MANUAL].
4. **Skor Lighthouse → [ISI MANUAL]**: butuh browser; parent yang QA.
5. **Suara**: tidak dipakai (BRIEF menolak bonus suara).
6. **Kategori F (3D/shader)**: tidak dipakai (BRIEF).
7. **Dark mode**: tidak ada — konsep "kertas krem warteg" light-only; toggle yang ada
   adalah "Gerak: nyala/mati".
8. **Loading state jujur**: konten server-render (instan), jadi tidak ada skeleton
   teater. Empty state + error state (localStorage macet) ala Pak Raden tetap ada.
9. **Data `profil` kosong** (3 item: IKA SKMA, KIFS, GovTechAthon, UNS) → filter profil
   memperlakukan item tanpa profil sebagai "cocok semua" (sumber tidak mencantumkan).
   Bukan data karangan.

## Konflik aturan yang ditemui

1. **Base dengan trailing slash merusak build.** Instruksi awal: base
   `/agent-tools-deadline-radar/` (lalu koreksi `-v2`). Skill deploy-with-base-path
   mewajibkan base TANPA trailing slash. Terbukti: base `/…-v2/` (dengan slash) +
   `trailingSlash: 'never'` membuat Astro meng-emit `dist/index.html` sebagai stub
   redirect TANPA me-render konten (build "sukses" palsu, error ikon tidak ketahuan).
   Keputusan: `site.base: '/agent-tools-deadline-radar-v2'` (tanpa slash) di
   `src/config.yaml` — karena base di template ini dibaca vendor integration dari
   config.yaml, bukan astro.config.ts. Build lalu render benar (85 KB).
2. **`bi:emoji-frown` tidak ada di include list** → build gagal saat render beneran.
   Ditambahkan. (Error ini tadinya tersembunyi oleh masalah #1.)
3. **Jumlah font 3 vs "maks 2" (v2 FASE 5)**: ATURAN 0 v5 butir 1 memenangkan v4 —
   maks 3 family. BRIEF mewajibkan 3 (Grantha/Hind/Hachi). Dipakai 3.
4. **Animasi "hanya transform/opacity" (v2) vs v4**: ATURAN 0 v5 butir 2 — boleh
   clip-path & filter ringan. Tidak dipakai di sini kecuali mask perforasi (statis).
5. **GSAP via npm, bukan CDN**: ATURAN 9 (SRI/self-host) → install `gsap` sebagai
   dependency, di-bundle Vite. Tidak pakai Draggable/InertiaPlugin (klub/berbayar) —
   inertia drag ditulis manual (pointer events + rAF decay).
6. **Zoom 1,6× per panel vs "batasi amplitudo" (v5 ATURAN 5)**: zoom hanya pada
   `.panel-dalam` di dalam viewport ber-overflow hidden + pin; mati total saat
   reduced-motion / toggle mati / mode ringan. Kompromi tercatat.
7. **Blacklist v3**: tidak ada kata terlarang di copy ("Welcome to", "Unlock", dsb.
   tidak dipakai). Emoji tidak dipakai sebagai ikon.
8. **`getBlogPermalink` unused** di navigation.ts setelah hapus link blog → import
   dibersihkan agar `npm run check` lolos.
9. **Layout.astro lama** (template) masih mereferensikan `--font-inter` → error
   `astro check`; diperbaiki ke `--font-display` (file tidak dipakai halaman baru,
   tapi dibiarkan valid).
10. **Seed**: `seed.json` disalin dari `~/agent-lab/builds/2026-10-22/seed.json` ke
    workdir sesuai instruksi (seed 2026-10-26 — tanggal seed beda sehari dari build,
    dicatat apa adanya).

## Error yang gagal 2× → tidak ada yang dipangkas karena error

- Build #1: FontFamilyNotFound (`--font-inter` di halaman template lama) → diatasi
  dengan hapus halaman tak terpakai (1×).
- Build #2–#3: stub redirect + icon missing → diatasi via konflik #1 dan #2 di atas.
- `npm run check` final: **0 error, 0 warning** (2 hints: JSON-LD inline + execCommand
  fallback — disengaja).

## Untuk QA parent

- `npm run build` → `dist/` statis; serve `dist/` lalu buka
  `/agent-tools-deadline-radar-v2/`.
- Yang belum terverifikasi di sesi ini (butuh browser): tampilan visual 360/390/768/
  1280px, pinned pan + zoom, marquee skew, flick inertia, easter egg, skor Lighthouse,
  console bebas error, keyboard-only, reduced-motion.
- Deep-link uji: `#d=d2` (Animal Welfare Poster Challenge).
- Favorit uji: simpan d1 (Hari terakhir) → banner mendesak harus muncul.
