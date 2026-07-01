import { useRef, useState } from "react";
import { Play, Plus, Clock } from "lucide-react";
import type { Product } from "@/lib/products";

const tagStyles: Record<Product["tag"], string> = {
  NEW: "bg-cyan/15 text-cyan border-cyan/30",
  BESTSELLER: "bg-violet/15 text-violet border-violet/30",
  LIMITED: "bg-fuchsia/15 text-fuchsia border-fuchsia/30",
  PRO: "bg-white/10 text-foreground border-white/20",
};

const tagColor: Record<Product["tag"], string> = {
  NEW: "var(--cyan)",
  BESTSELLER: "var(--violet)",
  LIMITED: "var(--fuchsia)",
  PRO: "#fff",
};

export function ProductCard({ product, onAdd, onWatch }: { product: Product; onAdd: () => void; onWatch: () => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const onEnter = () => {
    setHover(true);
    if (product.video && vidRef.current) {
      vidRef.current.currentTime = 0;
      vidRef.current.play().catch(() => {});
    }
  };
  const onLeave = () => {
    setHover(false);
    vidRef.current?.pause();
  };
  return (
    <article
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden rounded-2xl glass transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ opacity: hover && product.video ? 0 : 1 }}
          loading="lazy"
        />
        {product.video && (
          <video
            ref={vidRef}
            src={product.video}
            muted loop playsInline preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: hover ? 1 : 0 }}
          />
        )}

        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-heading font-bold tracking-[0.15em] ${tagStyles[product.tag]}`}
          style={{ color: tagColor[product.tag], borderColor: `${tagColor[product.tag]}50` }}
        >
          {product.tag}
        </span>

        <button
          onClick={onWatch}
          className="watch-btn absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full glass opacity-0 transition hover:scale-110 group-hover:opacity-100"
          aria-label="Watch preview"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>

        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {product.duration}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="text-[10px] font-heading uppercase tracking-[0.2em] text-muted-foreground">{product.category}</div>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-end justify-between gap-2 pt-2 border-t border-white/5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
            <div className="font-display text-xl font-bold text-aurora">
              KSh {product.price.toLocaleString()}
            </div>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-aurora px-3.5 py-2 text-xs font-heading font-semibold text-white transition hover:glow-violet"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
