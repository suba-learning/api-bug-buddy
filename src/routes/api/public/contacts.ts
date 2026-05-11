import { createFileRoute } from "@tanstack/react-router";
import {
  ApiError,
  err,
  isValidEmail,
  json,
  parseJson,
  preflight,
  requireAuth,
  withErrorHandling,
} from "@/lib/api-helpers.server";

const ALLOWED_FIELDS = [
  "first_name",
  "last_name",
  "birthdate",
  "email",
  "phone",
  "street1",
  "street2",
  "city",
  "state_province",
  "postal_code",
  "country",
] as const;

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

export function toContact(row: any) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    birthdate: row.birthdate,
    email: row.email,
    phone: row.phone,
    street1: row.street1,
    street2: row.street2,
    city: row.city,
    stateProvince: row.state_province,
    postalCode: row.postal_code,
    country: row.country,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const Route = createFileRoute("/api/public/contacts")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ request }) =>
        withErrorHandling(async () => {
          const { supabase, buggyMode } = await requireAuth(request);
          const url = new URL(request.url);
          const search = url.searchParams.get("search")?.toLowerCase();
          const sort = url.searchParams.get("sort"); // name | created
          const order = url.searchParams.get("order") === "desc" ? "desc" : "asc";

          let query = supabase.from("contacts").select("*");
          // BUG (buggy mode): ignore sort param
          if (sort && !buggyMode) {
            const col = sort === "name" ? "first_name" : "created_at";
            query = query.order(col, { ascending: order === "asc" });
          } else if (!buggyMode) {
            query = query.order("created_at", { ascending: false });
          }
          const { data, error } = await query;
          if (error) throw new ApiError(500, error.message);

          let results = (data ?? []).map(toContact);
          if (search) {
            results = results.filter(
              (c) =>
                c.firstName?.toLowerCase().includes(search) ||
                c.lastName?.toLowerCase().includes(search) ||
                c.email?.toLowerCase().includes(search),
            );
          }
          return json(results);
        }),
      POST: async ({ request }) =>
        withErrorHandling(async () => {
          const { userId, supabase, buggyMode } = await requireAuth(request);
          const body = await parseJson(request);
          if (!body.firstName || !body.lastName) {
            return err(422, "firstName and lastName are required");
          }
          if (body.email) {
            // BUG (buggy mode): occasionally allow invalid emails
            const skip = buggyMode && Math.random() < 0.5;
            if (!skip && !isValidEmail(body.email)) return err(422, "Invalid email format");
          }
          const insert = { ...fromBody(body), user_id: userId };
          const { data, error } = await supabase
            .from("contacts")
            .insert(insert as any)
            .select()
            .single();
          if (error) throw new ApiError(400, error.message);
          return json(toContact(data), 201);
        }),
    },
  },
});

export { ALLOWED_FIELDS };
