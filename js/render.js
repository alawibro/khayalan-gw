/**
 * render.js
 * Membangun potret, menu, dan setiap layar dari Shrine.site (content.js).
 *
 * Semua teks dimasukkan lewat textContent / append, bukan innerHTML,
 * jadi isi dari content.js tidak pernah dijalankan sebagai HTML.
 */
(() => {
  /**
   * Pembuat elemen kecil. Contoh: h('p', { class: 'lead' }, 'Teks').
   * Nilai false/null/undefined pada props dilewati.
   */
  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === false || value === null || value === undefined) continue;
      node.setAttribute(key, value === true ? '' : String(value));
    }
    node.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
    return node;
  }

  /* =========================================================================
     Entry point: dipanggil dari main.js
     ========================================================================= */

  /** Mengisi potret dan identitas di kolom kiri. */
  function renderPortrait(site) {
    const img = document.getElementById('portrait-img');
    img.src = site.portrait.src;
    img.alt = site.portrait.alt;
    document.getElementById('portrait-name').textContent = site.name;
    document.getElementById('portrait-role').textContent = site.portrait.role;
  }

  /**
   * Membuat menu dan semua layar.
   * @returns {{ links: HTMLAnchorElement[], screens: HTMLElement[], screensEl: HTMLElement }}
   */
  function renderApp({ site, audio }) {
    renderPortrait(site);

    const navList = document.getElementById('nav-list');
    const screensEl = document.getElementById('screens');

    const links = renderNav(site.sections, navList);
    const screens = renderScreens(site.sections, screensEl, { audio });

    return { links, screens, screensEl };
  }

  /* =========================================================================
     Menu
     ========================================================================= */

  function renderNav(sections, listEl) {
    return sections.map((section) => {
      const link = h('a', { class: 'nav__link', href: `#${section.id}` }, section.label);
      link.dataset.target = section.id;
      listEl.append(h('li', {}, link));
      return link;
    });
  }

  /* =========================================================================
     Layar
     ========================================================================= */

  /** Peta type -> fungsi pembuat isi layar. Tambah type baru di sini. */
  const RENDERERS = {
    home: renderHome,
    profile: renderProfile,
    gallery: renderGallery,
    music: renderMusic,
    contact: renderContact,
  };

  function renderScreens(sections, container, ctx) {
    return sections.map((section) => {
      const titleId = `${section.id}-title`;
      const build = RENDERERS[section.type] ?? renderMissing;

      const screen = h(
        'section',
        { id: section.id, class: 'screen', tabindex: -1, 'aria-labelledby': titleId, hidden: true },
        h('h2', { class: 'screen__title', id: titleId }, section.title),
        build(section, { ...ctx, sections }),
      );

      container.append(screen);
      return screen;
    });
  }

  function renderMissing() {
    return h('p', { class: 'lead' }, 'Konten belum tersedia.');
  }

  /* ----- Beranda ----- */
  function renderHome(section, { sections }) {
    const byId = new Map(sections.map((s) => [s.id, s]));

    const items = section.shortcuts
      .filter((id) => byId.has(id))
      .map((id) => h('li', {}, h('a', { class: 'shortcut', href: `#${id}` }, byId.get(id).label)));

    return [
      h('p', { class: 'lead' }, section.intro),
      h('ul', { class: 'shortcuts' }, items),
    ];
  }

  /* ----- Profil ----- */
  function renderProfile(section) {
    const facts = section.facts.flatMap(({ label, value }) => [
      h('dt', {}, label),
      h('dd', {}, value),
    ]);

    return [
      h('p', { class: 'lead' }, section.summary),
      h('dl', { class: 'facts' }, facts),
    ];
  }

  /* ----- Galeri ----- */
  function renderGallery(section) {
    const { reduceMotionQuery } = Shrine.env;
    const videos = [];

    const tiles = section.items.map((item) => {
      if (item.type !== 'video') {
        return h(
          'figure',
          { class: 'tile' },
          h('img', { src: item.src, alt: item.caption, loading: 'lazy', decoding: 'async' }),
          h('figcaption', {}, item.caption),
        );
      }

      const video = h('video', {
        src: item.src,
        poster: item.poster,
        loop: true,
        playsinline: true,
        preload: 'metadata',
        // Bisa difokuskan dan dioperasikan dengan keyboard seperti tombol.
        tabindex: 0,
        role: 'button',
        'aria-label': `${item.caption}: putar atau jeda`,
      });
      video.muted = true;

      // Ketuk atau tekan Enter/Spasi untuk memutar atau menjeda.
      const toggle = () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      };
      video.addEventListener('click', toggle);
      video.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
      videos.push(video);

      return h('figure', { class: 'tile' }, video, h('figcaption', {}, item.caption));
    });

    observeVideos(videos, reduceMotionQuery);
    return h('div', { class: 'gallery' }, tiles);
  }

  /**
   * Video galeri hanya diputar saat cukup terlihat di layar.
   * Di-pause saat keluar layar agar tidak membebani perangkat.
   */
  function observeVideos(videos, reduceMotionQuery) {
    if (videos.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting && !reduceMotionQuery.matches) {
            target.play().catch(() => {});
          } else {
            target.pause();
          }
        }
      },
      { threshold: 0.5 },
    );

    videos.forEach((video) => observer.observe(video));
  }

  /* ----- Musik ----- */
  function renderMusic(section, { audio }) {
    // Tombol Putar/Jeda: teksnya mengikuti status jingle.
    const bgmButton = h('button', { class: 'btn', type: 'button' }, 'Putar');
    bgmButton.addEventListener('click', () => audio.toggleBgm());
    audio.subscribe(({ bgmPlaying }) => {
      bgmButton.textContent = bgmPlaying ? 'Jeda' : 'Putar';
    });

    const sfxRows = section.sfx.map(({ key, title, note }) => {
      const button = h('button', { class: 'btn', type: 'button' }, 'Dengar');
      button.addEventListener('click', () => audio.previewSfx(key));
      return trackRow(title, note, button);
    });

    return h(
      'div',
      { class: 'music' },
      h('h3', {}, 'Jingle menu'),
      trackRow(section.bgm.title, section.bgm.note, bgmButton),
      h('h3', {}, 'Efek suara'),
      sfxRows,
    );
  }

  function trackRow(title, note, action) {
    return h(
      'div',
      { class: 'track' },
      h('div', {}, h('p', { class: 'track__title' }, title), h('p', { class: 'track__note' }, note)),
      action,
    );
  }

  /* ----- Kontak ----- */
  function renderContact(section) {
    const items = section.links.map(({ label, value, href }) => {
      const isExternal = href.startsWith('http');
      const extra = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

      return h(
        'li',
        {},
        h(
          'a',
          { class: 'contact__link', href, ...extra },
          h('span', { class: 'contact__label' }, label),
          h('span', { class: 'contact__value' }, value),
        ),
      );
    });

    return [
      h('p', { class: 'lead' }, section.intro),
      h('ul', { class: 'contact' }, items),
    ];
  }

  window.Shrine.renderApp = renderApp;
})();
