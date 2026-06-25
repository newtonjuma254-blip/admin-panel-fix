import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/" }), 1500);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={handle} className="w-full max-w-md rounded-3xl glass p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-aurora glow-violet mb-5">
          <KeyRound className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter a new password for your supervisor account.</p>

        <input
          required minLength={8} type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 chars)"
          className="mt-6 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm"
        />

        {err && <div className="mt-4 text-xs" style={{ color: "var(--fuchsia)" }}>{err}</div>}
        {done && <div className="mt-4 text-xs" style={{ color: "var(--cyan)" }}>Password updated. Redirecting…</div>}

        <button disabled={busy || done} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-aurora py-3 text-sm font-heading font-bold text-white glow-violet disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </button>
      </form>
    </div>
  );
}
