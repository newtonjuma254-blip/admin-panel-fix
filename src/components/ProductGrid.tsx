import { useEffect, useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage, type Product, type Tag } from "@/lib/products";
import { ProductCard } from "./ProductCard";

const CATEGORIES: ("All" | string)[] = [
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
const PRICE_TIERS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under KSh 3,000", min: 0, max: 3000 },
  { label: "KSh 3,000 – 10,000", min: 3000, max: 10000 },
  { label: "KSh 10,000 – 30,000", min: 10000, max: 30000 },
  { label: "Premium · 30,000+", min: 30000, max: Infinity },
];

export function ProductGrid({ onAdd, onWatch }: { onAdd: (p: Product) => void; onWatch: (p: Product) => void }) {
  const [cat, setCat] = useState<string>("All");
  const [tier, setTier] = useState(0);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, duration, image, image_url, video_url, badge_tag, description")
        .order("created_at", { ascending: true });
      if (!active) return;
      if (error) {
        console.error("Products fetch error:", error);
        setLoading(false);
        return;
      }
      if (!data) { setLoading(false); return; }
      setProducts(
        data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          duration: p.duration ?? "60s",
          image: p.image_url?.startsWith("http") ? p.image_url : resolveImage(p.image ?? "", p.category),
          video: p.video_url?.startsWith("http") ? p.video_url : undefined,
          tag: (p.badge_tag as Tag) ?? "NEW",
          description: p.description ?? "",
        })),
      );
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel("products-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => load())
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const t = PRICE_TIERS[tier];
    return products.filter(
      (p) => (cat === "All" || p.category === cat) && p.price >= t.min && p.price <= t.max,
    );
  }, [cat, tier, products]);

  return (
    <section id="catalog" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
        <div>
          <div className="text-xs font-heading uppercase tracking-[0.25em]" style={{ color: "var(--cyan)" }}>
            Live Catalog
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
            Pick your <span className="text-aurora">pyrotechnic</span>.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg">
            {loading ? "Loading inventory…" : `${filtered.length} items in stock — same-day Nairobi metro delivery available.`}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full glass px-4 py-2.5 text-sm font-heading transition hover:border-white/20"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {PRICE_TIERS[tier].label}
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl glass p-2 z-20 animate-float-up">
              {PRICE_TIERS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setTier(i); setOpen(false); }}
                  className={`min-h-11 w-full rounded-xl px-3 py-2.5 text-left text-sm font-heading transition ${
                    i === tier ? "bg-aurora text-white" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chip ${c === cat ? "chip-active" : ""}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => onAdd(p)} onWatch={() => onWatch(p)} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-20 glass rounded-2xl">
          No products match these filters.
        </div>
      )}
    </section>
  );
}
