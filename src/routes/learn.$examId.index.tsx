import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Page, PageTitle, ProgressBar, Surface } from "@/components/app-ui";
import { examById, materialsForSubtest, subtestsForExam } from "@/data/catalog";
import { questionsForSubtest } from "@/data/questions";
import { getCompletionForQuestions, getScopeStats, getSubtestMastery } from "@/services/user-data";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/learn/$examId/")({
  loader: ({ params }) => {
    const exam = examById(params.examId);
    if (!exam) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const exam = examById(params.examId);
    const title = `${exam?.name ?? "Exam"} — FastLearner`;
    const description = exam
      ? `Study every ${exam.name} subtest and build mastery.`
      : "Study materials on FastLearner.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ExamPage,
});

function ExamPage() {
  const { examId } = Route.useParams();
  useUserData();
  const exam = examById(examId);
  if (!exam) return null;
  const subtests = subtestsForExam(exam.id);

  return (
    <Page>
      <PageTitle title={exam.name} subtitle={`${exam.fullName} · build mastery across every subtest.`} back="/learn" />
      <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
        {subtests.map((subtest) => {
          const subtestMaterials = materialsForSubtest(subtest.id);
          const mastery = getSubtestMastery(subtest.id);
          const subtestQuestions = questionsForSubtest(subtest.id);
          const completion = getCompletionForQuestions(subtestQuestions.map((question) => question.id));
          const stats = getScopeStats((stat) => stat.subtest === subtest.id);
          const single = subtestMaterials.length === 1 ? subtestMaterials[0] : null;
          const content = (
            <Surface className="group h-full transition-all hover:-translate-y-1 hover:shadow-float">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{subtest.fullName}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold">{subtest.name}</h2>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-5 sm:mt-10">
                <div className="mb-2 flex justify-between text-sm">
                  <span>
                    {subtestMaterials.length} {subtestMaterials.length === 1 ? "Material" : "Materials"} ·{" "}
                     {completion.completed}/{completion.total} completed
                  </span>
                   <strong>{stats.attempts ? `${stats.accuracy}% accuracy` : "Not started"}</strong>
                </div>
                <ProgressBar value={mastery} />
              </div>
            </Surface>
          );

          return single ? (
            <Link key={subtest.id} to="/material/$materialId" params={{ materialId: single.id }}>
              {content}
            </Link>
          ) : (
            <Link
              key={subtest.id}
              to="/learn/$examId/$subtestId"
              params={{ examId: exam.id, subtestId: subtest.code }}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
