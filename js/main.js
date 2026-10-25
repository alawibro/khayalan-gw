/**
 * main.js
 * Titik masuk aplikasi. File ini hanya merangkai modul lain.
 *
 * Urutan:
 *  1. Buat pengelola audio dan video latar.
 *  2. Bangun menu dan layar dari Shrine.site (content.js).
 *  3. Pasang router, tombol suara, dan gerbang masuk.
 */
(() => {
  const $ = (selector) => document.querySelector(selector);

  /** Tombol suara di pojok kanan atas. */
  function initSoundToggle(audio) {
    const button = $('#sound-toggle');
    const state = button.querySelector('.sound__state');

    button.addEventListener('click', () => audio.toggleMuted());

    audio.subscribe(({ muted }) => {
      button.setAttribute('aria-pressed', String(!muted));
      state.textContent = muted ? 'Nonaktif' : 'Aktif';
    });
  }

  /**
   * Gerbang masuk. Browser seluler hanya mengizinkan audio dan video
   * setelah ada sentuhan, jadi klik "Masuki kuil" ikut membuka semuanya.
   */
  function initGate({ audio, background }) {
    const gate = $('#gate');
    const app = $('#app');
    const enter = $('#gate-enter');

    enter.addEventListener(
      'click',
      () => {
        audio.unlock();      // membuka kunci audio (gestur pengguna)
        background.resume(); // memastikan video latar mulai diputar
        gate.classList.add('is-leaving');
        app.inert = false;   // aplikasi bisa dipakai setelah gerbang terbuka
        setTimeout(() => {
          gate.hidden = true;
        }, 700); // sesuai durasi transisi di layout.css
      },
      { once: true },
    );

    enter.focus();
  }

  function boot() {
    const { createAudio, initBackgroundVideo, renderApp, initRouter, site } = window.Shrine;
    // Catatan: site, createAudio, dst. ditambahkan oleh berkas-berkas sebelumnya.

    const audio = createAudio($('#bgm'));
    const background = initBackgroundVideo($('#bg-video'));
    const { links, screens, screensEl } = renderApp({ site, audio });

    initRouter({ links, screens, screensEl, navEl: $('.nav'), audio });
    initSoundToggle(audio);
    initGate({ audio, background });
  }

  // Script ini dimuat di akhir <body>, jadi elemen sudah tersedia.
  boot();
})();
