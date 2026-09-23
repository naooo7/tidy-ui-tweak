import { createFileRoute, notFound } from "@tanstack/react-router";
import { LinkRow, Page, PageTitle, ProgressBar } from "@/components/app-ui";
import { examById, findSubtest, materialsForSubtest } from "@/data/catalog";
import { questionsForMaterial } from "@/data/questions";
import { getCompletionForQuestions, getMaterialMastery, getScopeStats } from "@/services/user-data";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/learn/$examId/$subtestId")({
  loader: ({ params }) => {
    if (!findSubtest(params.examId, params.subtestId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const subtest = findSubtest(params.examId, params.subtestId);
    const title = `${subtest?.name ?? "Subtest"} — FastLearner`;
    const description = subtest
      ? `${subtest.fullName}: choose a material to study or practice.`
      : "Choose a material to study or practice.";
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
  component: SubtestPage,
});

function SubtestPage() {
  const { examId, subtestId } = Route.useParams();
  useUserData();
  const exam = examById(examId);
  const subtest = findSubtest(examId, subtestId);
  if (!exam || !subtest) return null;

  return (
    <Page narrow>
      <PageTitle
        eyebrow={exam.name}
        title={subtest.name}
        subtitle={`${subtest.fullName} · choose a material to study or practice.`}
        back={`/learn/${exam.id}`}
      />
      <div className="space-y-2 sm:space-y-3">
        {materialsForSubtest(subtest.id).map((material) => {
          const mastery = getMaterialMastery(material.id);
          const materialQuestions = questionsForMaterial(material.id);
          const completion = getCompletionForQuestions(materialQuestions.map((question) => question.id));
          const stats = getScopeStats((stat) => stat.material === material.id);
          return (
            <LinkRow
              key={material.id}
              to={`/material/${material.id}`}
              title={material.name}
              subtitle={`${completion.completed}/${completion.total} completed · ${stats.attempts ? `${stats.accuracy}% accuracy` : "Not started"}`}
              trailing={
                <div className="hidden w-28 sm:block">
                  <div className="mb-1 text-right text-xs font-semibold text-muted-foreground">{mastery}%</div>
                  <ProgressBar value={mastery} />
                </div>
              }
            />
          );
        })}
      </div>
    </Page>
  );
}
