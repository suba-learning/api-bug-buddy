import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactForm, EMPTY_CONTACT, type ContactFormValues } from "@/components/ContactForm";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/contacts/new")({
  head: () => ({ meta: [{ title: "Add contact — API Practice Lab" }] }),
  component: NewContact,
});

function NewContact() {
  const router = useRouter();
  const [v, setV] = useState<ContactFormValues>(EMPTY_CONTACT);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const r = await api.post("/api/public/contacts", v);
    setSaving(false);
    if (!r.ok) return toast.error(r.error);
    toast.success("Contact created");
    router.navigate({ to: "/dashboard" });
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add contact</h1>
      <div className="surface-card p-6">
        <ContactForm value={v} onChange={setV} />
        <div className="flex gap-2 mt-6">
          <Button onClick={save} disabled={saving || !v.firstName || !v.lastName}>{saving ? "Saving…" : "Create contact"}</Button>
          <Button variant="outline" onClick={() => router.navigate({ to: "/dashboard" })}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
