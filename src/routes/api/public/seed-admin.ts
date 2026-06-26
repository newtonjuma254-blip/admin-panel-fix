import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { email, password, token } = await request.json();
        if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
          return new Response("forbidden", { status: 403 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (existing) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          });
          if (error) return new Response(error.message, { status: 500 });
          return Response.json({ ok: true, action: "updated", id: existing.id });
        }
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ ok: true, action: "created", id: data.user?.id });
      },
    },
  },
});
