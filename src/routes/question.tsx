import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metric, Page, ProgressBar, Surface } from "@/components/app-ui";
import { examById, materialById, subtestById } from "@/data/catalog";
import type { Question } from "@/data/questions";
import { CHALLENGE_SECONDS, selectQuestions, type SessionFilters } from "@/services/session";
import { getQuestionStat, recordAttempt, setNeedsReview } from "@/services/user-data";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

const flag = z.union([z.boolean(), z.string()]).optional();
const num = z.union([z.number(), z.string()]).optional();

const searchSchema = z.object({
  source: z.string().optional().default("practice"),
  exam: z.string().optional(),
  subtest: z.string().optional(),
  materials: z.string().optional(),
  material: z.string().optional(),
  count: num.transform((value) => Number(value ?? 10) || 10),
  difficulty: z.string().optional().default("All"),
  status: z.string().optional().default("All"),
  challenge: flag.transform((value) => value === true || value === "true"),
});

export const Route = createFileRoute("/question")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Practice — FastLearner" },
      { name: "description", content: "Answer focused questions and learn from clear explanations." },
      { property: "og:title", content: "Practice — FastLearner" },
      { property: "og:description", content: "Answer focused questions and learn from clear explanations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuestionPage,
});

type Result = {
  questionId: string;
  material: string;
  correct: boolean;
  selected: number | null;
  time_taken: number;
  estimated_time: number | null;
  timed_out: boolean;
};

const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

function QuestionPage() {
  const search = Route.useSearch();
  useUserData();

  const filters = useMemo<SessionFilters>(() => {
    const materials = search.materials
      ? search.materials.split(",").filter(Boolean)
      : search.material
        ? [search.material]
        : undefined;
    return {
      source: (search.source as SessionFilters["source"]) ?? "practice",
      exam: search.exam,
      subtest: search.subtest,
      materials,
      count: search.count,
      difficulty: search.difficulty,
      status: search.status,
      challenge: search.challenge,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.source, search.exam, search.subtest, search.materials, search.material, search.count, search.difficulty, search.status, search.challenge]);

  // Built on the client only: selection is random and reads stored progress.
  const [session, setSession] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    setSession(selectQuestions(filters));
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setElapsed(0);
    setResults([]);
    setDone(false);
    submittedRef.current = false;
  }, [filters]);

  const question = session?.[index];

  const submit = useCallback(
    (choice: number | null, timedOut: boolean) => {
      if (!question || submittedRef.current) return;
      submittedRef.current = true;
      const correct = choice !== null && choice === question.correct_answer;
      const timeTaken = Math.max(1, elapsed);
      recordAttempt({
        questionId: question.id,
        selected: choice,
        correct,
        time_taken: timeTaken,
        estimated_time: question.estimated_time ?? 0,
        timed_out: timedOut,
        mode: search.challenge ? "challenge" : (search.source ?? "practice"),
      });
      if (!correct) setNeedsReview(question.id, true);
      setResults((current) => [
        ...current,
        {
          questionId: question.id,
          material: question.material,
          correct,
          selected: choice,
          time_taken: timeTaken,
          estimated_time: question.estimated_time,
          timed_out: timedOut,
        },
      ]);
      setSubmitted(true);
    },
    [question, elapsed, search.challenge, search.source],
  );

  // One shared ticker: counts the real time spent and ends challenge questions.
  useEffect(() => {
    if (!question || submitted || done) return;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [question, submitted, done, index]);

  useEffect(() => {
    if (search.challenge && !submitted && question && elapsed >= CHALLENGE_SECONDS) {
      submit(selected, true);
    }
  }, [elapsed, search.challenge, submitted, question, selected, submit]);

  const next = () => {
    if (!session) return;
    if (index === session.length - 1) {
      setDone(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setSubmitted(false);
    setElapsed(0);
    submittedRef.current = false;
  };

  if (session === null) {
    return (
      <Page narrow>
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-muted-foreground">Preparing your questions…</p>
        </div>
      </Page>
    );
  }

  if (session.length === 0) {
    return (
      <Page narrow>
        <div className="flex min-h-[70vh] items-center justify-center">
          <Surface className="w-full text-center">
            <h1 className="font-display text-2xl font-bold">No questions match this selection</h1>
            <p className="mt-2 text-muted-foreground">
              Try widening the difficulty or status filter, or pick more materials.
            </p>
            <div className="mt-7 flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/learn">Browse Materials</Link>
              </Button>
              <Button asChild>
                <Link to="/drill">Build a Drill</Link>
              </Button>
            </div>
          </Surface>
        </div>
      </Page>
    );
  }

  if (done) return <ResultSummary results={results} />;
  if (!question) return null;

  const material = materialById(question.material);
  const subtest = subtestById(question.subtest);
  const exam = examById(question.exam);
  const correct = selected === question.correct_answer;
  const flagged = getQuestionStat(question.id).needs_review;
  const remaining = Math.max(0, CHALLENGE_SECONDS - elapsed);

  return (
    <Page narrow>
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Exit
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "glass-timer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
              search.challenge && remaining <= 10 ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Timer className="h-4 w-4" />
            {search.challenge ? formatClock(remaining) : formatClock(elapsed)}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(session.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <ProgressBar value={((index + (submitted ? 1 : 0)) / session.length) * 100} />

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-primary">
            {exam?.name ?? question.exam.toUpperCase()} · {subtest?.name ?? question.subtest.toUpperCase()} · {material?.name ?? question.material}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {question.difficulty && <span className="rounded-full bg-secondary px-2.5 py-1 capitalize">{question.difficulty}</span>}
            {question.estimated_time !== null && <span className="rounded-full bg-secondary px-2.5 py-1">~{question.estimated_time}s</span>}
          </div>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold leading-relaxed md:text-3xl">{question.question}</h1>

        <div className="mt-8 space-y-3">
          {question.options.map((option, choice) => {
            const isCorrect = choice === question.correct_answer;
            const chosen = choice === selected;
            return (
              <Button
                key={option}
                type="button"
                onClick={() => !submitted && setSelected(choice)}
                className={cn(
                  "h-auto min-h-16 w-full justify-start whitespace-normal rounded-2xl border bg-card p-4 text-left text-answer-default transition-all active:scale-[0.99]",
                  !submitted && !chosen && "border-border hover:border-primary hover:bg-answer-hover hover:text-answer-hover-foreground hover:shadow-soft",
                  !submitted && chosen && "border-answer-selected-border bg-answer-selected text-answer-selected-foreground",
                  submitted && isCorrect && "border-answer-correct-border bg-answer-correct text-answer-correct-foreground",
                  submitted && chosen && !isCorrect && "border-answer-incorrect-border bg-answer-incorrect text-answer-incorrect-foreground",
                  submitted && !chosen && !isCorrect && "border-border bg-answer-disabled text-answer-disabled-foreground",
                )}
                disabled={submitted}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current bg-background/80 font-semibold text-inherit">
                  {String.fromCharCode(65 + choice)}
                </span>
                <span className="font-medium">{option}</span>
                {submitted && isCorrect && <Check className="ml-auto h-5 w-5 shrink-0 text-success" />}
                {submitted && chosen && !isCorrect && <X className="ml-auto h-5 w-5 shrink-0 text-destructive" />}
              </Button>
            );
          })}
        </div>

        {!submitted && (
             <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNeedsReview(question.id, !flagged)}
              className="sm:w-auto"
            >
              {flagged ? <BookmarkCheck /> : <Bookmark />}
              {flagged ? "Marked for review" : "Mark for review"}
            </Button>
            <Button size="lg" className="sm:min-w-44" disabled={selected === null} onClick={() => submit(selected, false)}>
              Submit Answer
            </Button>
          </div>
        )}

        {submitted && (
          <Surface className="mt-6 animate-rise">
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 font-display text-lg font-bold",
                correct ? "text-success" : "text-destructive",
              )}
            >
              {correct ? (
                <>
                  <Check /> Correct
                </>
              ) : (
                <>
                  <X /> {selected === null ? "Time's up" : "Incorrect"} · Correct answer:{" "}
                  {String.fromCharCode(65 + question.correct_answer)}
                </>
              )}
            </div>
            <div className={cn("mt-4 grid gap-4 border-y border-border py-4 text-sm", question.estimated_time === null ? "grid-cols-1" : "grid-cols-2")}>
              <div>
                <p className="text-muted-foreground">Your time</p>
                <p className="mt-1 font-semibold">{elapsed}s</p>
              </div>
              {question.estimated_time !== null && <div>
                <p className="text-muted-foreground">Estimated time</p>
                <p className="mt-1 font-semibold">{question.estimated_time}s</p>
              </div>}
            </div>
            {question.explanation && <><h2 className="mt-5 font-display font-bold">Explanation</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{question.explanation}</p></>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setNeedsReview(question.id, !flagged)}>
                {flagged ? <BookmarkCheck /> : <Bookmark />}
                {flagged ? "Marked for review" : "Mark for review"}
              </Button>
               <Button size="lg" onClick={next} className="w-full sm:w-auto sm:min-w-44">
                {index === session.length - 1 ? "Finish Drill" : "Next Question"}
                <ArrowRight />
              </Button>
            </div>
          </Surface>
        )}
      </div>
    </Page>
  );
}

function ResultSummary({ results }: { results: Result[] }) {
  useUserData();
  const total = results.length;
  const correct = results.filter((result) => result.correct).length;
  const totalTime = results.reduce((sum, result) => sum + result.time_taken, 0);
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const average = total ? Math.round(totalTime / total) : 0;
  const materialsPracticed = [...new Set(results.map((result) => result.material))];
  const reviewList = results.filter((result) => getQuestionStat(result.questionId).needs_review);

  return (
    <Page narrow>
      <Surface className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Drill complete</h1>
        <p className="mt-2 text-muted-foreground">
          You answered {correct} of {total} questions correctly.
        </p>
      </Surface>

      <Surface className="mt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Metric label="Score" value={`${correct}/${total}`} />
          <Metric label="Accuracy" value={`${accuracy}%`} />
          <Metric label="Correct" value={correct} />
          <Metric label="Incorrect" value={total - correct} />
          <Metric label="Average time" value={`${average}s`} />
          <Metric label="Total time" value={formatClock(totalTime)} />
        </div>
      </Surface>

      <Surface className="mt-5">
        <h2 className="font-display text-xl font-bold">Materials practiced</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {materialsPracticed.map((materialId) => (
            <Link
              key={materialId}
              to="/material/$materialId"
              params={{ materialId }}
              className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground"
            >
              {materialById(materialId)?.name ?? materialId}
            </Link>
          ))}
        </div>
      </Surface>

      <Surface className="mt-5">
        <h2 className="font-display text-xl font-bold">Needs review</h2>
        {reviewList.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Nothing flagged in this session. Nice work.</p>
        ) : (
          <p className="mt-2 text-muted-foreground">
            {reviewList.length} question{reviewList.length > 1 ? "s" : ""} from this drill are marked for review.
          </p>
        )}
      </Surface>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
         {reviewList.length ? <Button className="flex-1" asChild><Link to="/question" search={{ source: "review", count: 10, difficulty: "All", status: "All", challenge: false }}>Review Now</Link></Button> : <Button type="button" className="flex-1" disabled>Review Now</Button>}
        <Button variant="outline" className="flex-1" asChild>
          <Link to="/progress">View Progress</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link to="/">Back Home</Link>
        </Button>
      </div>
    </Page>
  );
}
