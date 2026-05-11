import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { api, type Contact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Eye, Pencil, Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Contacts — API Practice Lab" }] }),
  component: Dashboard,
});

const SAMPLE = [
  { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", phone: "555-0100", city: "London", country: "UK" },
  { firstName: "Alan", lastName: "Turing", email: "alan@example.com", phone: "555-0101", city: "Cambridge", country: "UK" },
  { firstName: "Grace", lastName: "Hopper", email: "grace@example.com", phone: "555-0102", city: "New York", country: "USA" },
];

function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "created">("created");

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/login" });
  }, [authLoading, user, router]);

  async function load() {
    setLoading(true);
    const r = await api.get<Contact[]>(`/api/public/contacts?sort=${sort}`);
    setLoading(false);
    if (!r.ok) { toast.error(r.error); return; }
    setContacts(r.data);
  }
  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user, sort]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q),
    );
  }, [contacts, query]);

  async function deleteContact(id: string) {
    const r = await api.del(`/api/public/contacts/${id}`);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Deleted (HTTP ${r.status})`);
    load();
  }

  async function resetAll() {
    const ids = contacts.map(c => c.id);
    for (const id of ids) await api.del(`/api/public/contacts/${id}`);
    toast.success("All contacts deleted");
    load();
  }

  async function seedSample() {
    for (const s of SAMPLE) await api.post("/api/public/contacts", s);
    toast.success("Sample contacts created");
    load();
  }

  if (authLoading || !user) return <div className="container px-4 py-12">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted-foreground">All requests use the live REST API.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={seedSample}><Sparkles className="h-4 w-4 mr-1" />Seed sample</Button>
          <Button variant="outline" size="sm" onClick={() => { if (token) { navigator.clipboard.writeText(token); toast.success("Token copied"); } }}>
            <Copy className="h-4 w-4 mr-1" />Copy token
          </Button>
          <Link to="/contacts/new"><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add contact</Button></Link>
        </div>
      </div>

      <div className="surface-card p-4 mb-4 flex flex-wrap gap-2 items-center">
        <Input placeholder="Search by name or email…" value={query} onChange={e => setQuery(e.target.value)} className="max-w-xs" />
        <select value={sort} onChange={e => setSort(e.target.value as any)} className="h-9 rounded-md border bg-background px-2 text-sm">
          <option value="created">Sort: Newest</option>
          <option value="name">Sort: Name</option>
        </select>
        <div className="ml-auto flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">Reset my contacts</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all contacts?</AlertDialogTitle>
                <AlertDialogDescription>This deletes every contact owned by your test user.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAll}>Delete all</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">City</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No contacts. Add one or seed samples.</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-2 font-medium">{c.firstName} {c.lastName}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.email || "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.phone || "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.city || "—"}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Link to="/contacts/$id" params={{ id: c.id }}><Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button></Link>
                    <Link to="/contacts/$id/edit" params={{ id: c.id }}><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {c.firstName} {c.lastName}?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteContact(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
