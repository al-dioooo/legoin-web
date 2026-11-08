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
  footer: {
    team: {
      title: "Tim",
      body: "Dibuat oleh {team} untuk mata kuliah {course}, Sekolah Vokasi IPB University.",
    },
    dataset: {
      title: "Dataset",
      body: "Detektor kepingan Legoin belajar dari dataset ini:",
      license: "Berlisensi",
    },
    notes: {
      title: "Perlu diketahui",
      photos: "Foto contoh dibuat dengan AI, bukan hasil pindai sungguhan.",
      trademark:
        "LEGO® adalah merek dagang LEGO Group. Legoin adalah proyek mahasiswa dan tidak berafiliasi dengan maupun didukung oleh LEGO Group.",
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
    photoAltPlain: "Fotomu",
    missing: {
      title: "Kami tidak menemukan hasil pindai itu",
      body: "Mungkin sudah dihapus dari peramban ini.",
      action: "Mulai pindai baru",
    },
    toCheck: {
      one: "{count} kepingan perlu dicek",
      other: "{count} kepingan perlu dicek",
    },
    labels: { hide: "Sembunyikan label", show: "Tampilkan label" },
    zoom: { in: "Perbesar", out: "Perkecil" },
    piece: {
      title: "Kepingan terpilih",
      empty:
        "Pilih kepingan di foto atau di inventori untuk melihatnya di sini.",
      confidence: "Keyakinan",
      added: "Ditambahkan olehmu",
      check: "Perlu dicek",
      lowConfidence:
        "Kami belum yakin dengan kepingan ini. Cek jenis dan warnanya.",
    },
    edit: {
      title: "Perbaiki kepingan ini",
      part: "Jenis part",
      color: "Warna",
      save: "Simpan perubahan",
      remove: "Hapus kepingan",
      confirm: "Hapus kepingan ini dari inventori?",
      confirmRemove: "Hapus",
      keep: "Batal",
      edited: "Diubah",
    },
    add: {
      title: "Tambah kepingan yang terlewat",
      part: "Jenis part",
      color: "Warna",
      quantity: "Jumlah",
      submit: "Tambah ke inventori",
      invalid: "Masukkan angka 1 sampai 20.",
    },
    totals: {
      parts: { one: "{count} jenis part", other: "{count} jenis part" },
      colors: { one: "{count} warna", other: "{count} warna" },
    },
    undo: "Batalkan perubahan terakhir",
    status: {
      edited: "Kepingan diperbarui.",
      removed: "Kepingan dihapus.",
      added: {
        one: "{count} kepingan ditambahkan.",
        other: "{count} kepingan ditambahkan.",
      },
      undone: "Perubahan dibatalkan.",
      failed: "Kami tidak bisa menyimpannya. Coba lagi.",
    },
    continue: "Lihat ide rakitan",
    empty: {
      title: "Belum ada kepingan",
      body: "Tambahkan kepingan yang terlewat, atau foto ulang dengan kepingan disebar berjauhan.",
      retake: "Foto ulang",
      continueHint:
        "Tambahkan minimal satu kepingan untuk melihat ide rakitan.",
    },
  },
  ideas: {
    title: "Ide rakitan",
    picker: {
      title: "Mau merakit apa?",
      lead: "Pilih tema. Legoin menyarankan tiga rakitan dari kepinganmu.",
      legend: "Tema",
      themes: {
        vehicles: { label: "Kendaraan", hint: "Mobil, truk, dan perahu" },
        animals: { label: "Hewan", hint: "Bebek, kura-kura, dan penguin" },
        buildings: {
          label: "Bangunan",
          hint: "Rumah, mercusuar, dan jembatan",
        },
        surprise: { label: "Kejutan", hint: "Satu ide dari tiap tema" },
      },
      submit: "Lihat ide",
    },
    finding: "Mencari ide…",
    found: { one: "{count} ide siap.", other: "{count} ide siap." },
    difficulty: { easy: "Mudah", medium: "Sedang", hard: "Sulit" },
    uses: {
      one: "Memakai {count} kepinganmu",
      other: "Memakai {count} kepinganmu",
    },
    usesNone: "Belum memakai kepinganmu",
    complete: "Cukup dengan kepinganmu",
    seeSteps: "Lihat langkah",
    again: "Coba ide lain",
    none: "Belum ada ide untuk tema ini. Coba tema lain.",
    failed: {
      title: "Kami tidak bisa mengambil ide",
      body: "Periksa koneksimu, lalu coba lagi.",
      retry: "Coba lagi",
    },
    empty: {
      title: "Belum ada kepingan untuk dirakit",
      body: "Pindaian ini tidak punya kepingan lagi. Tambahkan kepingan yang kamu punya, lalu kembali untuk melihat ide.",
      action: "Kembali ke kepinganmu",
    },
  },
  ideaDetail: {
    title: "Langkah merakit",
    loading: "Memuat ide ini…",
    back: "Semua ide",
    steps: "Langkah",
    markDone: "Langkah {step} selesai",
    progress: "{done} dari {total} langkah selesai",
    allDone: "Semua langkah selesai. Rakitan yang keren!",
    summary: {
      title: "Yang masih kurang",
      needed: "Kepingan dibutuhkan",
      have: "Kamu punya",
      missing: "Kurang",
      // Indonesian has no plural forms; Intl.PluralRules always picks "other".
      some: {
        one: "Cari {count} kepingan lagi, atau ganti dengan yang mirip dari punyamu.",
        other:
          "Cari {count} kepingan lagi, atau ganti dengan yang mirip dari punyamu.",
      },
      none: "Kepinganmu sudah lengkap. Ayo mulai merakit!",
    },
    nav: "Ide lainnya",
    previous: "Ide sebelumnya",
    next: "Ide berikutnya",
    language: {
      note: "Ide ini ditulis dalam {language}. Ide tidak diterjemahkan, tapi kamu bisa minta ide baru dalam bahasa Indonesia.",
      names: { en: "bahasa Inggris", id: "bahasa Indonesia" },
      action: "Minta ide dalam bahasa Indonesia",
    },
    missing: {
      title: "Kami tidak menemukan ide itu",
      body: "Meminta ide baru menggantikan ide sebelumnya, jadi ide ini mungkin sudah tidak ada.",
      action: "Lihat idemu",
    },
    failed: {
      title: "Kami tidak bisa memuat ide ini",
      body: "Periksa koneksimu, lalu coba lagi.",
      retry: "Coba lagi",
    },
  },
  motion: {
    title: { before: "Gerak & ", sticker: "interaksi" },
    intro:
      "Legoin bekerja seperti buku petunjuk merakit di atas baseplate: layar tersusun langkah demi langkah, dan setiap kepingan terpasang pas. Satu gerak, dipakai di mana-mana.",
    back: "Sistem desain",
    reduce: "Pratinjau gerak dikurangi",
    replay: "Putar ulang",
    tokens: {
      title: "Token",
      description:
        "Waktu, kurva, dan jarak ada di tokens.css. Saat gerak dikurangi, semua jarak menjadi nol, jadi nilai di bawah ikut berubah saat kamu mempratinjaunya.",
      name: "Token",
      value: "Nilai",
    },
    clickIn: {
      title: "Klik-pasang",
      description:
        "Kepingan jatuh ke stud, sedikit gepeng saat mendarat, lalu diam. Layar tersusun dengannya, satu kepingan selangkah setelah yang sebelumnya, paling banyak delapan langkah.",
    },
    press: {
      title: "Tekan-pas",
      description:
        "Tombol berisi tenggelam tepat ke bayangan kerasnya saat ditekan, lalu memantul kembali. Satu tombol utama per layar bersifat magnetis: condong ke arah penunjuk tetikus di dekatnya.",
      magnetic: "Aku magnetis",
      plain: "Aku tidak",
    },
    pick: {
      title: "Memilih kepingan",
      description:
        "Kepingan yang dipilih terangkat dari foto dan meninggalkan jejak stud bertitik, dan ubinnya bergeser keluar seperti keterangan part. Kepingan yang dihapus terlepas; urungkan memasangnya kembali. Di ponsel, pasangannya terasa sebagai getaran kecil.",
      remove: "Lepaskan",
      undo: "Pasang lagi",
    },
    counts: {
      title: "Hitungan",
      description:
        "Hitungan berputar seperti odometer: naik dari nol saat muncul, ke nilai baru saat berubah. Pembaca layar mendapat kalimat biasa.",
      fewer: "Kurangi satu",
      more: "Tambah satu",
    },
    scanner: {
      title: "Pemindai",
      description:
        "Saat foto dipindai, sebuah sinar menyapunya dan stud yang dilewati menyala, lalu memudar di belakangnya. Hanya transform yang bergerak, jadi tetap mulus di ponsel.",
    },
    apart: {
      title: "Berantakan",
      description:
        "Saat pemindaian gagal, rakitan kecil bergoyang lalu berjatuhan. Saat gerak dikurangi, kepingan langsung ditampilkan terpisah.",
    },
    baseplate: {
      title: "Baseplate",
      description:
        "Layar berada di atas kisi stud, dan satu stud adalah modul tata letak: 16px di ponsel, 24px mulai 640px. Dengan tetikus, stud di dekat penunjuk menyala. Layar sentuh dan gerak dikurangi tidak mendapat cahaya ini.",
    },
    steps: {
      title: "Antarlangkah",
      description:
        "Dari Foto ke Kepingan, foto berubah bentuk dari pemindai ke hasil, dan penanda langkah ikut bergeser. Tambahkan ?mockDelay=3000 ke alamat untuk memperlambat pemindaian, atau ?mock=fail-too_dark untuk melihat kegagalan.",
      action: "Coba pindai",
    },
    reduced: {
      title: "Gerak dikurangi",
      description:
        "Saat gerak dikurangi, tidak ada yang berpindah, miring, atau bergiliran. Kepingan tetap muncul perlahan, pilihan tetap terlihat, hitungan langsung berganti, dan sinar pemindai serta cahaya penunjuk mati.",
    },
  },
  history: {
    title: "Riwayat pindai",
    lead: "Hasil pindai tersimpan di peramban ini. Buka salah satunya untuk melihat lagi kepingan dan idenya.",
    loading: "Memuat hasil pindaimu…",
    count: { one: "{count} hasil pindai", other: "{count} hasil pindai" },
    newScan: "Pindai baru",
    lastTheme: "Tema terakhir: {theme}",
    ideas: "Lihat ide",
    delete: {
      action: "Hapus",
      question:
        "Hapus hasil pindai ini? Yang sudah dihapus tidak bisa kembali.",
      confirm: "Hapus hasil pindai",
      keep: "Batal",
      done: "Hasil pindai dihapus.",
      failed: "Kami tidak bisa menghapusnya. Coba lagi.",
    },
    clear: {
      action: "Hapus semua hasil pindai",
      question:
        "Hapus semua {count} hasil pindai dari peramban ini? Yang sudah dihapus tidak bisa kembali.",
      confirm: "Hapus semua",
      keep: "Batal",
      done: "Semua hasil pindai sudah dihapus.",
      failed: "Kami tidak bisa menghapus semuanya. Coba lagi.",
    },
    empty: {
      title: "Belum ada hasil pindai",
      body: "Potret kepinganmu, dan hasil pindainya tersimpan di sini, di peramban ini.",
      action: "Mulai pindai",
    },
    failed: {
      title: "Kami tidak bisa memuat hasil pindaimu",
      body: "Coba lagi sebentar lagi. Hasil pindaimu tetap tersimpan di peramban ini.",
      retry: "Coba lagi",
    },
  },
  states: {
    notFound: {
      title: "Kami tidak menemukan halaman itu",
      body: "Tautannya mungkin rusak, atau halamannya sudah pindah. Hasil pindaimu tetap tersimpan di peramban ini.",
      home: "Kembali ke beranda",
      scan: "Mulai pindai",
    },
    error: {
      title: "Ada yang salah",
      body: "Halaman ini berhenti bekerja. Coba lagi, atau kembali ke beranda. Hasil pindaimu tetap tersimpan di peramban ini.",
      retry: "Coba lagi",
      home: "Kembali ke beranda",
    },
    design: {
      title: "Kondisi kosong dan galat",
      description:
        "Saat tidak ada yang ditampilkan atau ada yang rusak: bingkai pemindai di ubin stiker, judul singkat, satu atau dua kalimat, dan langkah berikutnya. Halaman tidak ditemukan dan halaman galat memakai kartu yang sama.",
      empty: {
        title: "Belum ada hasil pindai",
        body: "Potret kepinganmu dan hasil pindaimu akan muncul di sini.",
        action: "Mulai pindai",
      },
    },
  },
  common: {
    step: "Langkah",
    partsUsed: "Part dipakai",
    partsMissing: "Part kurang",
    inventory: "Inventori",
    inventoryDetailed: "Inventori (detail)",
    // Indonesian has no plural forms; Intl.PluralRules always picks "other".
    missingCount: { one: "Kurang {count} part", other: "Kurang {count} part" },
    pieces: { one: "{count} kepingan", other: "{count} kepingan" },
    ideaOf: "IDE {index}/{total}",
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
    hideSteps: "Tutup langkah",
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
    ctaHistory: "Riwayat pindai",
    facts: {
      parts: "13 jenis part",
      colors: "10 warna",
      ideas: "3 ide per foto",
    },
    how: {
      title: "Cara kerjanya",
      photo: "Sebar kepinganmu di meja polos, lalu ambil satu foto dari atas.",
      pieces:
        "Legoin menemukan tiap kepingan beserta jenis part dan warnanya. Perbaiki kalau ada yang keliru.",
      ideas:
        "Pilih tema dan dapatkan tiga ide rakitan, lengkap dengan part yang kamu punya dan yang kurang.",
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
      scaleNote: "{name} di {step}",
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
