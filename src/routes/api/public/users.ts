import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  ApiError,
  err,
  isValidEmail,
  json,
  parseJson,
  preflight,
  withErrorHandling,
} from "@/lib/api-helpers.server";

export const Route = createFileRoute("/api/public/users")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request }) =>
        withErrorHandling(async () => {
          const body = await parseJson(request);
          const { firstName, lastName, email, password } = body ?? {};

          const missing: string[] = [];
          if (!firstName) missing.push("firstName");
          if (!lastName) missing.push("lastName");
          if (!email) missing.push("email");
          if (!password) missing.push("password");
          if (missing.length) {
            return err(422, "Validation Error", { missing });
          }

          if (!isValidEmail(email)) {
            return err(422, "Invalid email format");
          }
          if (typeof password !== "string" || password.length < 6) {
            return err(422, "Password must be at least 6 characters");
          }

          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName },
          });

          if (error || !data.user) {
            const msg = error?.message ?? "Failed to create user";
            if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
              return err(409, "Email already registered");
            }
            throw new ApiError(400, msg);
          }

          await supabaseAdmin.from("profiles").insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email,
          });

          await supabaseAdmin.from("user_settings").insert({ user_id: data.user.id });

          return json(
            {
              id: data.user.id,
              firstName,
              lastName,
              email,
            },
            201,
          );
        }),
    },
  },
});
