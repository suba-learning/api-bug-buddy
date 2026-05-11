import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact } from "@/lib/api";

export type ContactFormValues = Omit<Contact, "id" | "createdAt" | "updatedAt">;

export const EMPTY_CONTACT: ContactFormValues = {
  firstName: "", lastName: "",
  birthdate: null, email: null, phone: null,
  street1: null, street2: null, city: null, stateProvince: null, postalCode: null, country: null,
};

interface Props {
  value: ContactFormValues;
  onChange: (v: ContactFormValues) => void;
}

function field(label: string, value: string | null, set: (v: string | null) => void, type = "text") {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={e => set(e.target.value || null)} />
    </div>
  );
}

export function ContactForm({ value, onChange }: Props) {
  const v = value;
  const set = (patch: Partial<ContactFormValues>) => onChange({ ...v, ...patch });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>First name *</Label><Input value={v.firstName} onChange={e => set({ firstName: e.target.value })} required /></div>
        <div><Label>Last name *</Label><Input value={v.lastName} onChange={e => set({ lastName: e.target.value })} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("Email", v.email, x => set({ email: x }), "email")}
        {field("Phone", v.phone, x => set({ phone: x }))}
      </div>
      {field("Birthdate (YYYY-MM-DD)", v.birthdate, x => set({ birthdate: x }), "date")}
      <div className="pt-2 border-t">
        <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Address</h3>
        <div className="space-y-3">
          {field("Street 1", v.street1, x => set({ street1: x }))}
          {field("Street 2", v.street2, x => set({ street2: x }))}
          <div className="grid grid-cols-2 gap-3">
            {field("City", v.city, x => set({ city: x }))}
            {field("State / Province", v.stateProvince, x => set({ stateProvince: x }))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("Postal code", v.postalCode, x => set({ postalCode: x }))}
            {field("Country", v.country, x => set({ country: x }))}
          </div>
        </div>
      </div>
    </div>
  );
}
