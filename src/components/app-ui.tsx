import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Page({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-5 sm:px-5 sm:py-8 md:px-8 md:py-12", narrow ? "max-w-3xl" : "max-w-6xl")}>{children}</div>;
}

export function PageTitle({ eyebrow, title, subtitle, back }: { eyebrow?: string; title: string; subtitle?: string; back?: string }) {
  return <div className="mb-5 animate-rise sm:mb-8 md:mb-10">
    {back && <Link to={back} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:mb-6"><ArrowLeft className="h-4 w-4" /> Back</Link>}
    {eyebrow && <p className="mb-2 text-sm font-semibold text-primary">{eyebrow}</p>}
    <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
    {subtitle && <p className="mt-2 max-w-2xl text-base text-muted-foreground">{subtitle}</p>}
  </div>;
}

export function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5 md:p-6", className)}>{children}</div>;
}

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safeValue)}><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${safeValue}%` }} /></div>;
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p></div>;
}

export function MiniLine({ values, height = 100 }: { values: number[]; height?: number }) {
  if (values.length < 2) return <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">Not enough activity yet</div>;
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${height - ((value - min) / (max - min)) * height}`).join(" ");
  return <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-28 w-full overflow-visible" aria-label="Accuracy trend"><polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export type TrendDatum = { label: string; value: number | null };

export function TrendChart({ data, label, unit = "", compact = false }: { data: TrendDatum[]; label: string; unit?: string; compact?: boolean }) {
  const populated = data.filter((point) => point.value !== null);
  if (populated.length === 0) {
    return <div className={cn("flex items-center justify-center rounded-xl bg-secondary/55 px-6 text-center text-sm text-muted-foreground", compact ? "h-28 sm:h-32" : "h-48")}>Your chart will appear after you complete some questions.</div>;
  }
  const max = Math.max(1, ...populated.map((point) => point.value ?? 0));
  return <div className="overflow-x-auto pb-1" aria-label={label} role="img">
    <div className={cn("flex min-w-[30rem] items-end gap-1.5 border-b border-border px-1", compact ? "h-28 pt-4 sm:h-32" : "h-48 pt-8")}>
      {data.map((point, index) => {
        const value = point.value ?? 0;
        return <div key={`${point.label}-${index}`} className="group flex h-full min-w-2 flex-1 items-end" title={`${point.label}: ${point.value === null ? "No activity" : `${point.value}${unit}`}`}>
          <div className="relative w-full rounded-t-sm bg-primary/15 transition-colors group-hover:bg-primary/25" style={{ height: `${point.value === null ? 1 : Math.max(4, (value / max) * 100)}%` }}>
            {point.value !== null && <span className="sr-only">{point.label}: {point.value}{unit}</span>}
          </div>
        </div>;
      })}
    </div>
    <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span></div>
  </div>;
}

export function LinkRow({ to, title, subtitle, trailing }: { to: string; title: string; subtitle?: string; trailing?: ReactNode }) {
  return <Link to={to} className="group flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-soft sm:gap-4 sm:p-4">
    <div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{title}</p>{subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}</div>
    {trailing}<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
  </Link>;
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return <Button asChild size="lg"><Link to={to}>{children}<ArrowRight /></Link></Button>;
}