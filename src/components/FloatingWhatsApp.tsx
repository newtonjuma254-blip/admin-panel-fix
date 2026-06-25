import { MessageCircle } from "lucide-react";
import { buildWaLink, useStorefront } from "@/lib/storefront";

export function FloatingWhatsApp() {
  const { whatsapp, hoverProduct } = useStorefront();
  if (!whatsapp) return null;

  const msg = hoverProduct
    ? `Hi, I am looking at the ${hoverProduct.name} (KSh ${hoverProduct.price.toLocaleString()}) and have a quick question about it.`
    : "Hi, I'm browsing your website and would like to make an inquiry!";

  return (
    <a
      href={buildWaLink(whatsapp, msg)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[80] grid h-14 w-14 place-items-center rounded-full shadow-2xl transition hover:scale-110"
      style={{ background: "#25D366", boxShadow: "0 10px 30px -5px rgba(37, 211, 102, 0.6)" }}
    >
      <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#25D366", opacity: 0.4 }} />
      <MessageCircle className="relative h-7 w-7 text-white" fill="white" stroke="#075E54" strokeWidth={1.5} />
      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background" style={{ background: "var(--fuchsia)" }} />
    </a>
  );
}
