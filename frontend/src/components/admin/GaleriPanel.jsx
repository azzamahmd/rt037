import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  getGaleri,
  createGaleri,
  updateGaleri,
  deleteGaleri,
  resolveImageUrl,
} from "../../lib/api";
import { PanelHeader, PanelCard, FieldLabel } from "./_common";
import { Plus, Trash2, Save, Pencil, X } from "lucide-react";
import ImageUpload from "./ImageUpload";

const today = new Date().toISOString().slice(0, 10);
const empty = { judul: "", deskripsi: "", gambar: "", tanggal: today };

export default function GaleriPanel() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () =>
    getGaleri()
      .then(setItems)
      .catch(() => toast.error("Gagal memuat galeri"));

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm({ ...empty, tanggal: today });
    setEditing("new");
  };
  const startEdit = (g) => {
    setForm({ judul: g.judul, deskripsi: g.deskripsi, gambar: g.gambar, tanggal: g.tanggal });
    setEditing(g.id);
  };
  const cancel = () => {
    setEditing(null);
    setForm(empty);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.gambar) {
      toast.error("Judul dan URL gambar wajib diisi");
      return;
    }
    try {
      if (editing === "new") {
        await createGaleri(form);
        toast.success("Item galeri ditambahkan");
      } else {
        await updateGaleri(editing, form);
        toast.success("Item galeri diperbarui");
      }
      cancel();
      load();
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus item galeri ini?")) return;
    try {
      await deleteGaleri(id);
      toast.success("Dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div data-testid="galeri-panel">
      <PanelHeader
        title="Galeri"
        subtitle="Kelola foto kegiatan warga."
        action={
          editing === null && (
            <button data-testid="galeri-add" onClick={startNew} className="btn-primary">
              <Plus size={16} /> Tambah Foto
            </button>
          )
        }
      />

      {editing !== null && (
        <PanelCard className="mb-6">
          <form onSubmit={save} noValidate data-testid="galeri-form" className="grid sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <FieldLabel required>Judul</FieldLabel>
              <Input className="mt-2 rounded-xl" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
            </div>
            <div className="sm:col-span-4">
              <FieldLabel>Tanggal</FieldLabel>
              <Input type="date" className="mt-2 rounded-xl" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
            </div>
            <div className="sm:col-span-12">
              <ImageUpload
                value={form.gambar}
                onChange={(url) => setForm({ ...form, gambar: url })}
                label="Gambar"
                testId="galeri-gambar"
                aspect="wide"
              />
            </div>
            <div className="sm:col-span-12">
              <FieldLabel>Deskripsi</FieldLabel>
              <Textarea rows={2} className="mt-2 rounded-xl" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            </div>
            <div className="sm:col-span-12 flex gap-2 justify-end">
              <button type="button" onClick={cancel} className="btn-secondary">
                <X size={16} /> Batal
              </button>
              <button type="submit" data-testid="galeri-save" className="btn-primary">
                <Save size={16} /> Simpan
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g) => (
          <div key={g.id} data-testid={`galeri-row-${g.id}`} className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden">
            <img src={resolveImageUrl(g.gambar)} alt={g.judul} className="w-full h-32 object-cover" />
            <div className="p-3">
              <div className="font-serif-display text-sm text-[#1A1C18] line-clamp-1">{g.judul}</div>
              <div className="text-[10px] text-[#757873]">{g.tanggal}</div>
              <div className="mt-2 flex gap-2 text-xs">
                <button onClick={() => startEdit(g)} className="text-[#2D4A3E] hover:underline">
                  <Pencil size={12} className="inline" /> Edit
                </button>
                <button onClick={() => remove(g.id)} className="text-[#C05638] hover:underline">
                  <Trash2 size={12} className="inline" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full bg-white border border-[#E5E1D8] rounded-2xl p-10 text-center text-[#757873]">
            Galeri masih kosong.
          </div>
        )}
      </div>
    </div>
  );
}
