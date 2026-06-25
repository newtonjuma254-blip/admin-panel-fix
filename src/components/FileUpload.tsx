import { useRef, useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { uploadPublicMedia } from "@/utils/storage";

interface Props {
  accept?: string;
  folder?: string;
  onUploaded: (url: string) => void;
  label?: string;
}

/**
 * Uploads a file to the public `media` Supabase Storage bucket and returns
 * its public URL via onUploaded. Persists across devices/browsers.
 */
export function FileUpload({ accept = "image/*,video/*", folder = "uploads", onUploaded, label = "Upload" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadPublicMedia(file, folder);
      onUploaded(url);
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handle} />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        title={label}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] font-heading text-white disabled:opacity-50"
        style={{
          background: "color-mix(in oklab, var(--violet) 25%, transparent)",
          border: "1px solid color-mix(in oklab, var(--violet) 60%, transparent)",
        }}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
        {busy ? "Uploading..." : label}
      </button>
    </>
  );
}
