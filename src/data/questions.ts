import { materialById, type Difficulty, type ExamId } from "./catalog";
import { importedQuestionBank } from "./imported-questions";

/**
 * Canonical question contract. Field names mirror the future database columns
 * so the storage layer can be swapped without touching the question UI.
 */
export type Question = {
  id: string;
  exam: ExamId;
  subtest: string;
  material: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: Difficulty | null;
  /** seconds a well-prepared student should need */
  estimated_time: number | null;
  tags: string[];
  source?: string;
};

type Raw = [
  material: string,
  question: string,
  options: string[],
  correct_answer: number,
  explanation: string,
  difficulty: Difficulty,
  estimated_time: number,
  tags: string[],
];

const raw: Raw[] = [
  // ---------------- SKD · TWK ----------------
  ["skd-twk-1", "Sikap yang mencerminkan nasionalisme dalam kehidupan sehari-hari adalah...", ["Membeli produk impor karena lebih bergengsi", "Menggunakan produk dalam negeri dan bangga memakainya", "Menolak semua budaya asing tanpa kecuali", "Mengutamakan kepentingan kelompok sendiri", "Menghindari kegiatan kemasyarakatan"], 1, "Nasionalisme yang sehat diwujudkan dengan mencintai dan menggunakan produk bangsa sendiri, bukan menolak seluruh budaya asing (chauvinisme).", "easy", 40, ["nasionalisme"]],
  ["skd-twk-1", "Semboyan Bhinneka Tunggal Ika berasal dari kitab...", ["Negarakertagama", "Sutasoma", "Pararaton", "Arjunawiwaha", "Smaradahana"], 1, "Bhinneka Tunggal Ika tercantum dalam Kakawin Sutasoma karya Mpu Tantular pada masa Majapahit.", "medium", 35, ["nasionalisme", "sejarah"]],
  ["skd-twk-2", "Integritas seorang ASN paling tepat ditunjukkan ketika...", ["Bekerja keras hanya saat diawasi atasan", "Menolak gratifikasi meski tidak ada yang mengetahui", "Melaporkan rekan kerja untuk mendapat pujian", "Mengikuti kebiasaan kantor meski menyimpang", "Menunda pekerjaan sampai ada perintah"], 1, "Integritas adalah konsistensi antara nilai dan perbuatan, termasuk saat tidak ada pengawasan.", "easy", 40, ["integritas"]],
  ["skd-twk-2", "Anda menemukan kesalahan perhitungan yang menguntungkan unit Anda. Tindakan paling berintegritas adalah...", ["Mendiamkan karena menguntungkan", "Melaporkan dan memperbaiki kesalahan tersebut", "Menunggu ada yang protes", "Menyalahkan unit lain", "Menghapus datanya"], 1, "Integritas menuntut keterbukaan dan koreksi walaupun kesalahan itu menguntungkan diri atau unit sendiri.", "medium", 45, ["integritas"]],
  ["skd-twk-3", "Dasar hukum utama penyelenggaraan bela negara di Indonesia tercantum dalam UUD 1945 Pasal...", ["Pasal 27 ayat (3)", "Pasal 28A", "Pasal 29 ayat (2)", "Pasal 31 ayat (1)", "Pasal 33 ayat (3)"], 0, "Pasal 27 ayat (3) UUD 1945 menyatakan setiap warga negara berhak dan wajib ikut serta dalam upaya pembelaan negara.", "medium", 40, ["bela negara"]],
  ["skd-twk-3", "Contoh bela negara bagi pelajar di lingkungan sekolah adalah...", ["Ikut wajib militer", "Menjaga ketertiban dan menolak perundungan", "Mengumpulkan senjata", "Berdemonstrasi setiap pekan", "Menolak upacara bendera"], 1, "Bela negara non-fisik diwujudkan lewat perilaku tertib, disiplin, dan menjaga persatuan di lingkungan terdekat.", "easy", 35, ["bela negara"]],
  ["skd-twk-4", "Empat pilar kebangsaan Indonesia adalah...", ["Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika", "Pancasila, GBHN, NKRI, Sumpah Pemuda", "UUD 1945, Tap MPR, UU, Perpres", "Pancasila, Trisila, Ekasila, NKRI", "Pancasila, UUD 1945, Otonomi Daerah, Demokrasi"], 0, "Empat pilar kebangsaan: Pancasila, UUD NRI 1945, NKRI, dan Bhinneka Tunggal Ika.", "easy", 30, ["pilar negara"]],
  ["skd-twk-4", "Kedudukan Pancasila sebagai dasar negara berarti Pancasila...", ["Hanya berlaku bagi penyelenggara negara", "Menjadi sumber dari segala sumber hukum negara", "Dapat diganti melalui referendum", "Sederajat dengan peraturan daerah", "Berlaku sebagai norma adat"], 1, "Sebagai dasar negara, Pancasila adalah sumber dari segala sumber hukum negara (UU No. 12 Tahun 2011).", "medium", 40, ["pilar negara"]],
  ["skd-twk-5", "Penulisan kata baku yang benar adalah...", ["analisa, kwalitas, resiko", "analisis, kualitas, risiko", "analisis, kwalitas, resiko", "analisa, kualitas, risiko", "analisys, kualitas, resiko"], 1, "Bentuk baku menurut KBBI adalah analisis, kualitas, dan risiko.", "easy", 30, ["bahasa negara", "kata baku"]],
  ["skd-twk-5", "Kalimat efektif yang benar adalah...", ["Para hadirin sekalian dipersilakan duduk.", "Hadirin dipersilakan duduk.", "Kepada para hadirin sekalian dipersilakan untuk duduk.", "Untuk hadirin semuanya silakan duduk.", "Bagi hadirin dipersilakan duduk."], 1, "Kalimat efektif menghindari pemborosan kata; 'hadirin' sudah bermakna jamak sehingga 'para' dan 'sekalian' berlebihan.", "medium", 40, ["bahasa negara", "kalimat efektif"]],

  // ---------------- SKD · TIU ----------------
  ["skd-tiu-1", "DOKTER : PASIEN = GURU : ...", ["Sekolah", "Buku", "Murid", "Kelas", "Kurikulum"], 2, "Dokter melayani pasien sebagaimana guru melayani murid: relasi pelaku profesi dengan pihak yang dilayani.", "easy", 30, ["analogi"]],
  ["skd-tiu-1", "HAUS : MINUM = LAPAR : ...", ["Nasi", "Makan", "Perut", "Kenyang", "Warung"], 1, "Haus diatasi dengan minum, lapar diatasi dengan makan: relasi kondisi dan tindakan penyelesaiannya.", "easy", 25, ["analogi"]],
  ["skd-tiu-2", "Semua mahasiswa mengikuti ujian. Sebagian mahasiswa adalah atlet. Kesimpulan yang tepat...", ["Semua atlet mengikuti ujian", "Sebagian atlet mengikuti ujian", "Tidak ada atlet yang ujian", "Semua peserta ujian adalah atlet", "Sebagian mahasiswa tidak ujian"], 1, "Sebagian mahasiswa adalah atlet dan semua mahasiswa ujian, maka sebagian atlet (yang mahasiswa) pasti ikut ujian.", "medium", 50, ["silogisme"]],
  ["skd-tiu-2", "Jika hujan maka jalan basah. Jalan tidak basah. Maka...", ["Hujan turun", "Tidak hujan", "Jalan licin", "Hujan deras", "Tidak dapat disimpulkan"], 1, "Modus tollens: jika p maka q, dan q salah, maka p salah — jadi tidak hujan.", "medium", 45, ["silogisme", "logika"]],
  ["skd-tiu-3", "A lebih tinggi dari B. C lebih pendek dari B. D lebih tinggi dari A. Siapa yang paling tinggi?", ["A", "B", "C", "D", "Tidak diketahui"], 3, "Urutan dari tinggi ke pendek: D > A > B > C, sehingga D paling tinggi.", "medium", 55, ["analitis"]],
  ["skd-tiu-3", "Lima orang duduk berjajar. Rina di ujung kiri, Budi tepat di kanan Rina. Posisi Budi adalah kursi ke-...", ["1", "2", "3", "4", "5"], 1, "Rina menempati kursi ke-1, sehingga tepat di kanannya adalah kursi ke-2.", "easy", 40, ["analitis"]],
  ["skd-tiu-4", "Jika 25% dari suatu bilangan adalah 40, maka bilangan tersebut adalah...", ["100", "120", "140", "160", "180"], 3, "25% sama dengan 1/4. Jika 1/4 bilangan adalah 40, maka bilangannya 40 × 4 = 160.", "easy", 45, ["persentase"]],
  ["skd-tiu-4", "Hasil dari 48 ÷ 6 × 3 + 7 adalah...", ["24", "29", "31", "35", "38"], 2, "Kerjakan pembagian dan perkalian dari kiri: 48 ÷ 6 = 8, lalu 8 × 3 = 24, ditambah 7 menjadi 31.", "easy", 50, ["operasi hitung"]],
  ["skd-tiu-5", "Deret: 3, 6, 12, 24, ... Angka berikutnya adalah...", ["30", "36", "42", "48", "54"], 3, "Setiap suku dikalikan 2, sehingga 24 × 2 = 48.", "easy", 35, ["deret"]],
  ["skd-tiu-5", "Deret: 2, 5, 10, 17, 26, ... Angka berikutnya adalah...", ["33", "35", "37", "39", "41"], 2, "Selisihnya 3, 5, 7, 9, lalu 11. Maka 26 + 11 = 37.", "medium", 55, ["deret"]],
  ["skd-tiu-6", "Bandingkan P = 3/4 dan Q = 0,8.", ["P > Q", "P < Q", "P = Q", "Tidak dapat ditentukan", "P = 2Q"], 1, "3/4 = 0,75 sedangkan Q = 0,8, sehingga P lebih kecil dari Q.", "easy", 40, ["perbandingan kuantitatif"]],
  ["skd-tiu-6", "Jika x = 2^5 dan y = 5^2, maka...", ["x > y", "x < y", "x = y", "x = 2y", "Tidak dapat ditentukan"], 0, "2^5 = 32 dan 5^2 = 25, sehingga x lebih besar dari y.", "medium", 45, ["perbandingan kuantitatif"]],
  ["skd-tiu-7", "Sebuah barang seharga Rp240.000 mendapat diskon 15%. Harga setelah diskon adalah...", ["Rp196.000", "Rp200.000", "Rp204.000", "Rp210.000", "Rp216.000"], 2, "Diskon 15% dari Rp240.000 adalah Rp36.000, sehingga harga akhirnya Rp204.000.", "medium", 55, ["soal cerita", "persentase"]],
  ["skd-tiu-7", "Mobil menempuh 180 km dalam 3 jam. Dengan kecepatan sama, jarak dalam 5 jam adalah...", ["240 km", "270 km", "300 km", "320 km", "360 km"], 2, "Kecepatan = 180/3 = 60 km/jam, maka 60 × 5 = 300 km.", "easy", 50, ["soal cerita", "kecepatan"]],
  ["skd-tiu-8", "Segitiga : Tiga sisi = Segienam : ...", ["Empat sisi", "Lima sisi", "Enam sisi", "Tujuh sisi", "Delapan sisi"], 2, "Relasi bangun datar dengan jumlah sisinya: segienam memiliki enam sisi.", "easy", 35, ["figural", "analogi"]],
  ["skd-tiu-8", "Jika gambar dirotasi 90° searah jarum jam lalu 270° searah jarum jam, hasilnya adalah...", ["Bentuk semula", "Cermin horizontal", "Cermin vertikal", "Rotasi 180°", "Rotasi 90°"], 0, "Total rotasi 90° + 270° = 360°, sehingga gambar kembali ke posisi semula.", "medium", 45, ["figural", "rotasi"]],
  ["skd-tiu-9", "Manakah yang tidak sekelompok dengan lainnya?", ["Persegi", "Persegi panjang", "Belah ketupat", "Lingkaran", "Jajar genjang"], 3, "Semua pilihan adalah segi empat, kecuali lingkaran yang tidak memiliki sisi lurus.", "easy", 35, ["figural", "ketidaksamaan"]],
  ["skd-tiu-9", "Manakah yang berbeda dari kelompoknya?", ["2", "3", "5", "9", "11"], 3, "Semua bilangan prima kecuali 9 yang merupakan bilangan komposit (3 × 3).", "easy", 35, ["ketidaksamaan"]],
  ["skd-tiu-10", "Pola serial: satu titik, dua titik, tiga titik, ... Gambar berikutnya berisi...", ["Satu titik", "Dua titik", "Tiga titik", "Empat titik", "Lima titik"], 3, "Jumlah titik bertambah satu pada setiap langkah, sehingga berikutnya empat titik.", "easy", 35, ["figural", "serial"]],
  ["skd-tiu-10", "Sebuah bangun berputar 45° searah jarum jam pada tiap langkah. Setelah empat langkah bangun berputar sebesar...", ["90°", "135°", "180°", "225°", "270°"], 2, "4 × 45° = 180°.", "medium", 45, ["figural", "serial"]],

  // ---------------- SKD · TKP ----------------
  ["skd-tkp-1", "Antrean layanan panjang dan warga mulai mengeluh. Sikap Anda...", ["Menyuruh warga bersabar lalu melanjutkan kerja seperti biasa", "Menjelaskan estimasi waktu dan mempercepat proses yang bisa disederhanakan", "Menutup loket sementara agar tenang", "Melayani yang paling ribut lebih dulu", "Meminta warga datang besok"], 1, "Pelayanan publik terbaik menggabungkan komunikasi transparan dengan perbaikan proses, bukan sekadar meminta warga bersabar.", "medium", 60, ["pelayanan publik"]],
  ["skd-tkp-1", "Seorang warga lansia kesulitan mengisi formulir digital. Anda...", ["Memintanya membawa pendamping", "Membantunya mengisi sambil menjelaskan langkahnya", "Menyuruh mengisi manual saja", "Mengarahkan ke loket lain", "Menunggu sampai dia selesai sendiri"], 1, "Pelayanan prima berarti membantu langsung sekaligus memberdayakan penerima layanan.", "easy", 55, ["pelayanan publik"]],
  ["skd-tkp-2", "Unit lain meminta data untuk proyek bersama, tetapi Anda sedang sibuk. Anda...", ["Menolak karena bukan tugas Anda", "Menyepakati tenggat realistis dan tetap mengirim data", "Mengabaikan permintaan", "Meminta mereka mencari sendiri", "Melimpahkan ke rekan tanpa memberitahu"], 1, "Jejaring kerja dibangun dengan kesediaan berkolaborasi disertai pengelolaan ekspektasi yang jelas.", "medium", 60, ["jejaring kerja"]],
  ["skd-tkp-2", "Rekan satu tim jarang berkomunikasi sehingga pekerjaan tersendat. Anda...", ["Melaporkan langsung ke atasan", "Mengajak bicara empat mata untuk mencari solusi", "Mendiamkan saja", "Mengerjakan semuanya sendiri", "Mengeluh ke rekan lain"], 1, "Langkah pertama yang efektif adalah komunikasi langsung untuk memahami hambatan dan menyepakati mekanisme kerja.", "medium", 60, ["jejaring kerja"]],
  ["skd-tkp-3", "Anda ditempatkan di daerah dengan adat yang berbeda. Anda...", ["Menerapkan kebiasaan daerah asal", "Mempelajari dan menghormati adat setempat", "Menghindari interaksi dengan warga", "Meminta pindah tugas", "Mengkritik adat yang tidak Anda pahami"], 1, "Kompetensi sosial budaya menuntut kemampuan beradaptasi dan menghargai keragaman.", "easy", 50, ["sosial budaya"]],
  ["skd-tkp-3", "Ada perbedaan pendapat antar kelompok warga saat musyawarah. Anda...", ["Memihak kelompok mayoritas", "Memfasilitasi dialog agar tercapai kesepakatan", "Menghentikan musyawarah", "Membiarkan mereka berdebat", "Memutuskan sendiri"], 1, "Musyawarah dijaga dengan memfasilitasi dialog yang setara, bukan memihak atau memutuskan sepihak.", "medium", 60, ["sosial budaya"]],
  ["skd-tkp-4", "Kantor menerapkan aplikasi baru yang belum Anda kuasai. Anda...", ["Tetap memakai cara lama", "Mempelajari aplikasi dan mengikuti pelatihan yang tersedia", "Meminta rekan mengerjakan bagian Anda", "Menunggu perintah atasan", "Mengeluhkan sistem baru"], 1, "Adaptasi teknologi ditunjukkan dengan inisiatif belajar mandiri dan memanfaatkan pelatihan.", "easy", 50, ["teknologi informasi"]],
  ["skd-tkp-4", "Anda menerima tautan mencurigakan di email kantor. Anda...", ["Membukanya karena penasaran", "Tidak membuka dan melaporkannya ke tim TI", "Meneruskan ke rekan kerja", "Menghapus tanpa memberi tahu siapa pun", "Membalas email tersebut"], 1, "Keamanan informasi menuntut tidak membuka tautan mencurigakan dan melaporkannya agar ancaman dapat ditangani.", "medium", 50, ["teknologi informasi", "keamanan"]],
  ["skd-tkp-5", "Pekerjaan Anda selesai lebih cepat dari tenggat. Anda...", ["Menunggu jam pulang", "Memeriksa ulang hasil dan membantu pekerjaan tim", "Mengambil pekerjaan pribadi", "Memberi tahu atasan bahwa Anda menganggur", "Memperlambat pekerjaan berikutnya"], 1, "Profesionalisme ditunjukkan dengan menjaga kualitas hasil dan berkontribusi lebih pada tim.", "easy", 55, ["profesionalisme"]],
  ["skd-tkp-5", "Atasan memberi tugas di luar keahlian Anda. Anda...", ["Menolak dengan tegas", "Menerima sambil belajar dan meminta arahan bila perlu", "Menyerahkan ke rekan", "Mengerjakan asal jadi", "Menunda hingga tenggat lewat"], 1, "Sikap profesional adalah menerima tantangan dengan kesadaran mengembangkan kompetensi dan meminta bimbingan.", "medium", 60, ["profesionalisme"]],
  ["skd-tkp-6", "Anda mendengar ajakan diskusi yang menolak dasar negara. Anda...", ["Ikut agar tidak dianggap berbeda", "Menolak dan melaporkan bila mengarah pada tindakan melawan hukum", "Mendiamkan saja", "Menyebarkan isinya untuk dibahas", "Mendebat dengan emosi"], 1, "Sikap anti radikalisme berarti menolak paham yang bertentangan dengan dasar negara dan menempuh jalur yang benar.", "medium", 60, ["anti radikalisme"]],
  ["skd-tkp-6", "Media sosial Anda dipenuhi konten provokatif berbau SARA. Anda...", ["Membagikannya agar ramai", "Tidak menyebarkan dan melaporkan kontennya", "Mengomentari dengan kasar", "Membiarkan tanpa tindakan", "Membuat konten balasan serupa"], 1, "Menahan diri menyebarkan dan melaporkan konten provokatif mencegah eskalasi konflik.", "easy", 50, ["anti radikalisme"]],

  // ---------------- UTBK ----------------
  ["utbk-pu-1", "Semua siswa yang rajin membaca memiliki kosakata luas. Doni tidak memiliki kosakata luas. Maka...", ["Doni rajin membaca", "Doni tidak rajin membaca", "Doni membaca sesekali", "Doni malas belajar", "Tidak dapat disimpulkan"], 1, "Kontraposisi: jika tidak berkosakata luas, maka tidak rajin membaca.", "medium", 60, ["penalaran", "logika"]],
  ["utbk-pu-1", "Jika setiap kenaikan harga BBM diikuti kenaikan tarif angkutan, dan tarif angkutan tidak naik, maka...", ["Harga BBM naik", "Harga BBM tidak naik", "Tarif akan naik nanti", "Angkutan berkurang", "Tidak dapat disimpulkan"], 1, "Modus tollens menghasilkan kesimpulan bahwa harga BBM tidak naik.", "medium", 65, ["penalaran"]],
  ["utbk-ppu-1", "Kata 'mitigasi' paling dekat maknanya dengan...", ["Pencegahan dampak", "Perluasan wilayah", "Penundaan kegiatan", "Penghapusan aturan", "Penilaian risiko"], 0, "Mitigasi berarti tindakan mengurangi atau mencegah dampak buruk suatu bencana atau risiko.", "easy", 40, ["kosakata"]],
  ["utbk-ppu-1", "Ibu kota provinsi Nusa Tenggara Barat adalah...", ["Kupang", "Mataram", "Denpasar", "Bima", "Sumbawa Besar"], 1, "Mataram di Pulau Lombok adalah ibu kota Nusa Tenggara Barat.", "easy", 30, ["pengetahuan umum"]],
  ["utbk-pbm-1", "Penulisan judul yang benar adalah...", ["Peran Teknologi Dalam Pendidikan", "Peran Teknologi dalam Pendidikan", "peran teknologi dalam pendidikan", "Peran teknologi Dalam pendidikan", "PERAN teknologi dalam Pendidikan"], 1, "Dalam judul, kata depan seperti 'dalam' ditulis huruf kecil kecuali berada di awal judul.", "easy", 40, ["ejaan"]],
  ["utbk-pbm-1", "Kalimat yang baku adalah...", ["Meskipun hujan, tetapi dia tetap datang.", "Meskipun hujan, dia tetap datang.", "Walaupun hujan, namun dia datang.", "Karena hujan, sehingga dia datang.", "Sebab hujan, maka dia datang."], 1, "Konjungsi 'meskipun' tidak boleh dipasangkan dengan 'tetapi' dalam satu kalimat.", "medium", 45, ["kalimat baku"]],
  ["utbk-pk-1", "Jika 3x + 5 = 20, maka nilai 6x adalah...", ["15", "20", "25", "30", "35"], 3, "3x = 15 sehingga x = 5, maka 6x = 30.", "easy", 45, ["aljabar"]],
  ["utbk-pk-1", "Rata-rata dari 4, 8, 10, dan 14 adalah...", ["8", "9", "10", "11", "12"], 1, "Jumlah 36 dibagi 4 data menghasilkan 9.", "easy", 40, ["statistika"]],
  ["utbk-lbi-1", "Ide pokok sebuah paragraf umumnya terdapat pada...", ["Kalimat penjelas", "Kalimat utama", "Kalimat transisi", "Kalimat tanya", "Catatan kaki"], 1, "Ide pokok dinyatakan dalam kalimat utama yang biasanya di awal atau akhir paragraf.", "easy", 40, ["literasi"]],
  ["utbk-lbi-1", "Teks yang bertujuan meyakinkan pembaca disebut teks...", ["Deskripsi", "Narasi", "Persuasi", "Eksposisi", "Laporan"], 2, "Teks persuasi bertujuan memengaruhi dan meyakinkan pembaca untuk melakukan sesuatu.", "easy", 40, ["literasi"]],
  ["utbk-lbe-1", "Choose the correct sentence.", ["He don't like coffee.", "He doesn't likes coffee.", "He doesn't like coffee.", "He not like coffee.", "He isn't like coffee."], 2, "With third person singular in the negative, use 'doesn't' followed by the base verb.", "easy", 40, ["grammar"]],
  ["utbk-lbe-1", "The word 'significant' is closest in meaning to...", ["Trivial", "Important", "Unclear", "Frequent", "Sudden"], 1, "'Significant' means important or notable.", "easy", 35, ["vocabulary"]],
  ["utbk-pm-1", "Sebuah tabungan Rp2.000.000 mendapat bunga tunggal 6% per tahun. Bunga setelah 2 tahun adalah...", ["Rp120.000", "Rp180.000", "Rp240.000", "Rp300.000", "Rp360.000"], 2, "Bunga tunggal = 2.000.000 × 6% × 2 = Rp240.000.", "medium", 60, ["aritmetika sosial"]],
  ["utbk-pm-1", "Sebuah persegi panjang berukuran 12 cm × 8 cm. Kelilingnya adalah...", ["32 cm", "36 cm", "40 cm", "44 cm", "48 cm"], 2, "Keliling = 2 × (12 + 8) = 40 cm.", "easy", 40, ["geometri"]],

  // ---------------- Psikotes ----------------
  ["psikotes-verbal-1", "Sinonim dari kata 'ABSURD' adalah...", ["Masuk akal", "Mustahil", "Tidak masuk akal", "Rumit", "Sederhana"], 2, "Absurd berarti tidak masuk akal atau janggal.", "easy", 30, ["sinonim"]],
  ["psikotes-verbal-1", "Antonim dari kata 'GERSANG' adalah...", ["Kering", "Tandus", "Subur", "Panas", "Luas"], 2, "Lawan kata gersang adalah subur.", "easy", 30, ["antonim"]],
  ["psikotes-numerik-1", "17 × 6 - 22 = ...", ["70", "76", "80", "84", "90"], 2, "17 × 6 = 102, dikurangi 22 menjadi 80.", "easy", 40, ["hitung cepat"]],
  ["psikotes-numerik-1", "Berapa 35% dari 220?", ["66", "70", "73", "77", "80"], 3, "35% × 220 = 77.", "medium", 45, ["persentase"]],
  ["psikotes-logika-1", "Semua pegawai memakai seragam. Rian memakai seragam. Maka...", ["Rian pasti pegawai", "Rian belum tentu pegawai", "Rian bukan pegawai", "Semua yang berseragam pegawai", "Tidak ada kesimpulan benar"], 1, "Premis tidak menyatakan hanya pegawai yang berseragam, sehingga Rian belum tentu pegawai.", "medium", 55, ["logika"]],
  ["psikotes-logika-1", "Jika A > B dan B > C, maka...", ["C > A", "A > C", "A = C", "B > A", "Tidak dapat ditentukan"], 1, "Sifat transitif menghasilkan A > C.", "easy", 35, ["logika"]],
  ["psikotes-analogi-1", "PENA : TINTA = LAMPU : ...", ["Kaca", "Listrik", "Terang", "Saklar", "Kabel"], 1, "Pena berfungsi karena tinta, lampu berfungsi karena listrik.", "easy", 35, ["analogi"]],
  ["psikotes-analogi-1", "AIR : HAUS = MAKANAN : ...", ["Enak", "Lapar", "Piring", "Kenyang", "Dapur"], 1, "Air mengatasi haus, makanan mengatasi lapar.", "easy", 30, ["analogi"]],
  ["psikotes-deret-1", "Deret: 4, 9, 16, 25, ...", ["30", "33", "36", "42", "49"], 2, "Deret kuadrat 2², 3², 4², 5², maka berikutnya 6² = 36.", "easy", 40, ["deret angka"]],
  ["psikotes-deret-1", "Deret huruf: A, C, E, G, ...", ["H", "I", "J", "K", "L"], 1, "Melompat satu huruf setiap langkah, setelah G adalah I.", "easy", 35, ["deret huruf"]],
  ["psikotes-ketelitian-1", "Manakah pasangan yang identik? 84720 - 84720", ["Berbeda pada digit ke-2", "Berbeda pada digit ke-4", "Identik", "Berbeda pada digit ke-5", "Berbeda pada digit ke-1"], 2, "Kedua deret angka sama persis, sehingga identik.", "easy", 25, ["ketelitian"]],
  ["psikotes-ketelitian-1", "Manakah yang berbeda dari pasangan berikut? 'AKUNTANSI' - 'AKUNTANSI'", ["Huruf ke-3", "Huruf ke-6", "Huruf ke-8", "Tidak ada yang berbeda", "Huruf ke-1"], 3, "Kedua kata tertulis identik, sehingga tidak ada perbedaan.", "easy", 25, ["ketelitian"]],
  ["psikotes-figural-1", "Sebuah kubus memiliki jumlah sisi sebanyak...", ["4", "5", "6", "8", "12"], 2, "Kubus memiliki enam sisi berbentuk persegi.", "easy", 30, ["spasial"]],
  ["psikotes-figural-1", "Jaring-jaring kubus terdiri atas berapa persegi?", ["4", "5", "6", "7", "8"], 2, "Jaring-jaring kubus selalu terdiri dari enam persegi.", "easy", 30, ["spasial"]],
  ["psikotes-kepribadian-1", "Saat menghadapi tugas mendadak dengan tenggat ketat, Anda cenderung...", ["Menunda sampai mendekati tenggat", "Menyusun prioritas lalu mengerjakan bertahap", "Meminta orang lain mengerjakan", "Mengerjakan sambil mengeluh", "Menghindari tugas tersebut"], 1, "Respons paling adaptif adalah menyusun prioritas dan menyelesaikan tugas secara terstruktur.", "medium", 50, ["kepribadian"]],
  ["psikotes-kepribadian-1", "Ketika menerima kritik atas pekerjaan Anda, sikap terbaik adalah...", ["Membela diri", "Mendengarkan dan memperbaiki yang perlu", "Mengabaikan kritik", "Membalas mengkritik", "Berhenti mengerjakan"], 1, "Keterbukaan terhadap umpan balik menunjukkan kematangan dan orientasi perbaikan.", "easy", 45, ["kepribadian"]],

  // ---------------- TPA ----------------
  ["tpa-verbal-1", "Sinonim 'KOHEREN' adalah...", ["Terpisah", "Berhubungan logis", "Berlawanan", "Tidak jelas", "Berulang"], 1, "Koheren berarti berkaitan secara logis dan runtut.", "medium", 35, ["sinonim"]],
  ["tpa-verbal-1", "Antonim 'EKSPLISIT' adalah...", ["Tegas", "Jelas", "Implisit", "Terbuka", "Nyata"], 2, "Lawan kata eksplisit (tersurat) adalah implisit (tersirat).", "medium", 35, ["antonim"]],
  ["tpa-numerik-1", "Jika 5 pekerja menyelesaikan tugas dalam 12 hari, maka 10 pekerja menyelesaikannya dalam...", ["4 hari", "5 hari", "6 hari", "8 hari", "10 hari"], 2, "Perbandingan berbalik nilai: (5 × 12) / 10 = 6 hari.", "medium", 55, ["perbandingan"]],
  ["tpa-numerik-1", "Nilai dari 0,25 × 80 adalah...", ["16", "18", "20", "22", "25"], 2, "0,25 × 80 = 20.", "easy", 35, ["hitung"]],
  ["tpa-logika-1", "Semua buku di rak berwarna biru. Sebagian buku biru bersampul tebal. Maka...", ["Semua buku di rak bersampul tebal", "Sebagian buku di rak mungkin bersampul tebal", "Tidak ada buku bersampul tebal", "Semua buku tebal ada di rak", "Tidak dapat disimpulkan sama sekali"], 1, "Hanya sebagian buku biru bersampul tebal, sehingga kesimpulan yang aman bersifat 'sebagian/mungkin'.", "medium", 60, ["logika"]],
  ["tpa-logika-1", "Urutan yang benar dari peristiwa: menanam, memanen, menyiram, menyemai.", ["Menyemai, menanam, menyiram, memanen", "Menanam, menyemai, menyiram, memanen", "Menyiram, menyemai, menanam, memanen", "Menyemai, menyiram, memanen, menanam", "Menanam, menyiram, memanen, menyemai"], 0, "Urutan alami budidaya: menyemai, menanam, menyiram, lalu memanen.", "easy", 45, ["logika urutan"]],
  ["tpa-figural-1", "Bangun yang memiliki simetri putar tingkat 4 adalah...", ["Segitiga sama sisi", "Persegi", "Trapesium", "Layang-layang", "Jajar genjang"], 1, "Persegi dapat menempati bingkainya dalam 4 posisi berbeda pada satu putaran penuh.", "medium", 45, ["figural"]],
  ["tpa-figural-1", "Cermin dari huruf 'b' secara horizontal menghasilkan huruf...", ["d", "p", "q", "b", "h"], 0, "Pencerminan horizontal huruf 'b' menghasilkan huruf 'd'.", "easy", 35, ["figural"]],

  // ---------------- TBI ----------------
  ["tbi-structure-1", "She ____ to the office every morning.", ["go", "goes", "going", "gone", "is go"], 1, "Simple present with a third person singular subject takes 'goes'.", "easy", 35, ["grammar"]],
  ["tbi-structure-1", "If I ____ more time, I would learn another language.", ["have", "has", "had", "having", "will have"], 2, "Second conditional uses the past simple 'had' in the if-clause.", "medium", 45, ["conditional"]],
  ["tbi-reading-1", "A paragraph's main idea is best described as...", ["A supporting detail", "The central point the paragraph makes", "The last sentence only", "A quotation", "An example"], 1, "The main idea is the central point the whole paragraph supports.", "easy", 40, ["reading"]],
  ["tbi-reading-1", "'The policy was met with resistance.' The word 'resistance' means...", ["Support", "Opposition", "Confusion", "Delay", "Approval"], 1, "Resistance means opposition or refusal to accept something.", "medium", 40, ["reading", "vocabulary"]],
  ["tbi-vocabulary-1", "Choose the word closest in meaning to 'abundant'.", ["Scarce", "Plentiful", "Costly", "Hidden", "Fragile"], 1, "Abundant means existing in large quantities, i.e. plentiful.", "easy", 35, ["vocabulary"]],
  ["tbi-vocabulary-1", "The idiom 'once in a blue moon' means...", ["Very often", "Very rarely", "At night", "Immediately", "Never"], 1, "'Once in a blue moon' describes something that happens very rarely.", "medium", 40, ["idiom"]],
];

const originalQuestions: Question[] = raw.map(
  ([material, question, options, correct_answer, explanation, difficulty, estimated_time, tags], index) => {
    const catalogMaterial = materialById(material);
    if (!catalogMaterial) throw new Error(`Unknown material id: ${material}`);
    return {
      id: `q${index + 1}`,
      exam: catalogMaterial.examId,
      subtest: catalogMaterial.subtestId,
      material,
      question,
      options,
      correct_answer,
      explanation,
      difficulty,
      estimated_time,
      tags,
    };
  },
);

/** The full import remains available for editorial review; only ready rows are playable. */
export const storedImportedQuestions = importedQuestionBank;

export const importedQuestions: Question[] = importedQuestionBank
  .filter(
    (item): item is typeof item & { correct_answer: number } =>
      item.status === "ready" && item.correct_answer !== null && item.options.every(Boolean),
  )
  .map(({ status: _status, ...item }) => item);

export const questions: Question[] = [...originalQuestions, ...importedQuestions];

export const questionById = (id: string) => questions.find((item) => item.id === id);
export const questionsForMaterial = (materialId: string) =>
  questions.filter((item) => item.material === materialId);
export const questionsForSubtest = (subtestId: string) =>
  questions.filter((item) => item.subtest === subtestId);
export const questionsForExam = (examId: string) => questions.filter((item) => item.exam === examId);
