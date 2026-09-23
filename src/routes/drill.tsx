import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Page, PageTitle, Surface } from "@/components/app-ui";
import {
  exams,
  materialsForSubtest,
  subtestsForExam,
  type ExamId,
} from "@/data/catalog";
import { countAvailable } from "@/services/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/drill")({ head: () => ({ meta: [{ title: "Custom Drill — FastLearner" }, { name: "description", content: "Create a focused drill from your chosen SKD materials." }, { property: "og:title", content: "Custom Drill — FastLearner" }, { property: "og:description", content: "Create a focused drill from your chosen SKD materials." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: DrillPage });

function SelectPills({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) { return <div className="flex flex-wrap gap-2">{options.map((option) => { const active = value === option; return <button key={option} type="button" aria-pressed={active} onClick={() => onChange(option)} className={cn("glass-pill inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium sm:px-4", active && "glass-pill-active")}>{active && <Check className="h-4 w-4 text-primary" />}{option}</button>; })}</div>; }

function DrillPage() {
  const navigate = useNavigate({ from: "/drill" });
  const [exam, setExam] = useState<ExamId>("skd");
  const [subtest, setSubtest] = useState("skd-tiu");
  const [selected, setSelected] = useState<string[]>(["skd-tiu-4"]);
  const [count, setCount] = useState("15");
  const [difficulty, setDifficulty] = useState("All"); const [status, setStatus] = useState("All"); const [challenge, setChallenge] = useState(false);
  const availableSubtests = subtestsForExam(exam);
  const availableMaterials = materialsForSubtest(subtest);
  const availableQuestions = useMemo(() => countAvailable({
    source: "custom",
    exam,
    subtest,
    materials: selected,
    count: Number.MAX_SAFE_INTEGER,
    difficulty,
    status,
    challenge,
  }), [exam, subtest, selected, difficulty, status, challenge]);

  const chooseExam = (examId: string) => {
    const nextExam = examId as ExamId;
    const firstSubtest = subtestsForExam(nextExam)[0];
    setExam(nextExam);
    setSubtest(firstSubtest?.id ?? "");
    setSelected([]);
  };

  const chooseSubtest = (subtestId: string) => {
    setSubtest(subtestId);
    setSelected([]);
  };

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const sessionCount = Math.min(Number(count), availableQuestions);
  const estimatedMinutes = Math.max(1, Math.ceil((sessionCount * (challenge ? 60 : 75)) / 60));
  return <Page narrow><PageTitle eyebrow="Build your session" title="Custom Drill" subtitle="Choose what to focus on. You can change any setting before starting." />
    <div className="space-y-3 sm:space-y-4">
      <Surface><Step n="1" title="Choose Exam" /><SelectPills options={exams.map((item) => item.name)} value={exams.find((item) => item.id === exam)?.name ?? ""} onChange={(value) => { const next = exams.find((item) => item.name === value); if (next) chooseExam(next.id); }} /></Surface>
      <Surface><Step n="2" title="Choose Subtest" /><SelectPills options={availableSubtests.map((item) => item.name)} value={availableSubtests.find((item) => item.id === subtest)?.name ?? ""} onChange={(value) => { const next = availableSubtests.find((item) => item.name === value); if (next) chooseSubtest(next.id); }} /></Surface>
      <Surface><Step n="3" title="Choose Material" /><div className="grid grid-cols-2 gap-2">{availableMaterials.map((item) => { const active = selected.includes(item.id); return <label key={item.id} className={cn("glass-pill flex min-h-12 cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5", active && "glass-pill-active")}><Checkbox checked={active} onCheckedChange={() => toggle(item.id)} /><span className="min-w-0 text-sm font-medium leading-snug">{item.name}</span></label>; })}</div></Surface>
      <Surface><Step n="4" title="Question Count" /><SelectPills options={["10", "15", "20", "30"]} value={count} onChange={setCount} /></Surface>
      <Surface><Step n="5" title="Difficulty & Status" /><div className="space-y-4 sm:space-y-6"><Setting title="Difficulty"><SelectPills options={["All", "Easy", "Medium", "Hard"]} value={difficulty} onChange={setDifficulty} /></Setting><Setting title="Question Status"><SelectPills options={["All", "Unanswered", "Incorrect", "Needs Review", "Mastered"]} value={status} onChange={setStatus} /></Setting></div></Surface>
      <Surface><Step n="6" title="60s Challenge" /><div className="flex items-start justify-between gap-3 sm:gap-6"><div><h3 className="font-semibold">Challenge Mode</h3><p className="mt-1 text-sm text-muted-foreground">60 seconds per question. A timeout counts as incorrect.</p></div><div className="glass-pill mt-1 shrink-0 rounded-full p-1"><Switch checked={challenge} onCheckedChange={setChallenge} aria-label="Challenge mode" /></div></div></Surface>
      <Surface><h2 className="font-display text-lg font-bold">Session Summary</h2><dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-4 text-sm sm:mt-4 sm:gap-4"><div><dt className="text-muted-foreground">Questions</dt><dd className="mt-1 font-semibold">{sessionCount}</dd></div><div><dt className="text-muted-foreground">Materials</dt><dd className="mt-1 font-semibold">{selected.length}</dd></div><div><dt className="text-muted-foreground">Estimated</dt><dd className="mt-1 font-semibold">~{estimatedMinutes} min</dd></div><div><dt className="text-muted-foreground">Difficulty</dt><dd className="mt-1 font-semibold">{difficulty}</dd></div><div><dt className="text-muted-foreground">Status</dt><dd className="mt-1 font-semibold">{status}</dd></div><div><dt className="text-muted-foreground">Timer</dt><dd className="mt-1 font-semibold">{challenge ? "60s each" : "Open"}</dd></div></dl></Surface>
    </div>
    <div className="bottom-nav-glass mt-4 rounded-2xl border p-2.5 sm:mt-6 sm:p-3 md:sticky md:bottom-4 md:z-20"><Button size="lg" className="min-h-11 w-full" disabled={selected.length === 0 || availableQuestions === 0} onClick={() => navigate({ to: "/question", search: { source: "custom", exam, subtest, materials: selected.join(","), count: Number(count), difficulty, status, challenge } })}><SlidersHorizontal /> Start Drill · {sessionCount} Questions</Button>{selected.length > 0 && availableQuestions === 0 && <p className="mt-2 text-center text-sm text-muted-foreground">No questions match these settings.</p>}</div>
  </Page>;
}
function Step({ n, title, compact = false }: { n: string; title: string; compact?: boolean }) { return <div className={cn("flex items-center gap-2.5 sm:gap-3", !compact && "mb-3 sm:mb-5")}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">{n}</span><h2 className="font-display text-lg font-bold">{title}</h2></div>; }
function Setting({ title, children }: { title: string; children: ReactNode }) { return <div><h3 className="mb-2 text-sm font-semibold text-muted-foreground sm:mb-3">{title}</h3>{children}</div>; }