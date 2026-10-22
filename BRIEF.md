# BRIEF — DeadlineRadar — 2026-10-22

## Masalah/usecase (1 kalimat + siapa yang kena)
Pelajar dan mahasiswa Indonesia kehilangan peluang lomba/beasiswa/hackathon karena info deadline tersebar di feed yang cepat basi — mereka butuh satu radar yang teriak duluan mana yang paling mendesak.

## Konsep visual (1 kalimat)
Radar deadline berpenampilan papan warteg — satu sumbu waktu tegak tempat setiap deadline adalah karcis yang tersusun dari paling mendesak ke paling jauh, tanpa hero, tanpa navbar, tanpa basa-basi.

## Hasil seed (ringkas seed.json 2026-10-22)
- domain: warung tegal · layout: timeline satu sumbu · reference: sampul kaset · constraint: satu ukuran biasa + satu ukuran raksasa
- motion: camera "pan horizontal pinned + zoom per panel" / marquee "2 band berlawanan + skew velocity" / text "kata-kata jatuh lalu menumpuk" / input "drag inertia flick" / reveal "garis draw-on lalu isi"
- icons: pixel-art style + Bootstrap Icons · fonts: Noto Serif Grantha (display) / Hind Madurai (body) / Hachi Maru Pop (aksen) · palette: mid/complementary hue 34

## 3 arah desain (2 kalimat masing-masing) + arah terpilih dan alasannya
1. **Koran harian deadline**: koran multi-kolom dengan headline countdown. Kuat, tapi 2026-10-19 (warteg) sudah pakai koran multi-kolom — ketahuan satu keluarga.
2. **Terminal radar militer**: CRT hijau, teks ketik. Berani tapi meleset dari persona warteg dan rawan jadi AI-slop "hacker".
3. **Papan warteg radar (TERPILIH)**: papan kayu/papan tulis warteg dengan sumbu waktu tegak, karcis-karcis deadline menempel, warna kertas krem + tinta hitam + stempel merah. Paling jauh dari default (tidak ada satu pun dari 14 build terakhir pakai timeline sumbu tegak + persona warteg + sampul-kaset sebagai bingkai detil), paling nyambung ke domain seed dan kebutuhan fungsional (urutan waktu = urutan urgensi).

## Keputusan berani
Situs dibuka LANGSUNG dengan karcis deadline paling mendesak setinggi layar — tidak ada hero, tidak ada navbar, tidak ada headline sambutan. Orang paham "ini soal deadline mendesak" dalam 3 detik karena yang pertama terlihat adalah "TUTUP BESOK: Animal Welfare Poster Challenge".

## Persona/suara
Pak Raden, juru kunci radar di warteg — tegas, akrab, agak ngomel tapi peduli. Copy: "Mas, tinggal 2 hari. Jangan sampai nangis di grup angkatan." Pesan error: "Karcisnya sobek, Mas. Coba lagi."

## Palet (harmoni, kenapa, psikologi warna, token oklch final, hasil cek kontras AA)
Harmoni complementary hue 34 (oranye hangar/kaset) vs hue 214 (teal stempel). Psikologi: hangat-pedesaan warteg (aman, dekat) + stempel merah-teal (mendesak, resmi). Token final:
- --bg: oklch(0.72 0.075 58) — kertas krem warteg
- --surface: oklch(0.64 0.06 58)
- --text: oklch(0.18 0.03 58)
- --muted: oklch(0.38 0.04 58)
- --accent: oklch(0.55 0.17 32) — merah bata stempel (kontras vs bg ≈ 4.6:1 — dicek ulang di QA)
- --accent-2: oklch(0.55 0.12 214) — teal kaset
- --pop: oklch(0.62 0.19 150) — hijau lime stiker (dipakai <5%)
- grain feTurbulence overlay wajib (constraint kreatif bebas + seed ref kaset).

## Font (display/body/aksen, alasan, id Fontsource, variable atau bukan)
- Display: Noto Serif Grantha (id: noto-serif-grantha, static) — serif tegas rasa sampul kaset/kitab, untuk judul raksasa.
- Body: Hind Madurai (id: hind-madurai, static, 400/600) — humanis, terbaca 16px di 390px.
- Aksen: Hachi Maru Pop (id: hachi-maru-pop, static) — tulisan tangan kaset untuk stempel/coreta n.
Semua lewat @fontsource npm, self-host.

## Ikon (gaya, sumber, daftar 12+ ikon, 3+ custom)
Gaya: pixel-art + Bootstrap Icons. 12+: radar, karcis, lonceng, kalender, amplop/beasiswa, trofi/lomba, kode/hackathon, jam pasir, stempel "GRATIS", filter, panah, unduh, bagikan, ceklis. 3 custom hand-built SVG pixel-art: (1) radar sapu berputar, (2) karcis warteg berlubang, (3) stempel "TUTUP X HARI".

## Gerak (kategori A-F yang dipakai, narasi yang menyatukan, MODE RINGAN apa yang dimatikan)
Narasi: "Pemindaian radar → karcis jatuh menumpuk di sumbu waktu." A: pinned horizontal pan + zoom per panel (3 panel: H-7 / H-30 / semua, zoom 1.6× per panel). B: 2 band marquee berlawanan + skew velocity (ticker nama lomba). C: kata judul jatuh lalu menumpuk (GSAP gravity-ish). D: drag inertia flick di strip karcis. E: garis sumbu waktu draw-on lalu isi. F: tidak dipakai. Mode ringan: matikan A (pan→stack vertikal statis), matikan D.

## Storyboard hero moment (tabel scroll 0/25/50/75/100%)
| Scroll | Yang terlihat | Kamera (zoom/pan) | Marquee | Teks | Interaksi |
|---|---|---|---|---|---|
| 0% | Karcis raksasa "TUTUP 1 HARI" setinggi layar | — | band atas ticker deadline | kata judul jatuh menumpuk | — |
| 25% | Pemindaian radar: 3 panel H-7 / H-30 / semua | pinned pan horizontal, zoom 1.6× per panel | band bawah berlawanan | — | drag flick strip karcis |
| 50% | Sumbu waktu tegak, garis draw-on | — | — | — | filter kategori + profil |
| 75% | Karcis-karcis menempel di sumbu, countdown hidup | — | — | — | klik karcis → detil (side sheet) |
| 100% | Footer "lapor deadline" + ekspor ICS/CSV + easter egg | — | band statis | — | ekspor, bagikan deep-link |

Pertunjukan utama di 0–25%: karcis paling mendesak langsung teriak. 5 detik pertama: pengunjung melihat deadline terdekat + berapa hari tersisa, tanpa scroll.

## Konten (15+ item nyata, easter egg)
19 deadline nyata dari riset 2026-10-22 (~/workspace/deadline-radar-research/deadlines.json): Animal Welfare Poster Challenge (23 Okt), KIFS 2026 (25 Okt), Beasiswa UIN Jambi WNA (27 Okt), RUANG Poster Blitar (28 Okt), GovTechAthon (28 Okt), RISE 2026 videografi (29 Okt), NEXORA esai+poster, Writing Festival, PHINISI XII, BSI Scholarship Talenta, Lautan Luas Pintar (30 Okt), BBF "Alam dalam Lensa", Video 60 Detik Budaya Kemenbud (31 Okt), Beasiswa Anak Indonesia Maju (1 Nov), UNS Innovation Hackathon (7 Nov), NESTA esai (14 Nov), IYEEA esai (15 Nov). Setiap karcis: nama, penyelenggara, deadline, hitung mundur, biaya, profil, kategori, link resmi. Easter egg: ketuk judul "RADAR" 5× → hujan stiker pixel "AYO DAFTAR".

## Teknik visual orisinal (2+)
1. Grain kaset via SVG feTurbulence overlay di seluruh halaman.
2. Karcis warteg berlubang (perforasi via radial-gradient mask) + stempel merah miring 6°.
3. Sumbu waktu = garis "pita kaset" dengan gigi-gigi sprocket.

## Suara
Tidak. Bonus ditolak — deadline butuh fokus, bukan bunyi.
