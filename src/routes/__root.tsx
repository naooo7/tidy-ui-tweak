import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, LibraryBig, ChartNoAxesCombined, UserRound, Dumbbell } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../hooks/use-theme";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useProfilePreferences } from "@/hooks/use-profile-preferences";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FastLearner" },
      { name: "description", content: "Learn, practice, review, and master your exams." },
      { name: "author", content: "FastLearner" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const profile = useProfilePreferences();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 hidden border-b border-border/70 bg-background/90 backdrop-blur-xl md:block">
          <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6">
            <Link to="/" className="font-display text-lg font-bold text-foreground">FastLearner<span className="text-primary">.</span></Link>
            <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-soft">
              {navItems.map(({ label, to }) => (
                <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground" }}>{label}</Link>
              ))}
            </nav>
            <ProfileAvatar displayName={profile.displayName} avatarUrl={profile.avatarUrl} className="h-9 w-9" fallbackClassName="bg-secondary font-semibold text-foreground" />
          </div>
        </header>
        <main className="bottom-nav-clearance"><Outlet /></main>
        <nav aria-label="Primary navigation" className="bottom-nav-glass fixed inset-x-3 z-50 mx-auto grid max-w-lg grid-cols-5 rounded-[1.65rem] border p-1.5 md:hidden">
          {[navItems[1], navItems[2], navItems[0], navItems[3], navItems[4]].map((item) => {
            if (!item) return null;
            const { label, to, icon: Icon } = item;
            return (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className={`bottom-nav-item flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.2rem] px-1 text-[11px] font-semibold ${to === "/" ? "bottom-nav-home" : ""}`} activeProps={{ className: "bottom-nav-item-active" }}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />{label}
            </Link>
            );
          })}
        </nav>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const navItems = [
  { label: "Home", to: "/" as const, icon: Home },
  { label: "Learn", to: "/learn" as const, icon: LibraryBig },
  { label: "Drill", to: "/drill" as const, icon: Dumbbell },
  { label: "Progress", to: "/progress" as const, icon: ChartNoAxesCombined },
  { label: "Profile", to: "/profile" as const, icon: UserRound },
];
