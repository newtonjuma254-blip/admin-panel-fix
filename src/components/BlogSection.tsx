import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

interface Post {
  id: string; title: string; tag: string; date_label: string;
  excerpt: string; images: any; created_at: string;
}

export function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await db.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Blog posts fetch error:", error);
        return;
      }
      setPosts(data ?? []);
    };
    load();
    const ch = db.channel("blog-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

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
          const images: string[] = Array.isArray(p.images) ? p.images : [];
          const cover = images[0];
          return (
            <article key={p.id} className="group overflow-hidden rounded-2xl glass border border-white/10 hover:border-white/30 transition">
              <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                {cover ? (
                  <img src={cover} alt={p.title} loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />
                )}
                <span className="absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-heading font-bold tracking-[0.15em]"
                  style={{ color: "var(--fuchsia)", borderColor: "color-mix(in oklab, var(--fuchsia) 50%, transparent)", background: "color-mix(in oklab, var(--fuchsia) 15%, transparent)" }}>
                  {(p.tag || "STORY").toUpperCase()}
                </span>
              </div>
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
