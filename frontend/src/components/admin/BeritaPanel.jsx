import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  getBerita,
  createBerita,
  updateBerita,
  deleteBerita,
  resolveImageUrl,
} from "../../lib/api";
import { PanelHeader, PanelCard, FieldLabel } from "./_common";
import { Plus, Trash2, Save, Pencil, X } from "lucide-react";
import ImageUpload from "./ImageUpload";

const today = new Date().toISOString().slice(0, 10);
const empty = {
  judul: "",
  ringkasan: "",
  konten: "",
  kategori: "Berita",
  tanggal: today,
  penulis: "Sekretariat RT",
  gambar: "",
};

const KATEGORI = ["Berita", "Pengumuman", "Kegiatan"];

export default function BeritaPanel() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () =>
    getBerita({ limit: 50 })
      .then(setItems)
      .catch(() => toast.error("Gagal memuat berita"));

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm({ ...empty, tanggal: today });
    setEditing("new");
  };
  const startEdit = (b) => {
    setForm({
      judul: b.judul,
      ringkasan: b.ringkasan,
      konten: b.konten,
      kategori: b.kategori,
      tanggal: b.tanggal,
      penulis: b.penulis,
      gambar: b.gambar || "",
    });
    setEditing(b.id);
  };
  const cancel = () => {
    setEditing(null);
    setForm(empty);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.ringkasan || !form.konten) {
      toast.error("Lengkapi judul, ringkasan, dan konten");
      return;
    }
    try {
      if (editing === "new") {
        await createBerita(form);
        toast.success("Berita ditambahkan");
      } else {
        await updateBerita(editing, form);
        toast.success("Berita diperbarui");
      }
      cancel();
      load();
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus berita ini?")) return;
    try {
      await deleteBerita(id);
      toast.success("Berita dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div data-testid="berita-panel">
      <PanelHeader
        title="Berita & Pengumuman"
        subtitle="Kelola publikasi untuk warga."
        action={
          editing === null && (
            <button data-testid="berita-add" onClick={startNew} className="btn-primary">
              <Plus size={16} /> Tambah Berita
            </button>
          )
        }
      />

      {editing !== null && (
        <PanelCard className="mb-6">
          <form onSubmit={save} noValidate data-testid="berita-form" className="grid sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <FieldLabel required>Judul</FieldLabel>
              <Input className="mt-2 rounded-xl" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Kategori</FieldLabel>
              <select
                className="mt-2 w-full h-10 rounded-xl border border-[#E5E1D8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                {KATEGORI.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Tanggal</FieldLabel>
              <Input type="date" className="mt-2 rounded-xl" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
            </div>
            <div className="sm:col-span-8">
              <ImageUpload
                value={form.gambar}
                onChange={(url) => setForm({ ...form, gambar: url })}
                label="Gambar Sampul (opsional)"
                testId="berita-gambar"
                aspect="wide"
              />
            </div>
            <div className="sm:col-span-4">
              <FieldLabel>Penulis</FieldLabel>
              <Input className="mt-2 rounded-xl" value={form.penulis} onChange={(e) => setForm({ ...form, penulis: e.target.value })} />
            </div>
            <div className="sm:col-span-12">
              <FieldLabel required>Ringkasan</FieldLabel>
              <Textarea rows={2} className="mt-2 rounded-xl" value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} />
            </div>
            <div className="sm:col-span-12">
              <FieldLabel required>Konten</FieldLabel>
              <Textarea rows={5} className="mt-2 rounded-xl" value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} />
            </div>
            <div className="sm:col-span-12 flex gap-2 justify-end">
              <button type="button" onClick={cancel} className="btn-secondary">
                <X size={16} /> Batal
              </button>
              <button type="submit" data-testid="berita-save" className="btn-primary">
                <Save size={16} /> Simpan
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((b) => (
          <div key={b.id} data-testid={`berita-row-${b.id}`} className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden flex">
            {b.gambar && (
              <img src={resolveImageUrl(b.gambar)} alt="" className="w-28 sm:w-32 h-full object-cover flex-shrink-0" />
            )}
            <div className="p-4 sm:p-5 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#C05638] px-2 py-0.5 rounded-full border border-[#C05638]/30">
                  {b.kategori}
                </span>
                <span className="text-xs text-[#757873]">{b.tanggal}</span>
              </div>
              <h3 className="font-serif-display text-lg text-[#1A1C18] leading-snug line-clamp-2">{b.judul}</h3>
              <p className="text-xs text-[#757873] line-clamp-2 mt-1">{b.ringkasan}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => startEdit(b)} className="text-[#2D4A3E] hover:underline inline-flex items-center gap-1">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => remove(b.id)} className="text-[#C05638] hover:underline inline-flex items-center gap-1">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="md:col-span-2 bg-white border border-[#E5E1D8] rounded-2xl p-10 text-center text-[#757873]">
            Belum ada berita.
          </div>
        )}
      </div>
    </div>
  );
}
