import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — API Practice Lab" }] }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setToken(data.session?.access_token ?? null);
    toast.success("Logged in");
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="surface-card p-6">
        <h1 className="text-2xl font-bold mb-1">Login</h1>
        <p className="text-sm text-muted-foreground mb-6">Use your test account credentials.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in…" : "Login"}</Button>
        </form>
        {token && (
          <div className="mt-4">
            <Label className="text-xs">Your JWT (Bearer token)</Label>
            <div className="flex gap-2 mt-1">
              <code className="flex-1 text-xs bg-muted rounded p-2 truncate font-mono">{token}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(token); toast.success("Token copied"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button onClick={() => router.navigate({ to: "/dashboard" })} className="w-full mt-3">Go to Dashboard</Button>
          </div>
        )}
        <p className="text-sm text-center mt-4 text-muted-foreground">
          No account? <Link to="/signup" className="text-primary underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
