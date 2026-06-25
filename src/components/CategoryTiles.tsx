import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

const ALL_CATEGORIES = [
  "Display Fireworks",
  "Medium Fireworks",
  "Small Fireworks",
  "Party Supplies",
  "Decorative Lighting",
  "Club Accessories",
  "Event Services",
  "Glow in the Dark",
  "Halloween",
  "Fountains & Sparklers",
] as const;

interface Tile { category: string; image_url: string; video_url: string; }

export function CategoryTiles({ onPick }: { onPick?: (cat: string) => void }) {
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await db.from("category_tiles").select("*");
      setTiles(data ?? []);
    };
    load();
    const ch = db.channel("cat-tiles-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "category_tiles" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  const byCat = (c: string) => tiles.find((t) => t.category === c);

  return (
    <section id="categories" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full" style={{ background: "var(--cyan)" }} />
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Shop By Category</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap any category to filter the showroom · Hover to watch a preview
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {ALL_CATEGORIES.map((c) => {
          const t = byCat(c);
          return <Tile key={c} category={c} tile={t} onClick={() => onPick?.(c)} />;
        })}
      </div>
    </section>
  );
}

function Tile({ category, tile, onClick }: { category: string; tile?: Tile; onClick: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  const onEnter = () => {
    setHover(true);
    if (tile?.video_url && ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  };
  const onLeave = () => {
    setHover(false);
    ref.current?.pause();
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left hover:border-white/30 transition"
    >
      {tile?.image_url ? (
        <img
          src={tile.image_url}
          alt={category}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: hover && tile.video_url ? 0 : 1 }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "var(--gradient-night)" }} />
      )}
      {tile?.video_url && (
        <video
          ref={ref}
          src={tile.video_url}
          muted loop playsInline preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: hover ? 1 : 0 }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-[10px] uppercase tracking-[0.2em] font-heading" style={{ color: "var(--cyan)" }}>Category</div>
        <div className="mt-1 font-display text-sm sm:text-base font-bold leading-tight">{category}</div>
      </div>
    </button>
  );
}
