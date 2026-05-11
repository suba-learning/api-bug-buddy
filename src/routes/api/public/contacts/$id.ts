import { createFileRoute } from "@tanstack/react-router";
import {
  ApiError,
  err,
  isValidEmail,
  json,
  noContent,
  parseJson,
  preflight,
  requireAuth,
  withErrorHandling,
} from "@/lib/api-helpers.server";
import { toContact } from "../contacts";

function fromBody(body: any) {
  const out: Record<string, any> = {};
  if (body.firstName !== undefined) out.first_name = body.firstName;
  if (body.lastName !== undefined) out.last_name = body.lastName;
  if (body.birthdate !== undefined) out.birthdate = body.birthdate || null;
  if (body.email !== undefined) out.email = body.email || null;
  if (body.phone !== undefined) out.phone = body.phone || null;
  if (body.street1 !== undefined) out.street1 = body.street1 || null;
  if (body.street2 !== undefined) out.street2 = body.street2 || null;
  if (body.city !== undefined) out.city = body.city || null;
  if (body.stateProvince !== undefined) out.state_province = body.stateProvince || null;
  if (body.postalCode !== undefined) out.postal_code = body.postalCode || null;
  if (body.country !== undefined) out.country = body.country || null;
  return out;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/contacts/$id")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ request, params }) =>
        withErrorHandling(async () => {
          const { supabase } = await requireAuth(request);
          if (!UUID_RE.test(params.id)) return err(400, "Invalid contact id");
          const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .eq("id", params.id)
            .maybeSingle();
          if (error) throw new ApiError(500, error.message);
          if (!data) return err(404, "Contact not found");
          return json(toContact(data));
        }),
      PUT: async ({ request, params }) =>
        withErrorHandling(async () => {
          const { supabase } = await requireAuth(request);
          if (!UUID_RE.test(params.id)) return err(400, "Invalid contact id");
          const body = await parseJson(request);
          if (!body.firstName || !body.lastName) {
            return err(422, "firstName and lastName are required");
          }
          if (body.email && !isValidEmail(body.email)) {
            return err(422, "Invalid email format");
          }
          // PUT replaces all fields — null out missing optional ones
          const replacement = {
            first_name: body.firstName,
            last_name: body.lastName,
            birthdate: body.birthdate ?? null,
            email: body.email ?? null,
            phone: body.phone ?? null,
            street1: body.street1 ?? null,
            street2: body.street2 ?? null,
            city: body.city ?? null,
            state_province: body.stateProvince ?? null,
            postal_code: body.postalCode ?? null,
            country: body.country ?? null,
          };
          const { data, error } = await supabase
            .from("contacts")
            .update(replacement)
            .eq("id", params.id)
            .select()
            .maybeSingle();
          if (error) throw new ApiError(400, error.message);
          if (!data) return err(404, "Contact not found");
          return json(toContact(data));
        }),
      PATCH: async ({ request, params }) =>
        withErrorHandling(async () => {
          const { supabase, buggyMode } = await requireAuth(request);
          if (!UUID_RE.test(params.id)) return err(400, "Invalid contact id");
          const body = await parseJson(request);
          const update = fromBody(body);
          // BUG (buggy mode): sometimes ignore phone field
          if (buggyMode && Math.random() < 0.5 && "phone" in update) {
            delete update.phone;
          }
          if (Object.keys(update).length === 0) return err(400, "No fields to update");
          if (update.email && !isValidEmail(update.email as string)) {
            return err(422, "Invalid email format");
          }
          const { data, error } = await supabase
            .from("contacts")
            .update(update as any)
            .eq("id", params.id)
            .select()
            .maybeSingle();
          if (error) throw new ApiError(400, error.message);
          if (!data) return err(404, "Contact not found");
          return json(toContact(data));
        }),
      DELETE: async ({ request, params }) =>
        withErrorHandling(async () => {
          const { supabase, buggyMode } = await requireAuth(request);
          if (!UUID_RE.test(params.id)) return err(400, "Invalid contact id");
          const { data: existing } = await supabase
            .from("contacts")
            .select("id")
            .eq("id", params.id)
            .maybeSingle();
          if (!existing) return err(404, "Contact not found");
          const { error } = await supabase.from("contacts").delete().eq("id", params.id);
          if (error) throw new ApiError(500, error.message);
          // BUG (buggy mode): return 200 instead of 204; also inconsistent error format hint
          if (buggyMode) return json({ message: "deleted", id: params.id }, 200);
          return noContent();
        }),
    },
  },
});
