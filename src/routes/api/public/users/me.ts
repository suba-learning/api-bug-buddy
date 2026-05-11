import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
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

export const Route = createFileRoute("/api/public/users/me")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      GET: async ({ request }) =>
        withErrorHandling(async () => {
          const { userId, supabase } = await requireAuth(request);
          const { data, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, created_at")
            .eq("id", userId)
            .single();
          if (error || !data) throw new ApiError(404, "Profile not found");
          return json({
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            createdAt: data.created_at,
          });
        }),
      PATCH: async ({ request }) =>
        withErrorHandling(async () => {
          const { userId, supabase } = await requireAuth(request);
          const body = await parseJson(request);
          const update: Record<string, unknown> = {};
          if (body.firstName !== undefined) update.first_name = body.firstName;
          if (body.lastName !== undefined) update.last_name = body.lastName;
          if (body.email !== undefined) {
            if (!isValidEmail(body.email)) return err(422, "Invalid email format");
            update.email = body.email;
          }
          if (Object.keys(update).length === 0) return err(400, "No updatable fields provided");

          const { data, error } = await supabase
            .from("profiles")
            .update(update as any)
            .eq("id", userId)
            .select()
            .single();
          if (error) throw new ApiError(400, error.message);

          if (update.email) {
            await supabaseAdmin.auth.admin.updateUserById(userId, { email: update.email as string });
          }

          return json({
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
          });
        }),
      DELETE: async ({ request }) =>
        withErrorHandling(async () => {
          const { userId } = await requireAuth(request);
          // Cascading FK will delete profile/contacts/settings
          const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (error) throw new ApiError(500, error.message);
          return noContent();
        }),
    },
  },
});
