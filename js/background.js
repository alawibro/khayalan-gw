/**
 * background.js
 * Mengatur video latar: autoplay muted, loop, dan berhenti bila tidak perlu.
 *
 * Aturan:
 *  - Video selalu muted, karena browser hanya mengizinkan autoplay tanpa suara.
 *  - Berhenti saat tab disembunyikan (hemat baterai).
 *  - Berhenti bila pengguna meminta gerak minimal atau mode hemat data aktif.
 *  - Bila autoplay ditolak, latar gelap tetap tampil dan tidak ada error.
 */
(() => {
  /**
   * @param {HTMLVideoElement} video
   * @returns {{ resume: () => void }} resume() dipanggil dari gestur pengguna.
   */
  function initBackgroundVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const { reduceMotionQuery } = Shrine.env;
    const saveData = navigator.connection?.saveData === true;
    const shouldPlay = () => !reduceMotionQuery.matches && !saveData && !document.hidden;

    const sync = () => {
      if (shouldPlay()) {
        // Di seluler, play() mungkin ditolak sebelum ada sentuhan. Itu tidak masalah.
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    document.addEventListener('visibilitychange', sync);
    reduceMotionQuery.addEventListener('change', sync);
    sync();

    return {
      // Dipanggil dari tombol "Masuki kuil", sehingga play() pasti diizinkan.
      resume: sync,
    };
  }

  window.Shrine.initBackgroundVideo = initBackgroundVideo;
})();
