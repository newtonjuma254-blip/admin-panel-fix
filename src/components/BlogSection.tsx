import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

interface Post {
  id: string; title: string; tag: string; date_label: string;
  excerpt: string; images: any; created_at: string;
}

export function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await db.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Blog posts fetch error:", error);
        setLoading(false);
        return;
      }
      setPosts(data ?? []);
      setLoading(false);
    };
    load();
    const ch = db.channel("blog-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  if (loading) {
    return (
      <section id="blog" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl glass border border-white/10 overflow-hidden">
              <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-8">
        <div className="text-xs font-heading uppercase tracking-[0.25em]" style={{ color: "var(--cyan)" }}>
          FireGuide
        </div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Experiences & Stories</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p) => {
          const images: string[] = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
          return (
            <article key={p.id} className="group overflow-hidden rounded-2xl glass border border-white/10 hover:border-white/30 transition">
              <BlogCarousel images={images} title={p.title} tag={p.tag} />
              <div className="p-5">
                <div className="text-[10px] font-heading uppercase tracking-[0.2em] text-muted-foreground">
                  {p.date_label || new Date(p.created_at).toLocaleDateString()}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BlogCarousel({ images, title, tag }: { images: string[]; title: string; tag: string }) {
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const valid = images.filter((_, i) => !broken[i]);
  const hasMultiple = valid.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % valid.length), 4000);
    return () => clearInterval(t);
  }, [hasMultiple, valid.length]);

  useEffect(() => { if (idx >= valid.length) setIdx(0); }, [valid.length, idx]);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
      {valid.length === 0 ? (
        <div className="absolute inset-0 grid place-items-center" style={{ background: "var(--gradient-night)" }}>
          <span className="text-[10px] font-heading uppercase tracking-[0.25em] text-muted-foreground">No image</span>
        </div>
      ) : (
        valid.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              const origIdx = images.indexOf(src);
              setBroken((b) => ({ ...b, [origIdx]: true }));
            }}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))
      )}
      <span
        className="absolute left-3 top-3 z-10 rounded-full border px-2.5 py-1 text-[10px] font-heading font-bold tracking-[0.15em]"
        style={{
          color: "var(--fuchsia)",
          borderColor: "color-mix(in oklab, var(--fuchsia) 50%, transparent)",
          background: "color-mix(in oklab, var(--fuchsia) 15%, transparent)",
        }}
      >
        {(tag || "STORY").toUpperCase()}
      </span>
      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 6,
                  background: i === idx ? "var(--cyan)" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
