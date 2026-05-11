import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import {
  err,
  json,
  parseJson,
  preflight,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  withErrorHandling,
} from "@/lib/api-helpers.server";

export const Route = createFileRoute("/api/public/users/login")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request }) =>
        withErrorHandling(async () => {
          const body = await parseJson(request);
          const { email, password } = body ?? {};
          if (!email || !password) return err(400, "email and password are required");

          const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error || !data.session) return err(401, "Invalid credentials");

          return json({
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            tokenType: "Bearer",
            user: {
              id: data.user.id,
              email: data.user.email,
            },
          });
        }),
    },
  },
});
