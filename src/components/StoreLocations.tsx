import { useEffect, useState } from "react";
import { Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

interface Loc { id: string; city: string; area: string; place: string; phones: string; }

export function StoreLocations() {
  const [locs, setLocs] = useState<Loc[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await db.from("store_locations").select("*").order("city", { ascending: true });
      setLocs(data ?? []);
    };
    load();
    const ch = db.channel("loc-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_locations" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  if (locs.length === 0) return null;

  return (
    <section id="locations" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl sm:text-4xl font-bold">📍 Our Store Locations</h2>
        <p className="mt-2 text-sm text-muted-foreground">Walk in, pick up, or arrange same-day delivery from any regional outlet.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locs.map((l) => {
          const phones = (l.phones || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
          return (
            <div key={l.id} className="rounded-2xl glass border border-white/10 p-5 hover:border-white/30 transition">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-aurora glow-violet">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-heading uppercase tracking-[0.2em]" style={{ color: "var(--cyan)" }}>{l.city}</div>
                  <div className="mt-1 font-display text-lg font-bold leading-tight">{l.area}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{l.place}</div>
                </div>
              </div>
              {phones.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-4 space-y-2">
                  {phones.map((p, i) => (
                    <a key={i} href={`tel:${p.replace(/\s/g, "")}`}
                      className="flex min-h-11 items-center gap-2 text-sm font-heading text-muted-foreground transition hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" style={{ color: "var(--cyan)" }} />
                      <span>{p}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
