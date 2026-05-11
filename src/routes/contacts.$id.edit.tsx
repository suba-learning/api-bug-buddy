import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Contact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ContactForm, EMPTY_CONTACT, type ContactFormValues } from "@/components/ContactForm";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/contacts/$id/edit")({
  head: () => ({ meta: [{ title: "Edit contact — API Practice Lab" }] }),
  component: EditContact,
});

function EditContact() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [v, setV] = useState<ContactFormValues>(EMPTY_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<"PATCH" | "PUT">("PATCH");

  useEffect(() => {
    api.get<Contact>(`/api/public/contacts/${id}`).then(r => {
      setLoading(false);
      if (!r.ok) return toast.error(r.error);
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = r.data;
      setV(rest);
    });
  }, [id]);

  async function save() {
    setSaving(true);
    const r = method === "PATCH"
      ? await api.patch(`/api/public/contacts/${id}`, v)
      : await api.put(`/api/public/contacts/${id}`, v);
    setSaving(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Saved via ${method}`);
    router.navigate({ to: "/contacts/$id", params: { id } });
  }

  if (loading) return <div className="container px-4 py-12">Loading…</div>;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Link to="/contacts/$id" params={{ id }}><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
      <h1 className="text-2xl font-bold mb-6">Edit contact</h1>
      <div className="surface-card p-6">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-muted-foreground">Save method:</span>
          <button onClick={() => setMethod("PATCH")} className={`method-badge ${method === "PATCH" ? "method-PATCH" : "opacity-40 method-PATCH"}`}>PATCH</button>
          <button onClick={() => setMethod("PUT")} className={`method-badge ${method === "PUT" ? "method-PUT" : "opacity-40 method-PUT"}`}>PUT</button>
        </div>
        <ContactForm value={v} onChange={setV} />
        <div className="flex gap-2 mt-6">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : `Save (${method})`}</Button>
          <Button variant="outline" onClick={() => router.navigate({ to: "/contacts/$id", params: { id } })}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
