import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Contact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/contacts/$id")({
  head: () => ({ meta: [{ title: "Contact — API Practice Lab" }] }),
  component: ContactDetail,
});

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2">{value || <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}

function ContactDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [c, setC] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Contact>(`/api/public/contacts/${id}`).then(r => {
      setLoading(false);
      if (!r.ok) toast.error(r.error);
      else setC(r.data);
    });
  }, [id]);

  if (loading) return <div className="container px-4 py-12">Loading…</div>;
  if (!c) return (
    <div className="container max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-muted-foreground">Contact not found</p>
      <Link to="/dashboard"><Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
    </div>
  );

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
        <div className="flex gap-2">
          <Link to="/contacts/$id/edit" params={{ id: c.id }}><Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" />Edit</Button></Link>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" />Delete</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  const r = await api.del(`/api/public/contacts/${c.id}`);
                  if (!r.ok) return toast.error(r.error);
                  toast.success("Deleted"); router.navigate({ to: "/dashboard" });
                }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="surface-card p-6">
        <h1 className="text-2xl font-bold mb-1">{c.firstName} {c.lastName}</h1>
        <p className="text-xs text-muted-foreground mb-4 font-mono">id: {c.id}</p>
        <Row label="Email" value={c.email} />
        <Row label="Phone" value={c.phone} />
        <Row label="Birthdate" value={c.birthdate} />
        <Row label="Street 1" value={c.street1} />
        <Row label="Street 2" value={c.street2} />
        <Row label="City" value={c.city} />
        <Row label="State" value={c.stateProvince} />
        <Row label="Postal code" value={c.postalCode} />
        <Row label="Country" value={c.country} />
        <Row label="Created" value={new Date(c.createdAt).toLocaleString()} />
      </div>
    </div>
  );
}
