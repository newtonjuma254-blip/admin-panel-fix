import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

interface Post {
  id: string; title: string; tag: string; date_label: string;
  excerpt: string; images: any; created_at: string;
}

export function ExperiencesSlider() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await db.from("blog_posts").select("*").order("created_at", { ascending: false });
      setPosts(data ?? []);
    };
    load();
    const ch = db.channel("exp-blog")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  if (posts.length === 0) return null;

  const post = posts[idx % posts.length];
  const images: string[] = Array.isArray(post.images) ? post.images : [];
  const cover = images[0];

  const prev = () => setIdx((i) => (i - 1 + posts.length) % posts.length);
  const next = () => setIdx((i) => (i + 1) % posts.length);

  return (
    <section id="experiences" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-6">
        <div className="text-xs font-heading uppercase tracking-[0.25em]" style={{ color: "var(--fuchsia)" }}>
          Retained Experiences
        </div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Nights we lit up.</h2>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-stretch">
        <div className="relative overflow-hidden rounded-3xl glass border border-white/10 aspect-[16/9] bg-black/40">
          {cover ? (
            <img src={cover} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />

          <div className="absolute left-6 top-6">
            <span className="rounded-full border px-3 py-1 text-[10px] font-heading font-bold tracking-[0.2em]"
              style={{ color: "var(--cyan)", borderColor: "color-mix(in oklab, var(--cyan) 50%, transparent)", background: "color-mix(in oklab, var(--cyan) 15%, transparent)" }}>
              {(post.tag || "EXPERIENCE").toUpperCase()}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-2xl">
            <div className="text-[11px] font-heading uppercase tracking-[0.2em] text-muted-foreground">
              {post.date_label || new Date(post.created_at).toLocaleDateString()}
            </div>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight">{post.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
          </div>

          <button onClick={prev} aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass border border-white/10 hover:border-white/30 transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass border border-white/10 hover:border-white/30 transition">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {posts.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`}
            className="grid h-11 w-11 place-items-center rounded-full">
            <span
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === idx ? 24 : 8, background: i === idx ? "var(--fuchsia)" : "rgba(255,255,255,0.25)" }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
