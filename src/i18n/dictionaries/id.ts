import type { Dictionary } from "@/i18n/dictionaries/en";

/** Indonesian UI copy. The type keeps every key in step with English. */
export const id: Dictionary = {
  meta: {
    description:
      "Potret kepingan LEGO-mu, dapatkan inventori otomatis dan ide rakitan dari kepingan yang kamu punya.",
    designSystem: "Sistem desain",
  },
  language: {
    label: "Bahasa",
    names: { en: "English", id: "Bahasa Indonesia" },
  },
  app: {
    home: "Beranda Legoin",
    history: "Riwayat",
    steps: {
      label: "Progres pindai",
      photo: "Foto",
      pieces: "Kepingan",
      ideas: "Ide",
    },
  },
  scan: {
    title: "Potret kepinganmu",
    lead: "Letakkan semua kepingan di meja polos, saling berjauhan, lalu ambil satu foto dari atas.",
    guide: {
      title: "Tips foto",
      do: "Lakukan",
      dont: "Hindari",
      plain: {
        title: "Latar polos",
        body: "Meja polos atau selembar kertas, tanpa motif.",
      },
      above: {
        title: "Foto dari atas",
        body: "Pegang ponsel mendatar di atas kepingan.",
      },
      light: {
        title: "Cahaya cukup",
        body: "Cahaya siang atau lampu terang, tanpa bayangan tajam.",
      },
      apart: {
        title: "Bertumpuk atau bersentuhan",
        body: "Sebar kepingan agar tidak ada yang menumpuk atau bersentuhan.",
      },
    },
    capture: {
      title: "Fotomu",
      drop: "Letakkan foto di sini",
      or: "atau",
      take: "Ambil foto",
      choose: "Pilih foto",
      sample: "Coba foto contoh",
      hint: "JPEG atau PNG, maksimal 10 MB.",
      previewAlt: "Foto kepinganmu",
      sampleAlt:
        "Foto contoh: delapan kepingan di meja abu-abu, termasuk plate 2×4 hitam, round kuning, brick 1×2 oranye, dan brick 2×3 biru.",
      retake: "Ulangi",
      submit: "Pindai kepingan",
      scanning: "Memindai…",
    },
    errors: {
      type: "Berkas itu bukan gambar. Pilih foto JPEG atau PNG.",
      size: "Foto itu lebih dari 10 MB. Pilih yang lebih kecil.",
      read: "Kami tidak bisa membuka foto itu. Coba foto lain.",
      generic: "Ada yang salah. Coba lagi.",
    },
    progress: {
      title: "Memindai kepinganmu",
      photoAlt: "Foto yang sedang dipindai",
      stages: {
        detecting: "Mencari kepingan",
        classifying: "Mengenali jenis part",
        coloring: "Membaca warna",
      },
      status: { done: "selesai", current: "berjalan", waiting: "menunggu" },
      elapsed: "Waktu",
      slow: "Ini lebih lama dari biasanya. Tunggu sebentar lagi.",
      cancel: "Batal",
    },
    failures: {
      no_pieces: {
        title: "Kami tidak menemukan kepingan",
        body: "Sebar kepinganmu di latar polos, lalu foto ulang.",
      },
      too_dark: {
        title: "Fotomu terlalu gelap",
        body: "Pindah ke cahaya siang atau nyalakan lampu terang, lalu foto ulang.",
      },
      too_blurry: {
        title: "Fotomu buram",
        body: "Pegang ponsel diam di atas kepingan dan tunggu fokus sebelum memotret.",
      },
      network: {
        title: "Kami tidak bisa terhubung ke Legoin",
        body: "Periksa koneksimu lalu coba lagi. Fotomu masih tersimpan di sini.",
      },
      retake: "Foto ulang",
      retry: "Coba lagi",
      tips: "Lihat tips foto",
    },
  },
  results: {
    title: "Kepinganmu",
    loading: "Memuat hasil pindai…",
    photoAlt: "Fotomu dengan kotak di setiap kepingan yang ditemukan",
    missing: {
      title: "Kami tidak menemukan hasil pindai itu",
      body: "Mungkin sudah dihapus dari peramban ini.",
      action: "Mulai pindai baru",
    },
  },
  history: {
    title: "Riwayat pindai",
    lead: "Pindaian sebelumnya dan ide rakitannya akan muncul di sini.",
  },
  common: {
    inProgress: "Sedang dibangun",
    step: "Langkah",
    partsUsed: "Part dipakai",
    partsMissing: "Part kurang",
    inventory: "Inventori",
    inventoryDetailed: "Inventori (detail)",
    missingCount: (count: number) => `Kurang ${count} part`,
    pieces: (count: number) => `${count} kepingan`,
    ideaOf: (index: number, total: number) => `IDE ${index}/${total}`,
  },
  sample: {
    title: "Contoh hasil pindai",
    photoAlt:
      "Enam kepingan di meja putih: brick 2×4 merah, brick 2×2 kuning, brick 1×4 putih, plate 1×2 biru, slope 2×2 hijau, dan brick 2×2 hitam.",
    idea: {
      title: "Mobil balap kecil",
      difficulty: "Mudah",
      summary: "Badan merah, kap hijau, lampu kuning.",
      steps: [
        "Pasang brick 2×4 merah di atas plate 2×4 hitam sebagai badan.",
        "Taruh slope 2×2 hijau di depan sebagai kap mesin.",
        "Tambahkan brick 2×2 hitam di belakang dan dua round 1×1 kuning sebagai lampu.",
      ],
    },
    seeSteps: "Lihat langkah",
  },
  home: {
    eyebrow: "Pindai · Hitung · Rakit",
    title: {
      before: "Rakit dari ",
      sticker: "kepingan",
      after: " yang kamu punya.",
    },
    lead: "Potret semua kepingan LEGO-mu dalam satu foto. Legoin mengenali jenis dan warnanya, lalu memberi tiga ide rakitan lengkap dengan part yang kurang.",
    ctaScan: "Mulai pindai",
    ctaDesign: "Lihat sistem desain",
    facts: {
      parts: "13 jenis part",
      colors: "10 warna",
      ideas: "3 ide per foto",
    },
    tape: [
      "Legoin",
      "Potret kepinganmu",
      "Hitung otomatis",
      "Tiga ide rakitan",
    ],
  },
  design: {
    title: { before: "Sistem ", sticker: "desain" },
    intro:
      "Gaya ballers-addict dengan warna LEGO: kertas, garis tinta, bayangan keras, dan stiker. Merah untuk aksi, kuning untuk sorotan, warna kepingan hanya untuk kepingan.",
    colors: {
      title: "Warna",
      description:
        "Skala dibangun di sekitar warna LEGO asli (nilai Rebrickable), di atas kertas hangat dari ballers-addict. Komponen hanya memakai peran, bukan skala.",
      scaleNote: (name: string, step: number) => `${name} di ${step}`,
      roles: "Peran",
      roleNotes: {
        primary: "Aksi utama. Satu per layar.",
        highlight: "Stiker, sorotan, langkah. Teks selalu tinta.",
        page: "Kertas dari ballers-addict.",
        card: "Panel dan kartu.",
        ink: "Tinta: teks, garis, bayangan keras.",
        inkSecondary: "Teks pendukung.",
        warning: "Part kurang.",
        success: "Tersedia.",
        overlay: "Kotak deteksi di atas foto.",
      },
      bricks: "Warna kepingan",
      bricksNote: "data, bukan UI. Selalu dengan nama warnanya.",
    },
    type: {
      title: "Huruf",
      description:
        "Dela Gothic One untuk judul (satu ketebalan, jangan ditebalkan). DM Sans untuk teks. JetBrains Mono untuk jumlah, nomor part, dan skor.",
      display: "Rakit dari yang kamu punya.",
      pageTitle: "Judul halaman · Dela Gothic One",
      cardTitle: "Judul kartu · Dela Gothic One",
      body: "Teks isi DM Sans 16. Potret semua kepingan dari atas di latar polos, jangan ditumpuk. Legoin menghitung jenis dan warnanya, lalu menyarankan tiga ide rakitan.",
      small: "Teks kecil DM Sans 14 untuk keterangan.",
      monoLabel: "Label mono · Inventori",
    },
    logo: {
      title: "Logo",
      description:
        "Brick 2×2 kuning di dalam bingkai pemindai, dengan wordmark Dela Gothic One. Logo tidak memakai merah, jadi tidak pernah merah dengan kuning.",
    },
    buttons: {
      title: "Tombol",
      description:
        "Tombol berisi punya bayangan tinta keras dan tertekan saat diklik; semua miring sedikit saat disorot. Satu tombol merah per layar. Aksi berbahaya memakai garis merah dan konfirmasi.",
      scan: "Pindai kepingan",
      upload: "Unggah foto",
      theme: "Pilih tema",
      skip: "Lewati",
      remove: "Hapus scan",
      processing: "Memproses…",
      link: "Tautan sebagai tombol",
    },
    status: {
      title: "Status",
      description:
        "Status selalu titik dan label bertinta, tidak pernah warna saja.",
      available: "Tersedia",
      failed: "Gagal mendeteksi",
      draft: "Draf",
    },
    stickers: {
      title: "Stiker, grain, dan pita",
      description:
        "Stiker menyorot satu kata. Grain hanya di area pemasaran, tidak pernah di atas foto atau inventori. Pita berjalan pelan dan berhenti saat gerak dikurangi.",
      yellow: "Kuning",
      red: "Merah",
      paper: "Kertas",
      grain: "Grain di atas warna",
      tape: ["Legoin", "Potret", "Hitung", "Rakit"],
    },
    pieces: {
      title: "Kepingan",
      description: "13 part MVP digambar dari atas dengan garis tinta.",
    },
    detection: {
      title: "Deteksi",
      description:
        "Kotak bertinta dengan halo putih, terbaca di atas kepingan warna apa pun. Kotak terpilih lebih tebal dan menampilkan skor. Foto contoh dibuat dengan Codex image generation.",
    },
    correction: {
      title: "Koreksi label",
      description:
        "Pengguna bisa memperbaiki jenis dan warna sebelum meminta rekomendasi.",
      part: "Jenis part",
      color: "Warna",
    },
    example: {
      title: "Contoh: kartu rekomendasi",
      description:
        "Satu ide rakitan dari AI agent untuk inventori contoh: part dipakai, part kurang, dan langkah singkat.",
      save: "Simpan ide",
      another: "Ide lain",
    },
  },
};
