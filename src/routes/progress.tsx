import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metric, Page, PageTitle, ProgressBar, Surface, TrendChart } from "@/components/app-ui";
import { exams, materials, subtests } from "@/data/catalog";
import { questionsForExam } from "@/data/questions";
import { useUserData } from "@/hooks/use-user-data";
import {
  formatDuration,
  getActivitySeries,
  getCompletionForQuestions,
  getExamMastery,
  getLastPracticed,
  getOverview,
  getReviewQuestionIds,
  getScopeStats,
  getStreak,
  getWeakMaterials,
  type Range,
} from "@/services/user-data";

export const Route = createFileRoute("/progress")({ head: () => ({ meta: [{ title: "Progress — FastLearner" }, { name: "description", content: "Understand your accuracy, study activity, and weak areas." }, { property: "og:title", content: "Progress — FastLearner" }, { property: "og:description", content: "Understand your accuracy, study activity, and weak areas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: ProgressPage });

const options: Array<{ label: string; value: Range }> = [{ label: "7D", value: "week" }, { label: "30D", value: "month" }, { label: "All", value: "all" }];
const shortDate = (date: string) => date.slice(5);

function ProgressPage() {
  useUserData();
  const [range, setRange] = useState<Range>("week");
  const overview = getOverview(range);
  const streak = getStreak();
  const reviewCount = getReviewQuestionIds().length;
  const weakAreas = getWeakMaterials();
  const series = getActivitySeries(range === "week" ? "week" : range === "month" ? "month" : "all");
  const lastPracticed = getLastPracticed();

  return <Page><PageTitle title="Progress" subtitle="Every number below comes from your saved practice activity." />
    <div className="mb-6 flex w-fit gap-1 rounded-xl bg-secondary p-1">{options.map((item) => <Button key={item.value} type="button" size="sm" variant={range === item.value ? "secondary" : "ghost"} onClick={() => setRange(item.value)}>{item.label}</Button>)}</div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Surface><Metric label="Accuracy" value={overview.total ? `${overview.accuracy}%` : "—"} /></Surface><Surface><Metric label="Questions" value={overview.total} /></Surface><Surface><Metric label="Study Time" value={formatDuration(overview.studySeconds)} /></Surface><Surface><Metric label="Current Streak" value={`${streak.current} day${streak.current === 1 ? "" : "s"}`} /></Surface></div>

    <div className="mt-5 grid gap-5 lg:grid-cols-2"><Surface><h2 className="font-display text-xl font-bold">Study activity</h2><p className="mt-1 text-sm text-muted-foreground">Questions practiced per day</p><div className="mt-6"><TrendChart label="Questions practiced over time" data={series.map((day) => ({ label: shortDate(day.date), value: day.questions || null }))} /></div></Surface><Surface><h2 className="font-display text-xl font-bold">Accuracy trend</h2><p className="mt-1 text-sm text-muted-foreground">Accuracy on days you practiced</p><div className="mt-6"><TrendChart label="Accuracy trend" unit="%" data={series.map((day) => ({ label: shortDate(day.date), value: day.accuracy }))} /></div></Surface></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><Surface><h2 className="font-display text-xl font-bold">Study time</h2><p className="mt-1 text-sm text-muted-foreground">Minutes spent answering questions</p><div className="mt-6"><TrendChart label="Study time over time" unit="m" data={series.map((day) => ({ label: shortDate(day.date), value: day.seconds ? Math.max(1, Math.round(day.seconds / 60)) : null }))} /></div></Surface><Surface><h2 className="font-display text-xl font-bold">Activity details</h2><div className="mt-6 grid grid-cols-2 gap-6"><Metric label="Correct" value={overview.correct} /><Metric label="Incorrect" value={overview.incorrect} /><Metric label="Avg. time" value={overview.total ? `${overview.averageTime}s` : "—"} /><Metric label="Longest streak" value={`${streak.longest}d`} /></div><p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">Last practiced: {lastPracticed ? new Date(lastPracticed).toLocaleString() : "No activity yet"}</p></Surface></div>

    <div className="mt-5 grid gap-5 lg:grid-cols-2"><Surface><h2 className="font-display text-xl font-bold">Performance by exam</h2><div className="mt-6 space-y-5">{exams.map((exam) => { const ids = questionsForExam(exam.id).map((q) => q.id); const completion = getCompletionForQuestions(ids); const stats = getScopeStats((stat) => stat.exam === exam.id); return <div key={exam.id}><div className="mb-2 flex items-end justify-between gap-3 text-sm"><span><strong>{exam.name}</strong><span className="ml-2 text-muted-foreground">{completion.completed}/{completion.total} completed</span></span><strong>{stats.attempts ? `${stats.accuracy}%` : "—"}</strong></div><ProgressBar value={getExamMastery(exam.id)} /></div>; })}</div></Surface><Surface><h2 className="font-display text-xl font-bold">Subtest performance</h2><div className="mt-6 space-y-4">{subtests.map((subtest) => { const stats = getScopeStats((stat) => stat.subtest === subtest.id); return <div key={subtest.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"><div><p className="font-semibold">{subtest.name}</p><p className="text-sm text-muted-foreground">{stats.attempts} attempts</p></div><p className="font-display text-lg font-bold">{stats.attempts ? `${stats.accuracy}%` : "—"}</p></div>; })}</div></Surface></div>

    <div className="mt-5 grid gap-5 md:grid-cols-2"><Surface><h2 className="font-display text-xl font-bold">Weak materials</h2>{weakAreas.length ? <div className="mt-5 divide-y divide-border">{weakAreas.map(({ material, accuracy, mastery, attempts }) => <Link key={material.id} to="/material/$materialId" params={{ materialId: material.id }} className="flex items-center justify-between gap-3 py-4"><span><span className="block font-medium">{material.name}</span><span className="text-sm text-muted-foreground">{attempts} attempts · {mastery}% mastery</span></span><span className="flex items-center gap-2 font-semibold text-muted-foreground">{accuracy}%<ChevronRight className="h-4 w-4" /></span></Link>)}</div> : <p className="mt-4 text-muted-foreground">Practice questions to discover which materials need more attention.</p>}</Surface><Surface className="flex items-center justify-between gap-4"><div><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"><RotateCcw className="h-5 w-5" /></div><h2 className="font-display text-xl font-bold">Needs Review</h2><p className="mt-1 text-muted-foreground">{reviewCount} question{reviewCount === 1 ? "" : "s"}</p><p className="mt-2 text-sm text-muted-foreground">{materials.filter((material) => getScopeStats((stat) => stat.material === material.id && stat.needs_review).attempts > 0).length} materials affected</p></div>{reviewCount ? <Button asChild><Link to="/question" search={{ source: "review", count: 10, difficulty: "All", status: "All", challenge: false }}>Review</Link></Button> : <Button type="button" disabled>Review</Button>}</Surface></div>
  </Page>;
}