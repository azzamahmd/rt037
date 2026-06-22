import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  getPengurus,
  createPengurus,
  updatePengurus,
  deletePengurus,
  resolveImageUrl,
} from "../../lib/api";
import { PanelHeader, PanelCard, FieldLabel } from "./_common";
import { Plus, Trash2, Save, Pencil, X } from "lucide-react";
import ImageUpload from "./ImageUpload";

const empty = { nama: "", jabatan: "", inisial: "", foto: "", urutan: 1 };

function deriveInisial(nama) {
  if (!nama) return "";
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0].replace(/^(Bapak|Ibu|Pak|Bu|Mas|Mbak|Sdr|Sdri)\.?$/i, "");
  if (parts.length === 1) return (first || parts[0]).slice(0, 2).toUpperCase();
  const second = parts[1];
  const a = (first || parts[0])[0] || "";
  const b = second[0] || "";
  return (a + b).toUpperCase();
}

export default function PengurusPanel() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () =>
    getPengurus()
      .then(setItems)
      .catch(() => toast.error("Gagal memuat pengurus"));

  useEffect(() => {
    load();
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setForm({ ...empty, urutan: items.length + 1 });
    setEditing("new");
  };
  const startEdit = (p) => {
    setForm({
      nama: p.nama,
      jabatan: p.jabatan,
      inisial: p.inisial,
      foto: p.foto || "",
      urutan: p.urutan,
    });
    setEditing(p.id);
  };
  const cancel = () => {
    setEditing(null);
    setForm(empty);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.jabatan) {
      toast.error("Lengkapi nama dan jabatan");
      return;
    }
    const payload = {
      ...form,
      inisial: form.inisial || deriveInisial(form.nama),
      urutan: Number(form.urutan),
      foto: form.foto || null,
    };
    try {
      if (editing === "new") {
        await createPengurus(payload);
        toast.success("Pengurus ditambahkan");
      } else {
        await updatePengurus(editing, payload);
        toast.success("Pengurus diperbarui");
      }
      cancel();
      load();
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus pengurus ini?")) return;
    try {
      await deletePengurus(id);
      toast.success("Dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div data-testid="pengurus-panel">
      <PanelHeader
        title="Pengurus RT"
        subtitle="Tambah, ubah, atau hapus data pengurus."
        action={
          editing === null && (
            <button data-testid="pengurus-add" onClick={startNew} className="btn-primary">
              <Plus size={16} /> Tambah Pengurus
            </button>
          )
        }
      />

      {editing !== null && (
        <PanelCard className="mb-6">
          <form onSubmit={save} noValidate data-testid="pengurus-form" className="grid sm:grid-cols-12 gap-5">
            <div className="sm:col-span-3">
              <ImageUpload
                value={form.foto}
                onChange={(url) => setField("foto", url)}
                label="Foto Profil"
                testId="pengurus-foto"
                aspect="square"
              />
            </div>
            <div className="sm:col-span-9 grid sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7">
                <FieldLabel required>Nama Lengkap</FieldLabel>
                <Input
                  data-testid="pengurus-input-nama"
                  className="mt-2 rounded-xl"
                  value={form.nama}
                  onChange={(e) => setField("nama", e.target.value)}
                />
              </div>
              <div className="sm:col-span-5">
                <FieldLabel required>Jabatan</FieldLabel>
                <Input
                  data-testid="pengurus-input-jabatan"
                  className="mt-2 rounded-xl"
                  value={form.jabatan}
                  onChange={(e) => setField("jabatan", e.target.value)}
                />
              </div>
              <div className="sm:col-span-8">
                <FieldLabel>Inisial (fallback bila tanpa foto)</FieldLabel>
                <Input
                  data-testid="pengurus-input-inisial"
                  className="mt-2 rounded-xl"
                  maxLength={3}
                  placeholder={deriveInisial(form.nama) || "Otomatis"}
                  value={form.inisial}
                  onChange={(e) => setField("inisial", e.target.value.toUpperCase())}
                />
              </div>
              <div className="sm:col-span-4">
                <FieldLabel>Urutan</FieldLabel>
                <Input
                  data-testid="pengurus-input-urutan"
                  type="number"
                  className="mt-2 rounded-xl"
                  value={form.urutan}
                  onChange={(e) => setField("urutan", e.target.value)}
                />
              </div>
            </div>
            <div className="sm:col-span-12 flex gap-2 justify-end">
              <button type="button" onClick={cancel} className="btn-secondary">
                <X size={16} /> Batal
              </button>
              <button type="submit" data-testid="pengurus-save" className="btn-primary">
                <Save size={16} /> Simpan
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <PanelCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F1EB] text-[#4A4D48]">
              <tr>
                <th className="text-left px-6 py-4 font-semibold w-16">#</th>
                <th className="text-left px-6 py-4 font-semibold">Foto</th>
                <th className="text-left px-6 py-4 font-semibold">Nama</th>
                <th className="text-left px-6 py-4 font-semibold">Jabatan</th>
                <th className="text-right px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} data-testid={`pengurus-row-${p.id}`} className="border-t border-[#E5E1D8]">
                  <td className="px-6 py-4 text-[#757873]">{p.urutan}</td>
                  <td className="px-6 py-4">
                    {p.foto ? (
                      <img
                        src={resolveImageUrl(p.foto)}
                        alt={p.nama}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#2D4A3E] text-white text-xs flex items-center justify-center font-semibold">
                        {p.inisial}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#1A1C18]">{p.nama}</td>
                  <td className="px-6 py-4">{p.jabatan}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      data-testid={`pengurus-edit-${p.id}`}
                      onClick={() => startEdit(p)}
                      className="text-[#2D4A3E] hover:underline mr-3 inline-flex items-center gap-1"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      data-testid={`pengurus-delete-${p.id}`}
                      onClick={() => remove(p.id)}
                      className="text-[#C05638] hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#757873]">
                    Belum ada pengurus.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
