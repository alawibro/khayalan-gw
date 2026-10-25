/**
 * content.js
 * Satu-satunya berkas yang perlu diedit untuk mengubah isi situs.
 * HTML, CSS, dan logika tidak perlu disentuh.
 *
 * - `sections` adalah daftar menu. Urutan array = urutan menu.
 * - `id` dipakai sebagai alamat (#profil). Gunakan huruf kecil tanpa spasi.
 * - `type` menentukan cara layar dibangun:
 *     home | profile | gallery | music | contact
 */
window.Shrine = window.Shrine || {};

Shrine.site = {
  name: 'Mahiru Shiina',

  portrait: {
    src: 'assets/profile-mahiru.jpg',
    alt: 'Foto profil Mahiru Shiina',
    role: 'My Is3',
  },

  sections: [
    {
      id: 'beranda',
      label: 'Beranda',
      type: 'home',
      title: 'Selamat datang',
      intro: 'Selamat datang di Khayalan Gw. Ini My Kisah Gw.',
      // id bagian yang muncul sebagai pintasan di beranda
      shortcuts: ['profil', 'galeri', 'musik', 'kontak'],
    },

    {
      id: 'profil',
      label: 'Profil',
      type: 'profile',
      title: 'Profil',
      summary: 'Mahiru Shiina adalah gadis teladan berambut keemasan dari serial The Angel Next Door Spoils Me Rotten yang dikenal karena kecantikan, keanggunannya, serta keterampilannya dalam memasak dan merawat orang lain. Di balik kesempurnaannya di sekolah, ia memiliki sisi hangat dan menggemaskan yang hanya ditunjukkan kepada orang terdekatnya. Sosoknya yang tulus selalu berhasil membawa kenyamanan dan menjadi inspirasi utama di balik estetika halaman web ini.',
      facts: [
        { label: 'Nama', value: 'Mahiru Shiina' },
        { label: 'Peran', value: 'My Is3' },
        { label: 'Sumber', value: 'My Otak' },
      ],
    },

    {
      id: 'galeri',
      label: 'Galeri',
      type: 'gallery',
      title: 'Galeri',
      // type: 'image' | 'video'. Video diputar hanya saat terlihat di layar.
      // poster: gambar yang tampil sebelum video dimainkan (wajib untuk video).
      items: [
        { type: 'image', src: 'assets/profile-mahiru.jpg', caption: 'Portrait' },
        {
          type: 'video',
          src: 'assets/bg-video-1080p.mp4',
          poster: 'assets/poster-sakura-whisper.jpg',
          caption: 'Sakura Whisper',
        },
      ],
    },

    {
      id: 'musik',
      label: 'Musik',
      type: 'music',
      title: 'Musik',
      bgm: {
        title: 'Menu Utama',
        note: 'Jingle menu, diputar sekali saat kuil dibuka',
      },
      // key harus sama dengan nama di SFX pada js/audio.js ('nav' | 'close')
      sfx: [
        { key: 'nav', title: 'Navigasi', note: 'Saat berpindah menu' },
        { key: 'close', title: 'Tutup menu', note: 'Saat kembali dari layar ke menu' },
      ],
    },

    {
      id: 'kontak',
      label: 'Kontak',
      type: 'contact',
      title: 'Kontak',
      intro: 'Hubungi Gw Lewat Sosmed  di bawah ini.',
      links: [
        { label: 'Email', value: 'em.be.alawi@gmail.com', href: 'mailto:em.be.alawi@gmail.com' },
        { label: 'Instagram', value: 'Alawi123', href: 'https://instagram.com/alawi123' },
      ],
    },
  ],
};
