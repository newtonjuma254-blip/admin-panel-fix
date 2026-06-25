import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./FileUpload";
import {
  Loader2, LogOut, Plus, Trash2, Pencil, X, Check, Search,
  Film, Save, MapPin,
  LayoutGrid, FileText, Settings as SettingsIcon, Package, Newspaper,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────
// Shared constants
// ──────────────────────────────────────────────────────────────────
export const CATEGORIES = [
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
const TAGS = ["NEW", "BESTSELLER", "LIMITED", "PRO"];

// Direct Supabase table client. No RPC role checks are used anywhere in this panel.
const db: any = supabase;

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────
interface ProductRow {
  id: string; name: string; category: string; price: number;
  duration: string; image: string; image_url: string; video_url: string;
  badge_tag: string; description: string;
}
interface HeroSlide { id: string; kind: "image" | "video"; url: string; position: number; }
interface CategoryTile { category: string; image_url: string; video_url: string; }
interface BlogPost { id: string; title: string; tag: string; date_label: string; excerpt: string; content: string; images: string[]; created_at: string; }
interface Location { id: string; city: string; area: string; place: string; phones: string; }

type Tab = "content" | "products" | "media" | "blog" | "settings";

// ──────────────────────────────────────────────────────────────────
// Tiny shared atoms
// ──────────────────────────────────────────────────────────────────
const Card = ({ children, title, sub }: { children: React.ReactNode; title?: string; sub?: string }) => (
  <div className="glass rounded-2xl p-5 border border-white/10 bg-white/[0.02]">
    {title && (
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    )}
    {children}
  </div>
);

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`min-h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--cyan)] transition ${p.className ?? ""}`}
  />
);
const TextArea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    className={`w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--cyan)] transition ${p.className ?? ""}`}
  />
);

const CyanBtn = ({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-heading font-semibold text-black disabled:opacity-40 transition hover:brightness-110 ${p.className ?? ""}`}
    style={{ background: "var(--cyan)" }}>
    {children}
  </button>
);
const VioletBtn = ({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-heading font-semibold text-white disabled:opacity-40 transition hover:brightness-110 ${p.className ?? ""}`}
    style={{ background: "var(--violet)" }}>
    {children}
  </button>
);
const GreenBtn = ({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-heading font-semibold text-white disabled:opacity-40 transition hover:brightness-110 ${p.className ?? ""}`}
    style={{ background: "#059669" }}>
    {children}
  </button>
);
const RedIconBtn = ({ ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 transition" title="Delete">
    <Trash2 className="h-4 w-4" style={{ color: "#fb7185" }} />
  </button>
);

const MediaPreview = ({ url, video }: { url: string; video?: boolean }) => {
  if (!url) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/40" style={{ width: 96, height: 56 }}>
      {video ? (
        <video src={url} muted playsInline className="h-full w-full object-cover" />
      ) : (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={url} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }} />
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────
// CONTENT TAB
// ──────────────────────────────────────────────────────────────────
function ContentTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await db.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? ""; });
    setSettings(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (key: string, value: string, label: string) => {
    const { error } = await db
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select("key")
      .single();
    if (error) toast.error(error.message);
    else toast.success(`${label} saved and confirmed in Supabase`);
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Brand Logo */}
      <Card title="Brand Logo" sub="Shown in the header on every page.">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="Paste logo URL or upload" value={settings.logo_url ?? ""} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} />
          <FileUpload accept="image/*" folder="logo" onUploaded={(url) => { setSettings((s) => ({ ...s, logo_url: url })); save("logo_url", url, "Logo"); }} />
        </div>
        <MediaPreview url={settings.logo_url ?? ""} />
        <CyanBtn className="mt-4 w-full" onClick={() => save("logo_url", settings.logo_url ?? "", "Logo")}><Check className="h-4 w-4" /> Apply Logo</CyanBtn>
      </Card>

      {/* Hero Copy */}
      <Card title="Hero Copy" sub="The headline + subtitle on the homepage hero.">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Display Title</label>
        <Input value={settings.hero_title ?? ""} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} placeholder="Display title" />
        <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3 mb-1">Sub-narrative</label>
        <TextArea rows={4} value={settings.hero_subtitle ?? ""} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} placeholder="Supporting paragraph" />
        <CyanBtn className="mt-4 w-full" onClick={async () => {
          await save("hero_title", settings.hero_title ?? "", "Hero title");
          await save("hero_subtitle", settings.hero_subtitle ?? "", "Hero subtitle");
        }}><Check className="h-4 w-4" /> Commit Hero Live</CyanBtn>
      </Card>

      {/* WhatsApp */}
      <Card title="WhatsApp Number" sub="Used by the floating Order button.">
        <p className="text-[10px] text-muted-foreground mb-2">International format, no +</p>
        <Input inputMode="numeric" value={settings.whatsapp_number ?? ""} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value.replace(/\D/g, "") })} placeholder="254700000000" />
        <GreenBtn className="mt-4 w-full" onClick={() => save("whatsapp_number", settings.whatsapp_number ?? "", "WhatsApp number")}><Save className="h-4 w-4" /> Save Number</GreenBtn>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// PRODUCTS TAB
// ──────────────────────────────────────────────────────────────────
function ProductsTab() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [rows, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id).select("id").single();
    if (error) toast.error(error.message);
    else { toast.success("Product deleted and confirmed in Supabase"); await load(); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="font-display text-lg font-semibold">≡ INVENTORY <span className="text-muted-foreground">({rows.length})</span></h3>
          <div className="w-full sm:ml-auto sm:w-auto">
          <VioletBtn onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> New Product</VioletBtn>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="🔍 Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20 sm:flex-row sm:items-center">
              {(r.image_url || r.video_url) && (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/40">
                  {r.video_url ? <video src={r.video_url} muted className="h-full w-full object-cover" /> : <img src={r.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-heading font-semibold truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground truncate">{r.category} · <span className="text-aurora">KSh {Number(r.price).toLocaleString()}</span></div>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button onClick={() => setEditing(r)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-heading text-sky-300 hover:bg-sky-500/20 sm:flex-none">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <RedIconBtn onClick={() => handleDelete(r.id)} />
              </div>
            </div>
          ))}
          {!filtered.length && <p className="text-center text-sm text-muted-foreground py-10">No products match.</p>}
        </div>
      )}

      {(editing || adding) && (
        <ProductEditor
          row={editing}
          onClose={() => { setEditing(null); setAdding(false); }}
          onSaved={async () => { setEditing(null); setAdding(false); await load(); }}
        />
      )}
    </div>
  );
}

function ProductEditor({ row, onClose, onSaved }: { row: ProductRow | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: row?.name ?? "",
    category: row?.category ?? CATEGORIES[0],
    price: row?.price ?? 0,
    duration: row?.duration ?? "60s",
    badge_tag: row?.badge_tag ?? "NEW",
    description: row?.description ?? "",
    image_url: row?.image_url ?? "",
    video_url: row?.video_url ?? "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true);
    const payload = { ...f, price: Number(f.price) };
    const { error } = row
      ? await supabase.from("products").update(payload).eq("id", row.id).select("id").single()
      : await supabase.from("products").insert(payload).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(row ? "Product updated and confirmed in Supabase" : "Product created and confirmed in Supabase");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-3 backdrop-blur sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0e0e18] p-4 sm:max-h-[85vh] sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="font-display text-xl font-semibold">{row ? "Edit Product" : "New Product"}</h3>
          <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full glass"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Name</label>
            <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Category</label>
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}
              className="min-h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Price (KSh)</label>
            <Input required type="number" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Tag</label>
            <select value={f.badge_tag} onChange={(e) => setF({ ...f, badge_tag: e.target.value })}
              className="min-h-11 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-sm">
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Duration</label>
            <Input value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Description</label>
            <TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Image URL</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} placeholder="https://..." />
              <FileUpload accept="image/*" folder="products" onUploaded={(url) => setF((s) => ({ ...s, image_url: url }))} />
            </div>
            <MediaPreview url={f.image_url} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Video URL (.mp4)</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={f.video_url} onChange={(e) => setF({ ...f, video_url: e.target.value })} placeholder="https://....mp4" />
              <FileUpload accept="video/*" folder="products" onUploaded={(url) => setF((s) => ({ ...s, video_url: url }))} />
            </div>
            <MediaPreview url={f.video_url} video />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-heading glass">Cancel</button>
          <CyanBtn disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {row ? "Save Changes" : "Create"}</CyanBtn>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// MEDIA TAB
// ──────────────────────────────────────────────────────────────────
function MediaTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [tiles, setTiles] = useState<CategoryTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImg, setNewImg] = useState("");
  const [newVid, setNewVid] = useState("");

  const load = async () => {
    const [{ data: s }, { data: t }] = await Promise.all([
      db.from("hero_slides").select("*").order("position"),
      db.from("category_tiles").select("*").order("category"),
    ]);
    setSlides((s ?? []) as HeroSlide[]);
    setTiles((t ?? []) as CategoryTile[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addSlide = async (kind: "image" | "video", url: string) => {
    if (!url) return toast.error("Paste a URL first");
    const { error } = await db.from("hero_slides").insert({ kind, url, position: slides.length }).select("id").single();
    if (error) return toast.error(error.message);
    toast.success(`${kind} slide added and confirmed in Supabase`);
    if (kind === "image") setNewImg(""); else setNewVid("");
    await load();
  };

  const deleteSlide = async (id: string) => {
    const { error } = await db.from("hero_slides").delete().eq("id", id).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Slide removed and confirmed in Supabase");
    await load();
  };

  const setTile = async (category: string, field: "image_url" | "video_url", value: string) => {
    const { error } = await db
      .from("category_tiles")
      .upsert({ category, [field]: value, updated_at: new Date().toISOString() }, { onConflict: "category" })
      .select("category")
      .single();
    if (error) return toast.error(error.message);
    toast.success(`${category} ${field === "image_url" ? "image" : "video"} saved and confirmed in Supabase`);
    await load();
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <Card title="Hero Slides" sub="Looping media on the homepage hero.">
        <div className="space-y-2 mb-4">
          {slides.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-2.5">
              <div className="h-10 w-16 overflow-hidden rounded bg-black/50 shrink-0 grid place-items-center">
                {s.kind === "video"
                  ? <Film className="h-4 w-4 text-muted-foreground" />
                  : <img src={s.url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.kind}</div>
                <div className="text-xs truncate font-mono">{s.url}</div>
              </div>
              <button onClick={() => deleteSlide(s.id)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20" title="Remove">
                <X className="h-3.5 w-3.5" style={{ color: "#fb7185" }} />
              </button>
            </div>
          ))}
          {!slides.length && <p className="text-xs text-muted-foreground text-center py-4">No slides yet.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <Input placeholder="Add image — URL or upload" value={newImg} onChange={(e) => setNewImg(e.target.value)} />
            <FileUpload accept="image/*" folder="hero" onUploaded={(url) => addSlide("image", url)} />
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add video (.mp4) — URL or upload" value={newVid} onChange={(e) => setNewVid(e.target.value)} />
            <FileUpload accept="video/*" folder="hero" label="Upload" onUploaded={(url) => addSlide("video", url)} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <CyanBtn onClick={() => addSlide("image", newImg)}><Plus className="h-4 w-4" /> Image URL</CyanBtn>
          <VioletBtn onClick={() => addSlide("video", newVid)}><Plus className="h-4 w-4" /> Video URL</VioletBtn>
        </div>
      </Card>

      <Card title="Category Tiles" sub="Set image & preview video per category. Files upload to the public media bucket for permanent cross-device storage.">
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const t = tiles.find((x) => x.category === cat) ?? { category: cat, image_url: "", video_url: "" };
            return <CategoryTileRow key={cat} tile={t} onSet={setTile} />;
          })}
        </div>
      </Card>
    </div>
  );
}

function CategoryTileRow({ tile, onSet }: { tile: CategoryTile; onSet: (c: string, f: "image_url" | "video_url", v: string) => void }) {
  const [img, setImg] = useState(tile.image_url);
  const [vid, setVid] = useState(tile.video_url);
  useEffect(() => { setImg(tile.image_url); setVid(tile.video_url); }, [tile.image_url, tile.video_url]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="font-heading font-semibold text-sm mb-3">{tile.category}</div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={img} onChange={(e) => setImg(e.target.value)} placeholder="Image URL" />
            <FileUpload accept="image/*" folder={`tiles/${tile.category}`} onUploaded={(url) => { setImg(url); onSet(tile.category, "image_url", url); }} />
            <VioletBtn onClick={() => onSet(tile.category, "image_url", img)}>Set URL</VioletBtn>
          </div>
          {tile.image_url && <p className="text-[10px] mt-1" style={{ color: "var(--cyan)" }}>✓ URL set</p>}
        </div>
        <div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={vid} onChange={(e) => setVid(e.target.value)} placeholder="Video Preview (.mp4) URL" />
            <FileUpload accept="video/*" folder={`tiles/${tile.category}`} onUploaded={(url) => { setVid(url); onSet(tile.category, "video_url", url); }} />
            <VioletBtn onClick={() => onSet(tile.category, "video_url", vid)}>Set URL</VioletBtn>
          </div>
          {tile.video_url && <p className="text-[10px] mt-1" style={{ color: "var(--cyan)" }}>✓ URL set</p>}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// BLOG TAB
// ──────────────────────────────────────────────────────────────────
function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [date, setDate] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await db.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data ?? []) as BlogPost[]);
  };
  useEffect(() => { load(); }, []);

  const publish = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    const { error } = await db.from("blog_posts").insert({ title, tag, date_label: date, excerpt, content, images }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Post published and confirmed in Supabase");
    setTitle(""); setTag(""); setDate(""); setExcerpt(""); setContent(""); setImages([]); setImgUrl("");
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await db.from("blog_posts").delete().eq("id", id).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Post deleted and confirmed in Supabase"); await load();
  };

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-display font-semibold text-base mb-4" style={{ color: "var(--cyan)" }}>+ NEW BLOG POST</h3>
        <Input placeholder="e.g., Grand Wedding at Karen Country Club" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
          <Input placeholder="Wedding, Corporate..." value={tag} onChange={(e) => setTag(e.target.value)} />
          <Input placeholder="May 2025" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Input className="mt-3" placeholder="Short excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        <TextArea className="mt-3" rows={6} placeholder="Write the full story here..." value={content} onChange={(e) => setContent(e.target.value)} />

        <div className="mt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Add image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
            <FileUpload accept="image/*" folder="blog" onUploaded={(url) => setImages((arr) => [...arr, url])} />
          </div>
          <button type="button"
            onClick={() => { if (!imgUrl) return; setImages([...images, imgUrl]); setImgUrl(""); }}
            className="mt-2 min-h-11 w-full rounded-xl border border-dashed border-white/15 px-3 py-2 text-xs font-heading text-muted-foreground hover:border-white/30">
            + Add Image URL
          </button>
          {images.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((u, i) => (
                <div key={i} className="relative">
                  <img src={u} alt="" className="h-14 w-20 object-cover rounded" />
                  <button aria-label="Remove image" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-xs text-white">×</button>
                </div>
              ))}
            </div>
          ) : <p className="mt-2 text-[11px] text-muted-foreground">No images added yet. First image = cover.</p>}
        </div>

        <CyanBtn className="mt-5 w-full" onClick={publish} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish Post
        </CyanBtn>
      </Card>

      <Card title={`Published Posts (${posts.length})`}>
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
              {p.images?.[0] && <img src={p.images[0]} alt="" className="h-12 w-16 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="font-heading font-semibold truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.tag} · {p.date_label}</div>
              </div>
              <RedIconBtn onClick={() => remove(p.id)} />
            </div>
          ))}
          {!posts.length && <p className="text-xs text-muted-foreground text-center py-4">No posts yet.</p>}
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// LOCATIONS TAB (rendered as "Settings" tab per spec)
// ──────────────────────────────────────────────────────────────────
function LocationsTab() {
  const [items, setItems] = useState<Location[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await db.from("store_locations").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Location[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    setBusy(true);
    const { error } = await db.from("store_locations").insert({ city: "New Location", area: "", place: "", phones: "" }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Location added and confirmed in Supabase"); await load();
  };

  const save = async (loc: Location) => {
    const { id, ...rest } = loc;
    const { error } = await db.from("store_locations").update(rest).eq("id", id).select("id").single();
    if (error) return toast.error(error.message);
    toast.success(`${loc.city || "Location"} saved and confirmed in Supabase`);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    const { error } = await db.from("store_locations").delete().eq("id", id).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Location deleted and confirmed in Supabase"); await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2"><MapPin className="h-5 w-5" /> STORE LOCATIONS</h3>
        <div className="w-full sm:ml-auto sm:w-auto"><VioletBtn onClick={add} disabled={busy}><Plus className="h-4 w-4" /> Add Location</VioletBtn></div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">Add, edit or remove store locations shown on the website.</p>

      <div className="space-y-4">
        {items.map((loc, idx) => (
          <LocationCard key={loc.id} loc={loc} onChange={(v) => setItems(items.map((x, i) => i === idx ? v : x))} onSave={() => save(items[idx])} onDelete={() => remove(loc.id)} />
        ))}
        {!items.length && <p className="text-xs text-muted-foreground text-center py-4">No locations yet.</p>}
      </div>
    </div>
  );
}

function LocationCard({ loc, onChange, onSave, onDelete }: { loc: Location; onChange: (v: Location) => void; onSave: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="font-display text-sm font-semibold flex-1">{loc.city || "Untitled"}</div>
        <VioletBtn onClick={onSave}><Save className="h-3.5 w-3.5" /> Save</VioletBtn>
        <RedIconBtn onClick={onDelete} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="City" value={loc.city} onChange={(e) => onChange({ ...loc, city: e.target.value })} />
        <Input placeholder="Area / Street" value={loc.area} onChange={(e) => onChange({ ...loc, area: e.target.value })} />
        <Input className="md:col-span-2" placeholder="Shop / Place (e.g., Zodiac Stalls 1st Floor shop Z16)" value={loc.place} onChange={(e) => onChange({ ...loc, place: e.target.value })} />
        <TextArea className="md:col-span-2" rows={3} placeholder="Phone numbers (one per line)" value={loc.phones} onChange={(e) => onChange({ ...loc, phones: e.target.value })} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ROOT PANEL — Right-side drawer with bottom dock
// ──────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "content", label: "Content", icon: FileText },
  { id: "products", label: "Products", icon: Package },
  { id: "media", label: "Media", icon: LayoutGrid },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function AdminPanel({ onClose, onSignOut }: { onClose: () => void; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("content");

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#09090f] shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] font-heading" style={{ color: "var(--cyan)" }}>Supervisor Console</div>
            <h2 className="font-display text-xl font-bold">Control <span className="text-aurora">Panel</span></h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={onSignOut} className="inline-flex min-h-11 items-center gap-2 rounded-full glass px-3 py-2 text-xs font-heading">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
            <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full glass"><X className="h-4 w-4" /></button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-28 sm:p-5 sm:pb-24">
          {tab === "content" && <ContentTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "media" && <MediaTab />}
          {tab === "blog" && <BlogTab />}
          {tab === "settings" && <LocationsTab />}
        </div>

        {/* Bottom dock */}
        <nav className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#050508]/90 backdrop-blur px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] uppercase tracking-[0.15em] font-heading transition ${active ? "text-white" : "text-muted-foreground hover:text-white"}`}
                  style={active ? { background: "color-mix(in oklab, var(--violet) 25%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--violet) 60%, transparent)" } : undefined}>
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}
