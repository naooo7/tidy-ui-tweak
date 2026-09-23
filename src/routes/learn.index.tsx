import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Page, PageTitle, ProgressBar, Surface } from "@/components/app-ui";
import { exams, subtestsForExam } from "@/data/catalog";
import { questionsForExam } from "@/data/questions";
import { getCompletionForQuestions, getExamMastery, getScopeStats } from "@/services/user-data";
import { useUserData } from "@/hooks/use-user-data";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn — FastLearner" },
      { name: "description", content: "Choose an exam and build mastery topic by topic." },
      { property: "og:title", content: "Learn — FastLearner" },
      { property: "og:description", content: "Choose an exam and build mastery topic by topic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  useUserData();

  return (
    <Page>
      <PageTitle title="Learn" subtitle="Choose what you want to study." />
      <div className="grid gap-5 md:grid-cols-2">
        {exams.map((exam) => {
          const mastery = getExamMastery(exam.id);
          const examQuestions = questionsForExam(exam.id);
          const completion = getCompletionForQuestions(examQuestions.map((question) => question.id));
          const stats = getScopeStats((stat) => stat.exam === exam.id);
          return (
            <Link key={exam.id} to="/learn/$examId" params={{ examId: exam.id }} className="group">
              <Surface className="flex min-h-60 flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-float">
                <BookOpenCheck className="h-7 w-7 text-primary" />
                <div>
                  <h2 className="font-display text-3xl font-bold">{exam.name}</h2>
                  <p className="mt-2 text-muted-foreground">{exam.fullName}</p>
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        {completion.completed}/{completion.total} completed · {stats.attempts ? `${stats.accuracy}% accuracy` : "Not started"}
                      </span>
                       <strong>{completion.percentage}%</strong>
                    </div>
                    <ProgressBar value={mastery} />
                  </div>
                  <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore materials
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Surface>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
