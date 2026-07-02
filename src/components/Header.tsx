import { useState } from "react";
import { Menu, Sparkles, ShoppingBag, ShieldCheck, X } from "lucide-react";
import { useStorefront } from "@/lib/storefront";

interface HeaderProps {
  cartCount: number;
  adminMode: boolean;
  onToggleAdmin: () => void;
  onOpenCart: () => void;
}

export function Header({ cartCount, adminMode, onToggleAdmin, onOpenCart }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useStorefront();
  const logoUrl = settings.logo_url?.trim();

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <a href="#top" className="group flex min-h-11 min-w-0 items-center gap-2 sm:gap-3" onClick={closeMobile}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Nairobi Fireworks Shop logo"
              width={56}
              height={56}
              className="h-10 w-10 shrink-0 rounded-xl object-contain sm:h-12 sm:w-12"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-aurora glow-violet">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-aurora opacity-50 blur-md -z-10 animate-pulse-glow" />
            </div>
          )}
          <div className="min-w-0 leading-tight">
            <div className="font-display text-[13px] font-bold tracking-tight truncate xs:text-sm lg:text-base">
              NAIROBI <span className="text-aurora">FIREWORKS</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px]">Shop</div>
          </div>
        </a>

        <nav className="hidden md:flex md:min-w-0 md:justify-center items-center gap-4 lg:gap-7 text-sm font-heading text-muted-foreground">
          <a href="#catalog" className="inline-flex min-h-11 items-center transition hover:text-foreground">Catalog</a>
          <a href="#funnel" className="inline-flex min-h-11 items-center whitespace-nowrap transition hover:text-foreground">Order Funnel</a>
          <a href="#hero" className="inline-flex min-h-11 items-center transition hover:text-foreground">Showcase</a>
          <a href="#contact" className="inline-flex min-h-11 items-center transition hover:text-foreground">Contact</a>
        </nav>


        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onToggleAdmin}
            className={`hidden min-h-11 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-heading font-medium border transition sm:inline-flex ${
              adminMode
                ? "bg-cyan/10 border-cyan/40 text-cyan glow-cyan"
                : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
            }`}
            style={adminMode ? { color: "var(--cyan)", borderColor: "rgba(34,211,238,0.4)" } : undefined}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {adminMode ? "ADMIN ON" : "Admin Access"}
          </button>

          <button
            onClick={onOpenCart}
            className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-4 py-2 text-sm font-heading font-semibold text-white glow-violet transition hover:scale-[1.03]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/30 px-1.5 text-[11px] font-bold">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-foreground transition hover:border-white/30 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 pt-3 text-sm font-heading text-muted-foreground">
            <a href="#catalog" onClick={closeMobile} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-foreground">Catalog</a>
            <a href="#funnel" onClick={closeMobile} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-foreground">Order Funnel</a>
            <a href="#hero" onClick={closeMobile} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-foreground">Showcase</a>
            <a href="#contact" onClick={closeMobile} className="flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-foreground">Contact</a>
            <button
              onClick={() => { closeMobile(); onToggleAdmin(); }}
              className={`mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-heading font-medium border transition ${
                adminMode
                  ? "bg-cyan/10 border-cyan/40 text-cyan glow-cyan"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
              style={adminMode ? { color: "var(--cyan)", borderColor: "rgba(34,211,238,0.4)" } : undefined}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {adminMode ? "ADMIN ON" : "Admin Access"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
