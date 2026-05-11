import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { json, preflight, withErrorHandling } from "@/lib/api-helpers.server";

export const Route = createFileRoute("/api/public/users/logout")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request }) =>
        withErrorHandling(async () => {
          const auth = request.headers.get("authorization");
          if (auth?.startsWith("Bearer ")) {
            const token = auth.slice(7);
            try {
              await supabaseAdmin.auth.admin.signOut(token);
            } catch {
              // ignore
            }
          }
          return json({ message: "Logged out" });
        }),
    },
  },
});
