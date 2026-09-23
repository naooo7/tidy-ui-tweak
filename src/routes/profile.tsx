import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Bell, Camera, Check, ChevronRight, Database, Flame, MoonStar, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { Metric, Page, PageTitle, Surface } from "@/components/app-ui";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { institutionById, institutions } from "@/data/institutions";
import { useProfilePreferences } from "@/hooks/use-profile-preferences";
import { useTheme, type ThemePreference } from "@/hooks/use-theme";
import { useUserData } from "@/hooks/use-user-data";
import { DEFAULT_TAGLINE, setProfileIdentity } from "@/services/profile-preferences";
import { formatDuration, getOverview, getStreak } from "@/services/user-data";

export const Route = createFileRoute("/profile")({ head: () => ({ meta: [{ title: "Profile — FastLearner" }, { name: "description", content: "View your FastLearner profile, study totals, and preferences." }, { property: "og:title", content: "Profile — FastLearner" }, { property: "og:description", content: "View your FastLearner profile, study totals, and preferences." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: ProfilePage });

function ProfilePage() {
  useUserData();
  const profile = useProfilePreferences();
  const [editorOpen, setEditorOpen] = useState(false);
  const { preference, setPreference, targetInstitutionId, setTargetInstitutionId, institutionThemeEnabled, setInstitutionThemeEnabled } = useTheme();
  const target = institutionById(targetInstitutionId);
  const overview = getOverview("all");
  const streak = getStreak();
  const settings: Array<{ Icon: LucideIcon; label: string; value: string }> = [
    { Icon: MoonStar, label: "Appearance", value: (preference[0] ?? "").toUpperCase() + preference.slice(1) },
    { Icon: Bell, label: "Notifications", value: "On" },
    { Icon: Database, label: "Data", value: "Saved on this device" },
  ];
  const themeOptions: Array<{ value: ThemePreference; label: string }> = [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }];

  return <Page narrow>
    <PageTitle title="Profile" />
    <div className="mb-5 flex items-center gap-4"><ProfileAvatar displayName={profile.displayName} avatarUrl={profile.avatarUrl} className="h-16 w-16" fallbackClassName="text-xl" /><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-display text-2xl font-bold">{profile.displayName || "Your Profile"}</h2><Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => setEditorOpen(true)} aria-label="Edit profile"><Pencil /></Button></div><p className="text-muted-foreground">Your activity stays on this device</p></div><div className="ml-auto hidden items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-semibold sm:flex"><Flame className="h-4 w-4 text-primary" />{streak.current} day streak</div></div>
    <ProfileEditor open={editorOpen} onOpenChange={setEditorOpen} displayName={profile.displayName || "Your Profile"} avatarUrl={profile.avatarUrl || null} tagline={profile.tagline || ""} />
    <Surface><div className="grid grid-cols-2 gap-7"><Metric label="Questions Answered" value={overview.total} /><Metric label="Accuracy" value={overview.total ? `${overview.accuracy}%` : "—"} /><Metric label="Study Time" value={formatDuration(overview.studySeconds)} /><Metric label="Longest Streak" value={`${streak.longest} day${streak.longest === 1 ? "" : "s"}`} /></div></Surface>
    <h2 className="mb-3 mt-9 font-display text-lg font-bold">Target Institution</h2>
    <Surface>{target && <div className="relative mb-5 flex min-h-24 items-center gap-4 overflow-hidden rounded-xl bg-secondary p-4"><img src={target.logo} alt="" className="absolute -right-4 h-28 w-36 object-contain opacity-10" /><img src={target.logo} alt={`${target.shortName} logo`} className="h-14 w-16 shrink-0 object-contain" /><div className="relative min-w-0"><p className="text-sm text-muted-foreground">Selected institution</p><p className="mt-1 font-display text-lg font-bold">{target.shortName}</p><p className="text-sm text-muted-foreground">{target.name}</p></div></div>}
      <div className="grid gap-2 sm:grid-cols-2">{institutions.map((institution) => { const active = targetInstitutionId === institution.id; return <Button key={institution.id} type="button" variant={active ? "default" : "outline"} className="h-auto min-h-16 justify-start whitespace-normal px-3 py-2.5 text-left" onClick={() => setTargetInstitutionId(institution.id)}><img src={institution.logo} alt="" className="h-9 w-10 shrink-0 rounded-sm bg-card object-contain p-1" /><span className="min-w-0"><span className="block font-semibold">{institution.shortName}</span><span className="block text-xs opacity-75">{institution.name}</span></span>{active && <Check className="ml-auto" />}</Button>; })}</div>
      <div className="mt-5 flex items-center gap-4 border-t border-border pt-5"><div className="min-w-0 flex-1"><label htmlFor="institution-theme" className="font-semibold">Gunakan Tema Institusi</label><p className="mt-0.5 text-sm text-muted-foreground">Gunakan warna institusi pilihan sebagai aksen aplikasi.</p></div><Switch id="institution-theme" checked={institutionThemeEnabled} onCheckedChange={setInstitutionThemeEnabled} aria-label="Gunakan Tema Institusi" /></div>
    </Surface>
    <h2 className="mb-3 mt-9 font-display text-lg font-bold">Settings</h2>
    <Surface className="p-2 md:p-2">{settings.map(({ Icon, label, value }) => label === "Appearance" ? <div key={label} className="rounded-xl p-4"><div className="flex items-center gap-4"><Icon className="h-5 w-5 text-muted-foreground" /><span className="flex-1 font-medium">{label}</span><span className="text-sm text-muted-foreground">{value}</span></div><div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-secondary p-1">{themeOptions.map((option) => <Button key={option.value} type="button" size="sm" variant={preference === option.value ? "secondary" : "ghost"} onClick={() => setPreference(option.value)}>{preference === option.value && <Check className="h-3.5 w-3.5" />}{option.label}</Button>)}</div></div> : <Button key={label} type="button" variant="ghost" className="h-auto w-full justify-start gap-4 rounded-xl p-4 text-left"><Icon className="h-5 w-5 text-muted-foreground" /><span className="flex-1 font-medium">{label}</span><span className="text-sm text-muted-foreground">{value}</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Button>)}</Surface>
  </Page>;
}

type ProfileEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  avatarUrl: string | null;
  tagline: string;
};

function ProfileEditor({ open, onOpenChange, displayName, avatarUrl, tagline }: ProfileEditorProps) {
  const [name, setName] = useState(displayName);
  const [photo, setPhoto] = useState<string | null>(avatarUrl);
  const [note, setNote] = useState(tagline);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(displayName);
    setPhoto(avatarUrl);
    setNote(tagline);
    setError("");
  }, [avatarUrl, displayName, open, tagline]);


  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }
    try {
      setPhoto(await resizeAvatar(file));
      setError("");
    } catch {
      setError("That image could not be opened. Try another one.");
    }
  };

  const save = () => {
    const nextName = name.trim();
    if (!nextName) {
      setError("Enter a display name.");
      return;
    }
    setProfileIdentity(nextName.slice(0, 50), photo, note);
    onOpenChange(false);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
      <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Update how your name, photo and tagline appear in FastLearner.</DialogDescription></DialogHeader>
      <div className="flex flex-col items-center gap-3 py-2">
        <ProfileAvatar displayName={name} avatarUrl={photo} className="h-24 w-24 ring-4 ring-secondary" fallbackClassName="text-2xl" />
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} aria-label="Choose profile photo" />
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}><Camera />Choose photo</Button>
          {photo ? <Button type="button" variant="ghost" onClick={() => { setPhoto(null); setError(""); }}><Trash2 />Remove</Button> : null}
        </div>
      </div>
      <div className="grid gap-2"><Label htmlFor="display-name">Display name</Label><Input id="display-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} autoComplete="name" /></div>
      <div className="grid gap-2"><Label htmlFor="profile-tagline">Personal tagline</Label><Input id="profile-tagline" value={note} onChange={(event) => setNote(event.target.value)} maxLength={120} placeholder={DEFAULT_TAGLINE} /><p className="text-xs text-muted-foreground">Leave empty to use the default tagline.</p></div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" onClick={save}>Save changes</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image"));
      image.onload = () => {
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 320;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas"));
          return;
        }
        context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 320, 320);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      if (typeof reader.result !== "string") {
        reject(new Error("result"));
        return;
      }
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}