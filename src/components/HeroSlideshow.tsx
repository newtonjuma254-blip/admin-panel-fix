import { useEffect, useState } from "react";
import { Calendar, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStorefront } from "@/lib/storefront";
import heroImg from "@/assets/hero.jpg";

const db: any = supabase;

interface Slide { id: string; kind: "image" | "video"; url: string; position: number; }

export function HeroSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);
  const { settings } = useStorefront();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await db.from("hero_slides").select("*").order("position", { ascending: true });
      if (error) {
        console.error("Hero slides fetch error:", error);
        return;
      }
      setSlides(data ?? []);
    };
    load();
    const ch = db.channel("hero-slides-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const title = settings.hero_title || "Elevate Your Celebration With Spectacular Fire & Light";
  const subtitle = settings.hero_subtitle || "Cinematic, professional-grade fireworks delivered and choreographed across Kenya — from rooftop sparklers to 60-shell finales.";

  return (
    <section id="hero" className="relative min-h-[92vh] overflow-hidden">
      <div className="absolute inset-0">
        {slides.length === 0 && (
          <img src={heroImg} alt="" className="h-full w-full object-cover" />
        )}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-[1200ms]"
            style={{ opacity: i === idx ? 1 : 0 }}
          >
            {s.kind === "video" ? (
              <video
                src={s.url}
                autoPlay muted loop playsInline
                poster={heroImg}
                className="h-full w-full object-cover"
              />
            ) : (
              <img src={s.url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroImg; }} />
            )}
          </div>
        ))}
        <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/40 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pt-24 pb-32 sm:px-6">
        <div className="max-w-3xl animate-float-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-heading text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--cyan)" }} />
            Licensed Pyrotechnics · KEBS Certified · Est. 2014
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[0.95] sm:text-6xl md:text-7xl">
            <span className="text-aurora">{title}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#funnel" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-6 py-3.5 text-sm font-heading font-semibold text-white glow-violet transition hover:scale-[1.03]">
              <Calendar className="h-4 w-4" /> Book Event Display
            </a>
            <a href="#catalog" className="inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-heading font-semibold transition glass hover:border-white/20">
              <Store className="h-4 w-4" /> Browse Interactive Shop
            </a>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass border border-white/15 hover:border-white/40 hover:scale-110 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => setIdx((i) => (i + 1) % slides.length)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass border border-white/15 hover:border-white/40 hover:scale-110 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className="grid h-11 w-11 place-items-center rounded-full"
              >
                <span
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === idx ? 28 : 8,
                    background: i === idx ? "var(--cyan)" : "rgba(255,255,255,0.3)",
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
