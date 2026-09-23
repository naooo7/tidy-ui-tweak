import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Dumbbell, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metric, Page, PageTitle, Surface, TrendChart } from "@/components/app-ui";
import { materialById, subtestById } from "@/data/catalog";
import { questionsForMaterial } from "@/data/questions";
import { getActivitySeries, getCompletionForQuestions, getMaterialMastery, getScopeStats } from "@/services/user-data";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/material/$materialId")({
  loader: ({ params }) => {
    if (!materialById(params.materialId)) throw notFound();
    return null;
  },
  head: ({ params }) => {
    const material = materialById(params.materialId);
    return {
      meta: [
        { title: `${material?.name ?? "Material"} — FastLearner` },
        { name: "description", content: "Review mastery, performance, and practice this material." },
        { property: "og:title", content: `${material?.name ?? "Material"} — FastLearner` },
        { property: "og:description", content: "Review mastery, performance, and practice this material." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MaterialPage,
});

function MaterialPage() {
  const { materialId } = Route.useParams();
  useUserData();
  const material = materialById(materialId);
  if (!material) return null;
  const subtest = subtestById(material.subtestId);
  const availableQuestions = questionsForMaterial(material.id);
  const mastery = getMaterialMastery(material.id);
  const stats = getScopeStats((stat) => stat.material === material.id);
  const completion = getCompletionForQuestions(availableQuestions.map((question) => question.id));
  const performance = getActivitySeries("month", material.id).filter((day) => day.questions > 0).slice(-7);
  const drillSearch = {
    exam: material.examId,
    material: material.id,
    count: Math.max(1, Math.min(20, availableQuestions.length || 10)),
    difficulty: "All",
    status: "All",
    challenge: false,
  };

  return (
    <Page narrow>
      <PageTitle
        eyebrow={`${material.examId.toUpperCase()} · ${subtest?.name ?? ""}`}
        title={material.name}
        back={subtest ? `/learn/${material.examId}/${subtest.code}` : "/learn"}
      />
      <Surface>
        <div className="grid grid-cols-3 gap-5 border-b border-border pb-6">
          <Metric label="Mastery" value={`${mastery}%`} />
           <Metric label="Completed" value={`${completion.completed}/${completion.total}`} />
          <Metric label="Accuracy" value={`${stats.accuracy}%`} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => window.alert("A concise lesson preview would open here.")}>
            <BookOpen /> Learn
          </Button>
          <Button asChild disabled={availableQuestions.length === 0}>
            <Link to="/question" search={{ source: "practice", ...drillSearch }}>
              <Dumbbell /> Practice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/question" search={{ source: "review", ...drillSearch }}>
              <RotateCcw /> Review
            </Link>
          </Button>
        </div>
        {availableQuestions.length === 0 && (
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Question content is being prepared for this material. The catalog is ready for questions to be added without
            changing this page.
          </p>
        )}
      </Surface>
      <Surface className="mt-5">
        <h2 className="font-display text-xl font-bold">Recent Performance</h2>
         <p className="mt-1 text-sm text-muted-foreground">Accuracy across your latest active days</p>
        <div className="mt-7">
           <TrendChart label="Recent material accuracy" unit="%" data={performance.map((day) => ({ label: day.date.slice(5), value: day.accuracy }))} />
        </div>
      </Surface>
      <Surface className="mt-5">
        <h2 className="font-display text-xl font-bold">Your Progress</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Metric label="Attempted" value={stats.attempts} />
          <Metric label="Correct" value={stats.correct} />
          <Metric label="Incorrect" value={stats.incorrect} />
          <Metric label="Average time" value={`${stats.averageTime}s`} />
          <Metric label="Last practiced" value={stats.lastPracticed ?? "—"} />
        </div>
      </Surface>
    </Page>
  );
}
