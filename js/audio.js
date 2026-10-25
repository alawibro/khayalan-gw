/**
 * audio.js
 * Pengelola audio: jingle menu (BGM) dan efek suara (SFX).
 *
 * Browser seluler memblokir audio sampai ada gestur pengguna. Karena itu:
 *  - unlock() dipanggil dari klik tombol "Masuki kuil";
 *  - setiap elemen SFX ikut dibuka kuncinya dengan trik play lalu pause,
 *    dalam satu gestur yang sama, sambil dibisukan agar tidak ada bunyi.
 *  - Status suara disimpan di localStorage (dengan try/catch).
 */
(() => {
  const STORAGE_KEY = 'mahiru-kuil:senyap';

  /**
   * Konfigurasi efek suara. Untuk SFX baru, tambahkan entri di sini,
   * lalu panggil playSfx('nama') dari modul lain.
   */
  const SFX = {
    nav: { src: 'assets/navigation.wav', poolSize: 3, volume: 0.6 },
    close: { src: 'assets/close-menu.mp3', poolSize: 2, volume: 0.6 },
  };

  /**
   * @param {HTMLAudioElement} bgmEl elemen jingle menu (#bgm)
   */
  function createAudio(bgmEl) {
    const listeners = new Set();
    const pools = {};
    let unlocked = false;
    let muted = readMuted();

    bgmEl.volume = 0.35;
    bgmEl.muted = muted;

    // Pool kecil per SFX: bunyi tidak terpotong saat tombol ditekan berulang cepat.
    for (const [name, cfg] of Object.entries(SFX)) {
      const items = Array.from({ length: cfg.poolSize }, () => {
        const audio = new Audio(cfg.src);
        audio.preload = 'auto';
        audio.volume = cfg.volume;
        return audio;
      });
      pools[name] = { items, next: 0 };
    }

    // Status untuk pelanggan (tombol suara, tombol Putar). Dikirim tiap ada perubahan.
    const snapshot = () => ({ muted, unlocked, bgmPlaying: !bgmEl.paused });
    const emit = () => listeners.forEach((fn) => fn(snapshot()));
    ['play', 'pause', 'ended'].forEach((event) => bgmEl.addEventListener(event, emit));

    /** Membuka kunci semua audio. Hanya bekerja jika dipanggil dari gestur pengguna. */
    function unlock() {
      if (unlocked) return;
      unlocked = true;

      for (const { items } of Object.values(pools)) {
        for (const audio of items) {
          audio.muted = true;
          Promise.resolve(audio.play())
            .catch(() => {})
            .finally(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
            });
        }
      }

      playBgm();
      emit();
    }

    function playBgm() {
      if (!unlocked || muted) return;
      bgmEl.play().catch(() => {});
    }

    /** Tombol Putar/Jeda di menu Musik. */
    function toggleBgm() {
      if (!bgmEl.paused) {
        bgmEl.pause();
        return;
      }
      if (muted) setMuted(false);
      playBgm();
    }

    function playSfx(name) {
      const pool = pools[name];
      if (!pool || !unlocked || muted) return;

      const audio = pool.items[pool.next];
      pool.next = (pool.next + 1) % pool.items.length;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    /** Tombol "Dengar" di menu Musik. Menyalakan suara bila sedang senyap. */
    function previewSfx(name) {
      if (muted) setMuted(false);
      playSfx(name);
    }

    function setMuted(value) {
      muted = value;
      bgmEl.muted = value;
      if (value) bgmEl.pause();
      saveMuted(value);
      emit();
    }

    function toggleMuted() {
      setMuted(!muted);
    }

    /**
     * Berlangganan perubahan status.
     * Fungsi langsung dipanggil sekali dengan status saat ini.
     * @returns {() => void} fungsi untuk berhenti berlangganan
     */
    function subscribe(fn) {
      listeners.add(fn);
      fn(snapshot());
      return () => listeners.delete(fn);
    }

    return { unlock, toggleBgm, playSfx, previewSfx, toggleMuted, subscribe };
  }

  function readMuted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false; // penyimpanan diblokir (mode privat, dll.)
    }
  }

  function saveMuted(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* penyimpanan diblokir: status tetap berlaku untuk sesi ini */
    }
  }

  window.Shrine.createAudio = createAudio;
})();
