import cake from "@/assets/p-cake.jpg";
import rocket from "@/assets/p-rocket.jpg";
import sparkler from "@/assets/p-sparkler.jpg";
import fountain from "@/assets/p-fountain.jpg";
import shell from "@/assets/p-shell.jpg";
import candle from "@/assets/p-candle.jpg";
import mega from "@/assets/p-mega.jpg";

export type Category = "Cakes" | "Rockets" | "Sparklers" | "Fountains";
export type Tag = "NEW" | "BESTSELLER" | "LIMITED" | "PRO";

export interface Product {
  id: string;
  name: string;
  category: Category | string;
  price: number;
  duration: string;
  image: string;
  video?: string;
  tag: Tag;
  description: string;
}

const IMAGE_MAP: Record<string, string> = {
  "p-cake.jpg": cake,
  "p-rocket.jpg": rocket,
  "p-sparkler.jpg": sparkler,
  "p-fountain.jpg": fountain,
  "p-shell.jpg": shell,
  "p-candle.jpg": candle,
  "p-mega.jpg": mega,
};

const CATEGORY_FALLBACK: Record<string, string> = {
  Cakes: cake,
  Rockets: rocket,
  Sparklers: sparkler,
  Fountains: fountain,
};

export function resolveImage(imageField: string, category: string): string {
  if (imageField?.startsWith("http")) return imageField;
  const base = imageField?.split("/").pop() ?? "";
  return IMAGE_MAP[base] ?? CATEGORY_FALLBACK[category] ?? cake;
}
