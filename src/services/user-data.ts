import { getStore } from "@/lib/storage";
import { materialById, materials, type ExamId } from "@/data/catalog";
import { questionById, questions } from "@/data/questions";

/**
 * Single source of truth for everything the learner produces: attempts,
 * per-question stats, mastery, review flags and daily activity.
 *
 * All reads/writes go through the KeyValueStore abstraction, so replacing
 * localStorage with Supabase later only means changing this file.
 */

const STORAGE_KEY = "fastlearner:user-data:v1";

export type AttemptRecord = {
  id: string;
  questionId: string;
  exam: ExamId;
  subtest: string;
  material: string;
  selected: number | null;
  correct: boolean;
  /** seconds the learner actually spent */
  time_taken: number;
  /** seconds budgeted for the question */
  estimated_time: number;
  timed_out: boolean;
  mode: string;
  at: string;
};

export type QuestionStat = {
  questionId: string;
  exam: ExamId;
  subtest: string;
  material: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  last_practiced: string | null;
  /** total seconds across attempts */
  time_taken: number;
  mastery: number;
  needs_review: boolean;
};

export type DayRecord = {
  date: string;
  questions: number;
  correct: number;
  seconds: number;
};

export type UserData = {
  version: 1;
  attempts: AttemptRecord[];
  stats: Record<string, QuestionStat>;
  days: Record<string, DayRecord>;
};

const emptyData: UserData = { version: 1, attempts: [], stats: {}, days: {} };

let cache: UserData | null = null;
const listeners = new Set<() => void>();
let browserReadsEnabled = false;

export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function load(): UserData {
  if (typeof window !== "undefined" && !browserReadsEnabled) return emptyData;
  if (cache) return cache;
  const stored = getStore().read<UserData>(STORAGE_KEY);
  cache = stored && stored.version === 1 ? { ...emptyData, ...stored } : emptyData;
  return cache;
}

/** Keep the first browser render identical to SSR, then load persisted activity after hydration. */
export function enableBrowserUserData() {
  if (browserReadsEnabled) return;
  browserReadsEnabled = true;
  cache = null;
  listeners.forEach((listener) => listener());
}

function commit(next: UserData) {
  cache = next;
  getStore().write(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

export function getUserData(): UserData {
  return load();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetUserData() {
  commit(emptyData);
}

/** Simple, intentionally readable mastery: accuracy tempered by how often the question was practiced. */
export function calculateMastery(attempts: number, correct: number) {
  if (attempts === 0) return 0;
  const accuracy = correct / attempts;
  const confidence = Math.min(attempts, 3) / 3;
  return Math.round(accuracy * confidence * 100);
}

export const MASTERED_THRESHOLD = 80;

function blankStat(questionId: string): QuestionStat {
  const question = questionById(questionId);
  return {
    questionId,
    exam: question?.exam ?? "skd",
    subtest: question?.subtest ?? "",
    material: question?.material ?? "",
    attempts: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0,
    last_practiced: null,
    time_taken: 0,
    mastery: 0,
    needs_review: false,
  };
}

export function getQuestionStat(questionId: string): QuestionStat {
  return load().stats[questionId] ?? blankStat(questionId);
}

export type AttemptInput = {
  questionId: string;
  selected: number | null;
  correct: boolean;
  time_taken: number;
  estimated_time: number;
  timed_out?: boolean;
  mode?: string;
};

export function recordAttempt(input: AttemptInput) {
  const data = load();
  const now = new Date();
  const question = questionById(input.questionId);
  const previous = data.stats[input.questionId] ?? blankStat(input.questionId);

  const attempts = previous.attempts + 1;
  const correct = previous.correct + (input.correct ? 1 : 0);
  const incorrect = attempts - correct;

  const stat: QuestionStat = {
    ...previous,
    exam: question?.exam ?? previous.exam,
    subtest: question?.subtest ?? previous.subtest,
    material: question?.material ?? previous.material,
    attempts,
    correct,
    incorrect,
    accuracy: Math.round((correct / attempts) * 100),
    last_practiced: now.toISOString(),
    time_taken: previous.time_taken + input.time_taken,
    mastery: calculateMastery(attempts, correct),
    // answering correctly clears an automatic review flag only when it was never set by hand
    needs_review: previous.needs_review,
  };

  const attempt: AttemptRecord = {
    id: `${now.getTime()}-${input.questionId}`,
    questionId: input.questionId,
    exam: stat.exam,
    subtest: stat.subtest,
    material: stat.material,
    selected: input.selected,
    correct: input.correct,
    time_taken: input.time_taken,
    estimated_time: input.estimated_time,
    timed_out: input.timed_out ?? false,
    mode: input.mode ?? "practice",
    at: now.toISOString(),
  };

  const key = dateKey(now);
  const day = data.days[key] ?? { date: key, questions: 0, correct: 0, seconds: 0 };

  commit({
    ...data,
    attempts: [...data.attempts, attempt],
    stats: { ...data.stats, [input.questionId]: stat },
    days: {
      ...data.days,
      [key]: {
        date: key,
        questions: day.questions + 1,
        correct: day.correct + (input.correct ? 1 : 0),
        seconds: day.seconds + input.time_taken,
      },
    },
  });
}

export function setNeedsReview(questionId: string, needsReview: boolean) {
  const data = load();
  const previous = data.stats[questionId] ?? blankStat(questionId);
  commit({
    ...data,
    stats: { ...data.stats, [questionId]: { ...previous, needs_review: needsReview } },
  });
}

export function toggleNeedsReview(questionId: string) {
  setNeedsReview(questionId, !getQuestionStat(questionId).needs_review);
}

/* -------------------------------------------------------------------------- */
/* Derived selectors                                                           */
/* -------------------------------------------------------------------------- */

export type QuestionStatus = "unanswered" | "incorrect" | "needs-review" | "mastered" | "practiced";

export function getQuestionStatus(questionId: string): QuestionStatus {
  const stat = getQuestionStat(questionId);
  if (stat.needs_review) return "needs-review";
  if (stat.attempts === 0) return "unanswered";
  if (stat.mastery >= MASTERED_THRESHOLD) return "mastered";
  if (stat.incorrect > 0) return "incorrect";
  return "practiced";
}

export function getMistakeQuestionIds() {
  const { stats } = load();
  return Object.values(stats)
    .filter((stat) => stat.incorrect > 0)
    .sort((a, b) => (b.last_practiced ?? "").localeCompare(a.last_practiced ?? ""))
    .map((stat) => stat.questionId);
}

export function getReviewQuestionIds() {
  const { stats } = load();
  return Object.values(stats)
    .filter((stat) => stat.needs_review)
    .map((stat) => stat.questionId);
}

export function getScopeStats(filter: (stat: QuestionStat) => boolean) {
  const values = Object.values(load().stats).filter(filter);
  const attempts = values.reduce((sum, stat) => sum + stat.attempts, 0);
  const correct = values.reduce((sum, stat) => sum + stat.correct, 0);
  const seconds = values.reduce((sum, stat) => sum + stat.time_taken, 0);
  return {
    questionsTouched: values.length,
    attempts,
    correct,
    incorrect: attempts - correct,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    averageTime: attempts ? Math.round(seconds / attempts) : 0,
    seconds,
    lastPracticed: values.reduce<string | null>(
      (latest, stat) =>
        stat.last_practiced && (!latest || stat.last_practiced > latest) ? stat.last_practiced : latest,
      null,
    ),
  };
}

/** Mastery of a scope = average mastery over every question in that scope (unpracticed = 0). */
export function getMasteryForQuestions(ids: string[]) {
  if (ids.length === 0) return 0;
  const total = ids.reduce((sum, id) => sum + getQuestionStat(id).mastery, 0);
  return Math.round(total / ids.length);
}

export function getMaterialMastery(materialId: string) {
  return getMasteryForQuestions(questions.filter((q) => q.material === materialId).map((q) => q.id));
}

export function getSubtestMastery(subtestId: string) {
  return getMasteryForQuestions(questions.filter((q) => q.subtest === subtestId).map((q) => q.id));
}

export function getExamMastery(examId: string) {
  return getMasteryForQuestions(questions.filter((q) => q.exam === examId).map((q) => q.id));
}

export function getWeakMaterials(limit = 5) {
  return materials
    .map((material) => ({
      material,
      ...getScopeStats((stat) => stat.material === material.id),
      mastery: getMaterialMastery(material.id),
    }))
    .filter((entry) => entry.attempts > 0)
    .sort((a, b) => a.accuracy - b.accuracy || a.mastery - b.mastery)
    .slice(0, limit);
}

export type Range = "day" | "week" | "month" | "all";

const rangeDays: Record<Range, number | null> = { day: 1, week: 7, month: 30, all: null };

export function getDailySeries(days: number) {
  const data = load();
  const series: DayRecord[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = dateKey(date);
    series.push(data.days[key] ?? { date: key, questions: 0, correct: 0, seconds: 0 });
  }
  return series;
}

export type ActivityPoint = DayRecord & {
  accuracy: number | null;
};

/** Daily activity for a fixed window, or the learner's complete recorded history. */
export function getActivitySeries(range: "week" | "month" | "all", materialId?: string): ActivityPoint[] {
  const data = load();
  const relevantAttempts = materialId
    ? data.attempts.filter((attempt) => attempt.material === materialId)
    : data.attempts;

  if (range === "all") {
    const buckets = new Map<string, DayRecord>();
    relevantAttempts.forEach((attempt) => {
      const key = dateKey(new Date(attempt.at));
      const day = buckets.get(key) ?? { date: key, questions: 0, correct: 0, seconds: 0 };
      buckets.set(key, {
        date: key,
        questions: day.questions + 1,
        correct: day.correct + (attempt.correct ? 1 : 0),
        seconds: day.seconds + attempt.time_taken,
      });
    });
    return [...buckets.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({ ...day, accuracy: day.questions ? Math.round((day.correct / day.questions) * 100) : null }));
  }

  const days = range === "week" ? 7 : 30;
  if (!materialId) {
    return getDailySeries(days).map((day) => ({
      ...day,
      accuracy: day.questions ? Math.round((day.correct / day.questions) * 100) : null,
    }));
  }

  const series: ActivityPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = dateKey(date);
    const attempts = relevantAttempts.filter((attempt) => dateKey(new Date(attempt.at)) === key);
    const correct = attempts.filter((attempt) => attempt.correct).length;
    series.push({
      date: key,
      questions: attempts.length,
      correct,
      seconds: attempts.reduce((sum, attempt) => sum + attempt.time_taken, 0),
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
    });
  }
  return series;
}

export function getOverview(range: Range = "all") {
  const data = load();
  const limit = rangeDays[range];
  let attempts = data.attempts;

  if (limit) {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (limit - 1));
    attempts = attempts.filter((attempt) => new Date(attempt.at) >= from);
  }

  const total = attempts.length;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const seconds = attempts.reduce((sum, attempt) => sum + attempt.time_taken, 0);

  return {
    total,
    correct,
    incorrect: total - correct,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    averageTime: total ? Math.round(seconds / total) : 0,
    studySeconds: seconds,
  };
}

export function getCompletionForQuestions(ids: string[]) {
  const touched = ids.filter((id) => getQuestionStat(id).attempts > 0).length;
  return {
    completed: touched,
    total: ids.length,
    percentage: ids.length ? Math.round((touched / ids.length) * 100) : 0,
  };
}

export function getLastPracticed() {
  const attempts = load().attempts;
  return attempts.length ? attempts[attempts.length - 1]?.at ?? null : null;
}

export function getStreak() {
  const data = load();
  const activeDates = Object.values(data.days)
    .filter((day) => day.questions > 0)
    .map((day) => day.date)
    .sort();

  if (activeDates.length === 0) return { current: 0, longest: 0, activeDates: [] as string[] };

  const asDate = (value: string) => new Date(`${value}T00:00:00`);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < activeDates.length; i += 1) {
    const diff = (asDate(activeDates[i]!).getTime() - asDate(activeDates[i - 1]!).getTime()) / 86_400_000;
    run = diff === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const last = activeDates[activeDates.length - 1];

  let current = 0;
  if (last === today || last === dateKey(yesterdayDate)) {
    current = 1;
    for (let i = activeDates.length - 1; i > 0; i -= 1) {
      const diff = (asDate(activeDates[i]!).getTime() - asDate(activeDates[i - 1]!).getTime()) / 86_400_000;
      if (diff === 1) current += 1;
      else break;
    }
  }

  return { current, longest: Math.max(longest, current), activeDates };
}

export function getContinueMaterial() {
  const data = load();
  const last = [...data.attempts].reverse().find((attempt) => materialById(attempt.material));
  return last ? materialById(last.material) : materials.find((material) => material.examId === "skd");
}

export function formatDuration(seconds: number) {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
