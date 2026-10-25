/**
 * router.js
 * Navigasi berbasis hash (#profil, #galeri, ...).
 *
 * Dengan hash, tombol Kembali browser dan tautan langsung bekerja,
 * dan semuanya berjalan di GitHub Pages maupun dari berkas lokal.
 */
(() => {
  /**
   * @param {object} opts
   * @param {HTMLAnchorElement[]} opts.links      tautan menu (dari render.js)
   * @param {HTMLElement[]} opts.screens          layar, urutan sama dengan menu
   * @param {HTMLElement} opts.screensEl          kontainer layar
   * @param {HTMLElement} opts.navEl              elemen <nav> menu
   * @param {{ playSfx: (name: string) => void }} opts.audio
   */
  function initRouter({ links, screens, screensEl, navEl, audio }) {
    const { desktopQuery } = Shrine.env;
    const ids = screens.map((screen) => screen.id);
    let current = null;

    const idFromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      return ids.includes(id) ? id : ids[0];
    };

    const activeLink = () => links.find((link) => link.dataset.target === current) ?? links[0];

    /** Menampilkan satu layar dan menandai menu yang aktif. */
    function show(id) {
      if (id === current) return;
      const isChange = current !== null; // pemanggilan pertama tidak memainkan suara
      current = id;

      for (const screen of screens) {
        screen.hidden = screen.id !== id;
      }

      for (const link of links) {
        if (link.dataset.target === id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }

      if (isChange) {
        // Mulai dari atas konten. Di seluler hanya bergeser bila konten sudah lewat.
        if (desktopQuery.matches) {
          screensEl.scrollTop = 0;
        } else if (screensEl.getBoundingClientRect().top < 0) {
          screensEl.scrollIntoView({ block: 'start' });
        }
        audio.playSfx('nav');
      }
    }

    window.addEventListener('hashchange', () => show(idFromHash()));

    // Panah kiri/kanan berpindah antar menu saat fokus ada di menu.
    navEl.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const index = links.indexOf(document.activeElement);
      if (index === -1) return;

      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      links[(index + step + links.length) % links.length].focus();
      audio.playSfx('nav');
    });

    // Esc di dalam konten: kembali ke menu aktif, dengan suara tutup.
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!screensEl.contains(document.activeElement)) return;

      activeLink().focus();
      audio.playSfx('close');
    });

    show(idFromHash());
  }

  window.Shrine.initRouter = initRouter;
})();
