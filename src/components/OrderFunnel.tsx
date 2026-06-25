import { useState, type ComponentType } from "react";
import { Check, ArrowRight, ArrowLeft, Sparkles, MapPin, Package, PartyPopper, Loader2, Church, Building2, Wine, Baby } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ENVIRONMENTS: { id: string; label: string; desc: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "wedding", label: "Premium Wedding", desc: "Choreographed romantic finale", icon: Church },
  { id: "corporate", label: "Corporate Gala", desc: "Brand-aligned executive show", icon: Building2 },
  { id: "club", label: "Nightclub / Rave", desc: "Indoor cryo + sparklers", icon: Wine },
  { id: "reveal", label: "Gender Reveal", desc: "Pink or blue smoke + fountain", icon: Baby },
];
const PACKAGES = [
  { id: "spark", label: "Spark", desc: "Intimate · up to 50 guests", price: "KSh 15,000" },
  { id: "blaze", label: "Blaze", desc: "Standard · up to 150 guests", price: "KSh 45,000" },
  { id: "aurora", label: "Aurora", desc: "Premium · up to 400 guests", price: "KSh 120,000" },
  { id: "supernova", label: "Supernova", desc: "Full production · 400+", price: "KSh 280,000" },
];
const LOCATIONS = ["Westlands", "Karen", "Kilimani", "Lavington", "Runda", "Gigiri", "Kileleshwa", "Mombasa"];

const STEPS = [
  { icon: PartyPopper, title: "Event Type" },
  { icon: Package, title: "Package" },
  { icon: MapPin, title: "Delivery" },
  { icon: Sparkles, title: "Confirm" },
];

export function OrderFunnel() {
  const [step, setStep] = useState(0);
  const [env, setEnv] = useState<string>();
  const [pkg, setPkg] = useState<string>();
  const [loc, setLoc] = useState<string>();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNext = [env, pkg, loc, true][step];

  const submitOrder = async () => {
    setSubmitting(true); setError(null);
    const envObj = ENVIRONMENTS.find((e) => e.id === env);
    const pkgObj = PACKAGES.find((p) => p.id === pkg);
    const { error } = await supabase.from("orders").insert({
      items: [{
        environment: (envObj?.label ?? env ?? "").slice(0, 100),
        package: (pkgObj?.label ?? pkg ?? "").slice(0, 100),
        location: (loc ?? "").slice(0, 200),
        package_id: pkg,
        package_price: pkgObj?.price,
      }],
      notes: `Custom show builder request: ${envObj?.label ?? env ?? ""} / ${pkgObj?.label ?? pkg ?? ""} / ${loc ?? ""}`,
      status: "new",
    });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  return (
    <section id="funnel" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="text-center mb-12">
        <div className="text-xs font-heading uppercase tracking-[0.25em]" style={{ color: "var(--fuchsia)" }}>
          Custom Show Builder
        </div>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
          Plan Your <span className="text-aurora">Custom Experience</span>.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Get an instant calculation &amp; custom pyrotechnics configuration for your event.
        </p>
      </div>

      <div className="funnel-box relative overflow-hidden rounded-3xl glass p-6 sm:p-10" style={{ boxShadow: "var(--shadow-card)" }}>
        {/* Step rail */}
        <div className="flex items-center justify-between mb-10 gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const completed = i < step || done;
            return (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-2 min-w-0">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                      active ? "bg-aurora border-transparent glow-violet" : completed ? "border-cyan/40" : "border-white/10"
                    }`}
                    style={completed && !active ? { background: "var(--cyan)", color: "#000" } : undefined}
                  >
                    {completed && !active ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className={`text-[11px] font-heading uppercase tracking-wider ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.title}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${completed ? "bg-cyan/40" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>

        {done ? (
          <div className="text-center py-12 animate-float-up">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-aurora glow-violet mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-display text-3xl font-bold">Booking received.</h3>
            <p className="mt-3 text-muted-foreground">Our pyrotechnics team will confirm within 30 minutes.</p>
            <button
              onClick={() => { setStep(0); setEnv(undefined); setPkg(undefined); setLoc(undefined); setDone(false); }}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-heading"
            >
              Start a new booking
            </button>
          </div>
        ) : (
          <div className="min-h-[280px] animate-float-up" key={step}>
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ENVIRONMENTS.map((e) => {
                  const Icon = e.icon;
                  const active = env === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setEnv(e.id)}
                      className={`min-h-11 text-left rounded-2xl border p-5 transition ${
                        active ? "border-transparent bg-aurora text-white glow-violet" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className={`grid h-11 w-11 place-items-center rounded-xl mb-3 ${active ? "bg-white/15" : "bg-white/5"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="font-display text-base font-bold leading-tight">{e.label}</div>
                      <div className={`mt-1 text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>{e.desc}</div>
                    </button>
                  );
                })}
              </div>
            )}
            {step === 1 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {PACKAGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPkg(p.id)}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl border p-5 transition ${
                      pkg === p.id ? "border-transparent bg-aurora text-white glow-violet" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-display text-lg font-bold">{p.label}</div>
                      <div className={`text-xs mt-0.5 ${pkg === p.id ? "text-white/80" : "text-muted-foreground"}`}>{p.desc}</div>
                    </div>
                    <div className="font-heading font-semibold text-sm whitespace-nowrap">{p.price}</div>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLoc(l)}
                    className={`chip ${loc === l ? "chip-active" : ""}`}
                  >
                    <MapPin className="h-3.5 w-3.5" /> {l}
                  </button>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="grid sm:grid-cols-3 gap-4">
                <Summary label="Event Type" value={ENVIRONMENTS.find(e => e.id === env)?.label} />
                <Summary label="Package" value={PACKAGES.find(p => p.id === pkg)?.label} />
                <Summary label="Location" value={loc} />
              </div>
            )}
          </div>
        )}

        {!done && (
          <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-full glass px-4 py-2.5 text-sm font-heading disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-xs text-muted-foreground font-heading uppercase tracking-wider">
              Step {step + 1} of {STEPS.length}
            </div>
            <button
              onClick={() => (step === STEPS.length - 1 ? submitOrder() : setStep(step + 1))}
              disabled={!canNext || submitting}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-5 py-2.5 text-sm font-heading font-semibold text-white glow-violet disabled:opacity-30 "
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (step === STEPS.length - 1 ? "Confirm booking" : "Continue")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {error && <div className="mt-4 text-xs text-center" style={{ color: "var(--fuchsia)" }}>{error}</div>}
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-heading">{label}</div>
      <div className="mt-2 font-display text-xl font-bold">{value || "—"}</div>
    </div>
  );
}
