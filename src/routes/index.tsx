import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { CategoryTiles } from "@/components/CategoryTiles";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { StorefrontProvider } from "@/lib/storefront";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/products";

const OrderFunnel = lazy(() => import("@/components/OrderFunnel").then(m => ({ default: m.OrderFunnel })));
const InteractiveShowroom = lazy(() => import("@/components/InteractiveShowroom").then(m => ({ default: m.InteractiveShowroom })));
const ExperiencesSlider = lazy(() => import("@/components/ExperiencesSlider").then(m => ({ default: m.ExperiencesSlider })));
const BlogSection = lazy(() => import("@/components/BlogSection").then(m => ({ default: m.BlogSection })));
const StoreLocations = lazy(() => import("@/components/StoreLocations").then(m => ({ default: m.StoreLocations })));
const AdminAuth = lazy(() => import("@/components/AdminAuth").then(m => ({ default: m.AdminAuth })));
const AdminPanel = lazy(() => import("@/components/AdminPanel").then(m => ({ default: m.AdminPanel })));

const SectionFallback = () => (
  <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
    <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
  </div>
);

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [cart, setCart] = useState<Product[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setPanelOpen(false);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const handleAdminClick = () => {
    if (panelOpen) {
      setPanelOpen(false);
    } else {
      // Always require credentials before opening the panel,
      // even if a previous admin session is still active.
      setAuthOpen(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setPanelOpen(false);
  };

  const handlePickCategory = (c: string) => {
    setActiveCat(c);
    setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const total = cart.reduce((s, p) => s + p.price, 0);

  return (
    <StorefrontProvider>
      <div id="top" className="relative min-h-screen overflow-x-hidden">
        <Header
          cartCount={cart.length}
          adminMode={panelOpen}
          onToggleAdmin={handleAdminClick}
          onOpenCart={() => setCartOpen(true)}
        />
        {authOpen && <Suspense fallback={null}><AdminAuth onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); setPanelOpen(true); }} /></Suspense>}
        {panelOpen && <Suspense fallback={null}><AdminPanel onClose={() => setPanelOpen(false)} onSignOut={handleSignOut} /></Suspense>}

        {panelOpen && (
          <div className="border-b border-cyan/20 bg-cyan/5 text-center py-2 text-xs font-heading uppercase tracking-[0.2em]" style={{ color: "var(--cyan)" }}>
            Admin Console · Inventory · Orders · Pyrotechnics License #KEBS-2024-NRB
          </div>
        )}

        {/* 1. Hero slideshow */}
        <HeroSlideshow />

        {/* 2. Category grid */}
        <CategoryTiles onPick={handlePickCategory} />

        {/* 3. Custom Show Builder (multi-step funnel) */}
        <Suspense fallback={<SectionFallback />}><OrderFunnel /></Suspense>

        {/* 4. Interactive digital showroom */}
        <Suspense fallback={<SectionFallback />}><InteractiveShowroom cat={activeCat} setCat={setActiveCat} onAdd={(p) => setCart([...cart, p])} /></Suspense>

        {/* 5. Retained experiences slider */}
        <Suspense fallback={<SectionFallback />}><ExperiencesSlider /></Suspense>

        {/* 6. FireGuide blog */}
        <Suspense fallback={<SectionFallback />}><BlogSection /></Suspense>

        {/* 7. Geographic outlets map dock */}
        <Suspense fallback={<SectionFallback />}><StoreLocations /></Suspense>


        {/* Footer */}
        <footer id="contact" className="border-t border-white/5 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-aurora">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="font-display font-bold">NAIROBI<span className="text-aurora">.FW</span></div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Licensed pyrotechnics specialists serving Nairobi &amp; coastal Kenya since 2014.
              </p>
            </div>
            <div className="text-sm">
              <div className="font-heading font-semibold mb-3">Studio</div>
              <div className="text-muted-foreground space-y-1.5">
                <div>Westlands · Nairobi</div>
                <div>+254 700 000 000</div>
                <div>hello@nairobifw.co.ke</div>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-heading font-semibold mb-3">Hours</div>
              <div className="text-muted-foreground space-y-1.5">
                <div>Mon–Sat · 9:00 – 20:00</div>
                <div>Sun · Bookings only</div>
                <div>Events · 24/7 on-site</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nairobi Fireworks Store. All bursts reserved.
          </div>
        </footer>

        {/* Floating WhatsApp */}
        <FloatingWhatsApp />

        {/* Cart drawer */}
        {cartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end" onClick={() => setCartOpen(false)}>
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <aside
              className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 p-4 animate-float-up glass sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-heading">Cart</div>
                  <h3 className="font-display text-2xl font-bold">{cart.length} items</h3>
                </div>
                <button onClick={() => setCartOpen(false)} className="grid h-11 w-11 place-items-center rounded-full glass">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-20 text-sm">Your cart is empty.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((p, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-white/5 p-3">
                      <img src={p.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-semibold text-sm truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category} · {p.duration}</div>
                        <div className="text-sm font-bold text-aurora mt-1">KSh {p.price.toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => setCart(cart.filter((_, j) => j !== i))}
                        className="min-h-11 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-aurora">KSh {total.toLocaleString()}</span>
                  </div>
                  <button className="min-h-11 w-full rounded-full bg-aurora py-3.5 text-sm font-heading font-bold text-white glow-violet">
                    Checkout
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </StorefrontProvider>
  );
}
