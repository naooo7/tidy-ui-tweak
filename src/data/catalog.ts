/**
 * Exam taxonomy: exam -> subtest -> material.
 * Pure data with no UI concerns so it can later be served from a database
 * without touching any component.
 */

export type ExamId = "skd" | "utbk" | "psikotes" | "tpa" | "tbi";
export type Difficulty = "easy" | "medium" | "hard";

export type Exam = {
  id: ExamId;
  name: string;
  fullName: string;
};

export type Subtest = {
  /** Globally unique, e.g. "skd-tiu" */
  id: string;
  /** URL-facing code, e.g. "tiu" */
  code: string;
  examId: ExamId;
  name: string;
  fullName: string;
};

export type Material = {
  /** Globally unique, e.g. "skd-tiu-4" */
  id: string;
  examId: ExamId;
  subtestId: string;
  name: string;
};

export const exams: Exam[] = [
  { id: "skd", name: "SKD", fullName: "Seleksi Kompetensi Dasar" },
  { id: "utbk", name: "UTBK", fullName: "Ujian Tulis Berbasis Komputer" },
  { id: "psikotes", name: "Psikotes", fullName: "Tes Psikologi" },
  { id: "tpa", name: "TPA", fullName: "Tes Potensi Akademik" },
  { id: "tbi", name: "TBI", fullName: "Tes Bahasa Inggris" },
];

type SubtestSeed = [code: string, name: string, fullName: string, materials: string[]];

const seeds: Record<ExamId, SubtestSeed[]> = {
  skd: [
    ["twk", "TWK", "Tes Wawasan Kebangsaan", [
      "Nasionalisme",
      "Integritas",
      "Bela Negara",
      "Pilar Negara",
      "Bahasa Negara",
    ]],
    ["tiu", "TIU", "Tes Intelegensia Umum", [
      "Verbal Analogi",
      "Verbal Silogisme",
      "Verbal Analitis",
      "Numerik Berhitung",
      "Numerik Deret Angka",
      "Numerik Perbandingan Kuantitatif",
      "Numerik Soal Cerita",
      "Figural Analogi",
      "Figural Ketidaksamaan",
      "Figural Serial",
    ]],
    ["tkp", "TKP", "Tes Karakteristik Pribadi", [
      "Pelayanan Publik",
      "Jejaring Kerja",
      "Sosial Budaya",
      "Teknologi Informasi dan Komunikasi",
      "Profesionalisme",
      "Anti Radikalisme",
    ]],
  ],
  // UTBK intentionally exposes its seven subtests directly — no TPS / Literasi layer.
  utbk: [
    ["pu", "PU", "Penalaran Umum", ["Penalaran Umum"]],
    ["ppu", "PPU", "Pengetahuan dan Pemahaman Umum", ["Pengetahuan dan Pemahaman Umum"]],
    ["pbm", "PBM", "Pemahaman Bacaan dan Menulis", ["Pemahaman Bacaan dan Menulis"]],
    ["pk", "PK", "Pengetahuan Kuantitatif", ["Pengetahuan Kuantitatif"]],
    ["lbi", "LBI", "Literasi Bahasa Indonesia", ["Literasi Bahasa Indonesia"]],
    ["lbe", "LBE", "Literasi Bahasa Inggris", ["Literasi Bahasa Inggris"]],
    ["pm", "PM", "Penalaran Matematika", ["Penalaran Matematika"]],
  ],
  psikotes: [
    ["verbal", "Verbal", "Kemampuan Verbal", ["Sinonim & Antonim"]],
    ["numerik", "Numerik", "Kemampuan Numerik", ["Hitung Cepat"]],
    ["logika", "Logika", "Penalaran Logis", ["Logika Penarikan Kesimpulan"]],
    ["analogi", "Analogi", "Analogi Kata", ["Analogi Kata"]],
    ["deret", "Deret", "Deret Angka & Huruf", ["Deret Angka dan Huruf"]],
    ["ketelitian", "Ketelitian", "Tes Ketelitian", ["Ketelitian Simbol"]],
    ["figural", "Spasial/Figural", "Kemampuan Spasial dan Figural", ["Spasial dan Figural"]],
    ["kepribadian", "Kepribadian", "Tes Kepribadian", ["Kecenderungan Kepribadian"]],
  ],
  tpa: [
    ["verbal", "Verbal", "Kemampuan Verbal", ["Verbal TPA"]],
    ["numerik", "Numerik", "Kemampuan Numerik", ["Numerik TPA"]],
    ["logika", "Logika", "Kemampuan Logika", ["Logika TPA"]],
    ["figural", "Figural/Spasial", "Kemampuan Figural dan Spasial", ["Figural TPA"]],
  ],
  tbi: [
    ["structure", "Structure", "Structure & Written Expression", ["Structure and Written Expression"]],
    ["reading", "Reading", "Reading Comprehension", ["Reading Comprehension"]],
    ["vocabulary", "Vocabulary", "Vocabulary & Idioms", ["Vocabulary and Idioms"]],
  ],
};

export const subtests: Subtest[] = (Object.keys(seeds) as ExamId[]).flatMap((examId) =>
  seeds[examId].map(([code, name, fullName]) => ({
    id: `${examId}-${code}`,
    code,
    examId,
    name,
    fullName,
  })),
);

export const materials: Material[] = (Object.keys(seeds) as ExamId[]).flatMap((examId) =>
  seeds[examId].flatMap(([code, , , names]) =>
    names.map((name, index) => ({
      id: `${examId}-${code}-${index + 1}`,
      examId,
      subtestId: `${examId}-${code}`,
      name,
    })),
  ),
);

export const examById = (id: string) => exams.find((exam) => exam.id === id);
export const subtestById = (id: string) => subtests.find((subtest) => subtest.id === id);
export const materialById = (id: string) => materials.find((material) => material.id === id);

export const subtestsForExam = (examId: string) => subtests.filter((subtest) => subtest.examId === examId);
export const materialsForSubtest = (subtestId: string) =>
  materials.filter((material) => material.subtestId === subtestId);
export const materialsForExam = (examId: string) => materials.filter((material) => material.examId === examId);

export const findSubtest = (examId: string, code: string) =>
  subtests.find((subtest) => subtest.examId === examId && subtest.code === code);

export const materialLabel = (materialId: string) => materialById(materialId)?.name ?? materialId;
