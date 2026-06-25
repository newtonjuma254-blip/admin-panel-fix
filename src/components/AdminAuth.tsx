import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, X, Loader2 } from "lucide-react";

export function AdminAuth({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleForgot = async () => {
    setErr(null); setInfo(null);
    if (!email) { setErr("Enter your email above first, then click Forgot password."); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setInfo(`Password reset link sent to ${email}. Check your inbox.`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { setErr(error?.message ?? "Login failed"); setBusy(false); return; }
    setBusy(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-md rounded-3xl p-5 animate-float-up glass sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full glass">
          <X className="h-4 w-4" />
        </button>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-aurora glow-violet mb-5">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] font-heading" style={{ color: "var(--cyan)" }}>Restricted</div>
        <h3 className="font-display text-2xl font-bold mt-1">Supervisor sign-in</h3>
        <p className="mt-2 text-sm text-muted-foreground">Authorized personnel only. Manage inventory and orders.</p>

        <div className="mt-6 space-y-3">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="min-h-11 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="min-h-11 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm" />
          <button type="button" onClick={handleForgot} disabled={busy} className="min-h-11 text-xs font-heading underline-offset-4 hover:underline disabled:opacity-40" style={{ color: "var(--cyan)" }}>
            Forgot password?
          </button>
        </div>

        {err && <div className="mt-4 text-xs" style={{ color: "var(--fuchsia)" }}>{err}</div>}
        {info && <div className="mt-4 text-xs" style={{ color: "var(--cyan)" }}>{info}</div>}

        <button disabled={busy} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-aurora py-3 text-sm font-heading font-bold text-white glow-violet disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock console"}
        </button>

        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          Enter your store account email and password to unlock the console.
        </p>
      </form>
    </div>
  );
}
