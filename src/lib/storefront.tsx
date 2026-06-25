import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

interface StoreCtx {
  settings: Record<string, string>;
  whatsapp: string;
  hoverProduct: { name: string; price: number } | null;
  setHoverProduct: (p: { name: string; price: number } | null) => void;
}

const Ctx = createContext<StoreCtx>({
  settings: {},
  whatsapp: "",
  hoverProduct: null,
  setHoverProduct: () => {},
});

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [hoverProduct, setHoverProduct] = useState<StoreCtx["hoverProduct"]>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await db.from("site_settings").select("*");
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
      setSettings(map);
    };
    load();
    const channel = db
      .channel("site-settings-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, load)
      .subscribe();
    return () => { db.removeChannel(channel); };
  }, []);

  return (
    <Ctx.Provider value={{ settings, whatsapp: settings.whatsapp_number ?? "", hoverProduct, setHoverProduct }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStorefront = () => useContext(Ctx);

export function buildWaLink(number: string, message: string) {
  const clean = (number || "").replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
