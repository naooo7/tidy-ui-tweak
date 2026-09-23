import { questions, questionsForMaterial, type Question } from "@/data/questions";
import {
  getMistakeQuestionIds,
  getQuestionStat,
  getReviewQuestionIds,
  MASTERED_THRESHOLD,
} from "@/services/user-data";

export type SessionSource = "practice" | "review" | "mistakes" | "custom" | "today";

export type SessionFilters = {
  source: SessionSource;
  exam?: string | undefined;
  /** subtest id, e.g. "skd-tiu" */
  subtest?: string | undefined;
  materials?: string[] | undefined;
  count: number;
  /** "All" | "Easy" | "Medium" | "Hard" */
  difficulty: string;
  /** "All" | "Unanswered" | "Incorrect" | "Needs Review" | "Mastered" */
  status: string;
  challenge: boolean;
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function matchesStatus(questionId: string, status: string) {
  const stat = getQuestionStat(questionId);
  switch (status) {
    case "Unanswered":
      return stat.attempts === 0;
    case "Incorrect":
      return stat.incorrect > 0;
    case "Needs Review":
      return stat.needs_review;
    case "Mastered":
      return stat.mastery >= MASTERED_THRESHOLD;
    default:
      return true;
  }
}

/** Builds the ordered question list for a drill from the active filters. */
export function selectQuestions(filters: SessionFilters): Question[] {
  let pool: Question[] = questions;

  if (filters.source === "review") {
    const ids = new Set(getReviewQuestionIds());
    pool = pool.filter((question) => ids.has(question.id));
  } else if (filters.source === "mistakes") {
    const ids = new Set(getMistakeQuestionIds());
    pool = pool.filter((question) => ids.has(question.id));
  }

  if (filters.exam) pool = pool.filter((question) => question.exam === filters.exam);
  if (filters.subtest) pool = pool.filter((question) => question.subtest === filters.subtest);
  if (filters.materials && filters.materials.length > 0) {
    const set = new Set(filters.materials);
    pool = pool.filter((question) => set.has(question.material));
  }
  if (filters.difficulty && filters.difficulty !== "All") {
    pool = pool.filter((question) => question.difficulty === filters.difficulty.toLowerCase());
  }
  if (filters.status && filters.status !== "All") {
    pool = pool.filter((question) => matchesStatus(question.id, filters.status));
  }

  return shuffle(pool).slice(0, Math.max(1, filters.count));
}

/** How many questions a given filter combination would actually produce. */
export function countAvailable(filters: SessionFilters) {
  return selectQuestions({ ...filters, count: Number.MAX_SAFE_INTEGER }).length;
}

export const materialQuestionCount = (materialId: string) => questionsForMaterial(materialId).length;

export const CHALLENGE_SECONDS = 60;
