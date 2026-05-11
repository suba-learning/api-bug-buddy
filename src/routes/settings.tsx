import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { api, type Me } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bug, Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Account settings — API Practice Lab" }] }),
  component: Settings,
});

function Settings() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [buggy, setBuggy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/login" });
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api.get<Me>("/api/public/users/me").then(r => { if (r.ok) setMe(r.data); });
    supabase.from("user_settings").select("buggy_mode").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setBuggy(data?.buggy_mode ?? false));
  }, [user]);

  async function saveProfile() {
    if (!me) return;
    setSaving(true);
    const r = await api.patch("/api/public/users/me", { firstName: me.firstName, lastName: me.lastName, email: me.email });
    setSaving(false);
    if (!r.ok) return toast.error(r.error);
    toast.success("Profile updated");
  }

  async function toggleBuggy(v: boolean) {
    setBuggy(v);
    if (!user) return;
    const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, buggy_mode: v });
    if (error) toast.error(error.message);
    else toast.success(`Buggy Mode ${v ? "enabled" : "disabled"}`);
  }

  async function deleteAccount() {
    const r = await api.del("/api/public/users/me");
    if (!r.ok) return toast.error(r.error);
    await supabase.auth.signOut();
    toast.success("Account deleted");
    router.navigate({ to: "/" });
  }

  if (authLoading || !user || !me) return <div className="container px-4 py-12">Loading…</div>;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Account settings</h1>

      <div className="surface-card p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>First name</Label><Input value={me.firstName} onChange={e => setMe({ ...me, firstName: e.target.value })} /></div>
          <div><Label>Last name</Label><Input value={me.lastName} onChange={e => setMe({ ...me, lastName: e.target.value })} /></div>
        </div>
        <div><Label>Email</Label><Input type="email" value={me.email} onChange={e => setMe({ ...me, email: e.target.value })} /></div>
        <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2"><Bug className="h-4 w-4 text-warning" /> Buggy Mode</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Intentionally introduces controlled bugs into the API for testing practice. The toggle is per-user and applies to API calls made with your token.
            </p>
            <ul className="text-sm text-muted-foreground mt-3 list-disc list-inside space-y-1">
              <li><code className="font-mono">PATCH /contacts/:id</code> sometimes ignores the <code>phone</code> field</li>
              <li><code className="font-mono">DELETE /contacts/:id</code> returns <strong>200</strong> with a JSON body instead of <strong>204</strong></li>
              <li><code className="font-mono">GET /contacts</code> returns contacts unsorted even when <code>sort</code> is provided</li>
              <li><code className="font-mono">POST /contacts</code> may accept invalid email formats</li>
            </ul>
          </div>
          <Switch checked={buggy} onCheckedChange={toggleBuggy} />
        </div>
      </div>

      <div className="surface-card p-6 border-destructive/40">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Deletes your test user and all contacts. Used for automated cleanup. After deletion, your token will return 401.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4"><Trash2 className="h-4 w-4 mr-1" />Delete my account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
              <AlertDialogDescription>Deletes your user, all contacts, and invalidates your token.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
