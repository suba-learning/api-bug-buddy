import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — API Practice Lab" }] }),
  component: Signup,
});

function Signup() {
  const router = useRouter();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await api.post("/api/public/users", { firstName, lastName, email, password });
    if (!r.ok) { toast.error(r.error); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created");
    router.navigate({ to: "/dashboard" });
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="surface-card p-6">
        <h1 className="text-2xl font-bold mb-1">Create test account</h1>
        <p className="text-sm text-muted-foreground mb-6">Used only for API practice. You can delete it any time.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First name</Label><Input value={firstName} onChange={e => setFirst(e.target.value)} required /></div>
            <div><Label>Last name</Label><Input value={lastName} onChange={e => setLast(e.target.value)} required /></div>
          </div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating…" : "Sign up"}</Button>
        </form>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
