import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Flame, RotateCcw, Target } from "lucide-react";
import { DEFAULT_TAGLINE } from "@/services/profile-preferences";

import { Button } from "@/components/ui/button";
import { Metric, Page, ProgressBar, Surface, TrendChart } from "@/components/app-ui";
import { useTheme } from "@/hooks/use-theme";
import { useUserData } from "@/hooks/use-user-data";
import { useProfilePreferences } from "@/hooks/use-profile-preferences";
import { cn } from "@/lib/utils";
import { questionsForMaterial } from "@/data/questions";
import {
  formatDuration,
  getActivitySeries,
  getContinueMaterial,
  getOverview,
  getReviewQuestionIds,
  getStreak,
  getWeakMaterials,
} from "@/services/user-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Home — FastLearner" }, { name: "description", content: "Your focused daily study plan and progress." }, { property: "og:title", content: "Home — FastLearner" }, { property: "og:description", content: "Your focused daily study plan and progress." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: HomePage,
});

function HomePage() {
  useUserData();
  const profile = useProfilePreferences();
  const { targetInstitution, institutionThemeEnabled } = useTheme();
  const hasInstitution = Boolean(targetInstitution);
  const streak = getStreak();
  const week = getOverview("week");
  const reviewCount = getReviewQuestionIds().length;
  const continueMaterial = getContinueMaterial();
  const focus = getWeakMaterials(1)[0];
  const focusMaterial = focus?.material ?? continueMaterial;
  const focusCount = Math.min(15, questionsForMaterial(focusMaterial?.id ?? "").length);
  const activity = getActivitySeries("week");
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return <Page>
    <section className={cn("home-hero relative mb-5 min-h-40 overflow-hidden rounded-2xl border p-5 shadow-soft transition-all duration-500 animate-rise sm:min-h-44 sm:rounded-3xl sm:p-6 md:mb-7 md:min-h-48 md:p-8", institutionThemeEnabled && hasInstitution && "home-hero-themed")}>
      <div className="home-hero-reflection pointer-events-none absolute inset-0" />
      {targetInstitution && <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[42%] items-center justify-center sm:w-[38%]">
        <div className="home-hero-logo-glow absolute size-32 rounded-full sm:size-40 md:size-48" />
        <img src={targetInstitution.logo} alt="" className="home-hero-logo h-32 w-36 object-contain sm:h-40 sm:w-44 md:h-48 md:w-56" />
      </div>}
      <div className="relative z-10 flex min-h-30 max-w-[78%] flex-col justify-between sm:min-h-32 sm:max-w-[72%] md:min-h-32 md:max-w-[68%]">
        <div>
          <h1 className="font-display text-2xl font-bold text-card-foreground sm:text-3xl md:text-4xl">{greeting}{profile.displayName && profile.displayName !== "Your Profile" ? `, ${profile.displayName}` : ""}</h1>
          <p className="mt-1 max-w-xl text-sm leading-5 text-muted-foreground sm:mt-2 sm:text-base">{profile.tagline?.trim() || DEFAULT_TAGLINE}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2 sm:mt-5 sm:gap-x-6">
          <p className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:text-sm"><Flame className="h-3.5 w-3.5" /> {streak.current > 0 ? `${streak.current} day streak` : "Start your streak"}</p>
          {targetInstitution && <div className="min-w-0 border-l border-border/70 pl-4 sm:pl-6">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Target</p>
            <p className="truncate font-display text-sm font-bold text-card-foreground sm:text-base">{targetInstitution.shortName}</p>
          </div>}
        </div>
      </div>
    </section>

    <section>
      <Surface className="p-3.5 sm:p-4 md:p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Target className="h-5 w-5" /></div><p className="text-sm font-medium text-muted-foreground">Today’s Focus</p></div><h2 className="mt-2.5 font-display text-xl font-bold">{focus ? focus.material.name : "Build your baseline"}</h2><p className="mt-0.5 text-sm text-muted-foreground">{focus ? `${focus.accuracy}% accuracy · recommended practice` : "Practice a few questions to reveal your weak areas."}</p></div>
          {focus && <div className="hidden w-28 pt-1 sm:block"><div className="mb-1.5 flex justify-between text-xs"><span>Mastery</span><strong>{focus.mastery}%</strong></div><ProgressBar value={focus.mastery} /></div>}
        </div>
        <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">{focus && <div className="sm:hidden"><div className="mb-1.5 flex justify-between text-xs"><span>Mastery</span><strong>{focus.mastery}%</strong></div><ProgressBar value={focus.mastery} /></div>}<Button asChild className="min-h-11 w-full sm:w-auto" disabled={!focusMaterial || focusCount === 0}><Link to="/question" search={{ source: "today", material: focusMaterial?.id, count: Math.max(1, focusCount), difficulty: "All", status: "All", challenge: false }}>Practice Focus <ArrowRight /></Link></Button></div>
      </Surface>
    </section>


    <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <Surface className="p-3.5 sm:p-4 md:p-5">{reviewCount ? <><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground"><RotateCcw className="h-5 w-5" /></div><div className="min-w-0"><h2 className="font-display text-xl font-bold">Needs Review</h2><p className="text-sm text-muted-foreground">{reviewCount} question{reviewCount === 1 ? "" : "s"} waiting for another look</p></div></div><Button asChild variant="outline" className="mt-3 min-h-11 w-full"><Link to="/question" search={{ source: "review", count: 10, difficulty: "All", status: "All", challenge: false }}>Review Now</Link></Button></> : <div className="flex min-h-11 items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground"><RotateCcw className="h-5 w-5" /></div><div className="min-w-0"><h2 className="font-display text-base font-bold sm:text-lg">Needs Review</h2><p className="text-sm text-muted-foreground">Nothing is waiting for review.</p></div></div>}</Surface>
      <Surface className="p-3.5 sm:p-4 md:p-5"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="min-w-0"><p className="text-sm text-muted-foreground">This Week</p><h2 className="truncate font-display text-lg font-bold">{week.total ? "Your current pace" : "No activity yet"}</h2></div><BookOpen className="h-5 w-5 shrink-0 text-primary" /></div><div className="mt-3 grid grid-cols-3 gap-2 border-y border-border py-2.5"><Metric label="Accuracy" value={week.total ? `${week.accuracy}%` : "—"} /><Metric label="Questions" value={week.total} /><Metric label="Study time" value={formatDuration(week.studySeconds)} /></div><div className="pt-2.5"><TrendChart compact label="Questions practiced this week" data={activity.map((day) => ({ label: day.date.slice(5), value: day.questions || null }))} /></div></Surface>
    </section>
  </Page>;
}