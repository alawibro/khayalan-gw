/**
 * env.js
 * Membuat namespace global `Shrine` dan kueri preferensi perangkat.
 *
 * Proyek memakai script klasik, bukan modul ES, supaya bisa dibuka
 * langsung dari index.html (double-click) maupun dari GitHub Pages.
 * Setiap berkas menambahkan diri ke `window.Shrine`.
 */
window.Shrine = window.Shrine || {};

Shrine.env = {
  /** true bila pengguna meminta gerak minimal (pengaturan sistem). */
  reduceMotionQuery: window.matchMedia('(prefers-reduced-motion: reduce)'),

  /** true di layar desktop (lebar minimal 900px). Harus sama dengan CSS. */
  desktopQuery: window.matchMedia('(min-width: 900px)'),
};
