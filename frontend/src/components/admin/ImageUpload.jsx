import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, resolveImageUrl } from "../../lib/api";

/**
 * Reusable image uploader. Stores the resulting URL on parent via onChange(url).
 * Props:
 *  - value: current url (relative or absolute)
 *  - onChange(url): callback when uploaded or cleared
 *  - label: optional label
 *  - testId: optional data-testid prefix
 *  - aspect: 'square' | 'wide' | 'tall'
 */
export default function ImageUpload({ value, onChange, label, testId = "image-upload", aspect = "wide" }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const ratioClass = {
    square: "aspect-square",
    wide: "aspect-[16/9]",
    tall: "aspect-[3/4]",
  }[aspect];

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Ukuran maksimum 4 MB");
      return;
    }
    setBusy(true);
    try {
      const res = await uploadImage(file);
      onChange(res.url);
      toast.success("Gambar terunggah");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal mengunggah");
    } finally {
      setBusy(false);
    }
  };

  const previewUrl = value ? resolveImageUrl(value) : null;

  return (
    <div data-testid={testId}>
      {label && (
        <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
          {label}
        </label>
      )}
      <div className={`mt-2 relative ${ratioClass} rounded-xl border-2 border-dashed border-[#E5E1D8] bg-[#F4F1EB] overflow-hidden`}>
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Pratinjau"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              type="button"
              data-testid={`${testId}-clear`}
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-[#C05638] flex items-center justify-center shadow hover:bg-white"
              aria-label="Hapus gambar"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            data-testid={`${testId}-pick`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#757873] hover:text-[#2D4A3E] transition-colors"
          >
            {busy ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
            <span className="text-xs">
              {busy ? "Mengunggah..." : "Klik untuk unggah gambar"}
            </span>
            <span className="text-[10px] text-[#757873]">JPG / PNG / WEBP — maks 4MB</span>
          </button>
        )}
      </div>
      {previewUrl && (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          data-testid={`${testId}-replace`}
          className="mt-2 text-xs text-[#2D4A3E] hover:underline disabled:opacity-50"
        >
          {busy ? "Mengunggah..." : "Ganti gambar"}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
        data-testid={`${testId}-input`}
      />
    </div>
  );
}
