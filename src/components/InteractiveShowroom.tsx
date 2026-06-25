import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, ShoppingCart, MessageCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage, type Product } from "@/lib/products";
import { useStorefront, buildWaLink } from "@/lib/storefront";

const db: any = supabase;

const CATEGORIES = [
  "All",
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
];

interface Row {
  id: string; name: string; category: string; price: number;
  duration: string; image: string; image_url: string; video_url: string;
  badge_tag: string; description: string;
}

export function InteractiveShowroom({
  cat, setCat, onAdd,
}: {
  cat: string;
  setCat: (c: string) => void;
  onAdd: (p: Product) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await db.from("products")
        .select("id, name, category, price, duration, image, image_url, video_url, badge_tag, description")
        .order("created_at", { ascending: true });
      setRows(data ?? []);
      setLoading(false);
    };
    load();
    const ch = db.channel("showroom-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) =>
      (cat === "All" || r.category === cat) &&
      (q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || r.description?.toLowerCase().includes(q.toLowerCase())),
    );
  }, [rows, cat, q]);

  return (
    <section id="catalog" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-6">
        <h2 className="font-display text-3xl sm:text-4xl font-bold">Browse Interactive Shop</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {loading ? "Loading inventory…" : `${filtered.length} products found`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Search products..."
              className="min-h-11 w-full rounded-full glass border border-white/10 bg-black/30 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--cyan)]"
          />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-xs font-heading whitespace-nowrap border transition ${
                c === cat
                  ? "bg-aurora text-white border-transparent glow-violet"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((r) => (
            <ShowroomCard key={r.id} row={r} onAdd={onAdd} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-20 glass rounded-2xl">
              No products match your search.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ShowroomCard({ row, onAdd }: { row: Row; onAdd: (p: Product) => void }) {
  const { whatsapp, setHoverProduct } = useStorefront();
  const vref = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  const image = row.image_url || resolveImage(row.image ?? "", row.category);

  const product: Product = {
    id: row.id,
    name: row.name,
    category: row.category as any,
    price: Number(row.price),
    duration: row.duration ?? "60s",
    image,
    tag: (row.badge_tag as any) ?? "NEW",
    description: row.description ?? "",
  };

  const onEnter = () => {
    setHover(true);
    setHoverProduct({ name: row.name, price: Number(row.price) });
    if (row.video_url && vref.current) {
      vref.current.currentTime = 0;
      vref.current.play().catch(() => {});
    }
  };
  const onLeave = () => {
    setHover(false);
    setHoverProduct(null);
    vref.current?.pause();
  };

  const orderHref = buildWaLink(
    whatsapp,
    `Hello, I want to order the ${row.name} priced at KSh ${Number(row.price).toLocaleString()}. Please let me know how to proceed.`,
  );

  return (
    <article
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden rounded-2xl glass border border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-white/30"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={row.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: hover && row.video_url ? 0 : 1 }}
        />
        {row.video_url && (
          <video
            ref={vref}
            src={row.video_url}
            muted loop playsInline preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: hover ? 1 : 0, transition: "opacity 500ms" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-heading font-bold tracking-[0.15em]"
          style={{ color: "var(--cyan)", borderColor: "color-mix(in oklab, var(--cyan) 50%, transparent)", background: "color-mix(in oklab, var(--cyan) 12%, transparent)" }}>
          {row.badge_tag || "NEW"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="text-[10px] font-heading uppercase tracking-[0.2em] text-muted-foreground">{row.category}</div>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{row.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{row.description}</p>
        </div>
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-white/5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
            <div className="font-display text-xl font-bold text-aurora">KSh {Number(row.price).toLocaleString()}</div>
          </div>
          <div className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><Plus className="h-3 w-3" />{row.duration}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onAdd(product)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.03] py-2.5 text-xs font-heading font-semibold transition hover:border-white/30 hover:bg-white/[0.06]"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Cart
          </button>
          <a
            href={orderHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-heading font-semibold text-white transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Order
          </a>
        </div>
      </div>
    </article>
  );
}
