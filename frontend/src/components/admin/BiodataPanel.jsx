import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  getWarga,
  createKK,
  updateKK,
  deleteKK,
  resolveImageUrl,
} from "../../lib/api";
import { PanelHeader, PanelCard, FieldLabel } from "./_common";
import { Plus, Trash2, Save, Pencil, X, UserPlus } from "lucide-react";
import ImageUpload from "./ImageUpload";

const STATUS_OPTIONS = [
  "Kepala Keluarga",
  "Istri",
  "Suami",
  "Anak",
  "Cucu",
  "Orang Tua",
  "Mertua",
  "Saudara",
  "Lainnya",
];

const emptyAnggota = () => ({
  id: undefined,
  nama: "",
  status: "Anak",
  pekerjaan: "",
  foto: "",
});

const emptyForm = () => ({
  nama_kepala: "",
  alamat: "",
  anggota: [{ ...emptyAnggota(), status: "Kepala Keluarga" }],
});

export default function BiodataPanel() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // 'new' | id | null
  const [form, setForm] = useState(emptyForm());

  const load = () =>
    getWarga()
      .then(setItems)
      .catch(() => toast.error("Gagal memuat data warga"));

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm(emptyForm());
    setEditing("new");
  };
  const startEdit = (kk) => {
    setForm({
      nama_kepala: kk.nama_kepala || "",
      alamat: kk.alamat || "",
      anggota: (kk.anggota || []).map((a) => ({
        id: a.id,
        nama: a.nama,
        status: a.status,
        pekerjaan: a.pekerjaan || "",
        foto: a.foto || "",
      })),
    });
    setEditing(kk.id);
  };
  const cancel = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const setAnggota = (i, k, v) => {
    setForm((f) => {
      const next = [...f.anggota];
      next[i] = { ...next[i], [k]: v };
      return { ...f, anggota: next };
    });
  };
  const addAnggota = () =>
    setForm((f) => ({ ...f, anggota: [...f.anggota, emptyAnggota()] }));
  const removeAnggota = (i) =>
    setForm((f) => ({ ...f, anggota: f.anggota.filter((_, idx) => idx !== i) }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.nama_kepala.trim() || !form.alamat.trim()) {
      toast.error("Lengkapi nama penghuni utama dan alamat");
      return;
    }
    if (form.anggota.length === 0 || !form.anggota.every((a) => a.nama.trim())) {
      toast.error("Setiap anggota wajib memiliki nama");
      return;
    }
    const payload = {
      ...form,
      anggota: form.anggota.map((a) => ({
        ...a,
        foto: a.foto || null,
      })),
    };
    try {
      if (editing === "new") {
        await createKK(payload);
        toast.success("Data KK ditambahkan");
      } else {
        await updateKK(editing, payload);
        toast.success("Data KK diperbarui");
      }
      cancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal menyimpan");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus data rumah ini beserta seluruh penghuninya?")) return;
    try {
      await deleteKK(id);
      toast.success("Dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div data-testid="biodata-panel">
      <PanelHeader
        title="Biodata Warga"
        subtitle="Kelola data warga per Kepala Keluarga (KK)."
        action={
          editing === null && (
            <button data-testid="biodata-add" onClick={startNew} className="btn-primary">
              <Plus size={16} /> Tambah KK
            </button>
          )
        }
      />

      {editing !== null && (
        <PanelCard className="mb-6">
          <form
            onSubmit={save}
            noValidate
            data-testid="biodata-form"
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <FieldLabel required>Nama Penghuni Utama</FieldLabel>
                <Input
                  data-testid="biodata-input-kepala"
                  className="mt-2 rounded-xl"
                  value={form.nama_kepala}
                  onChange={(e) => setForm({ ...form, nama_kepala: e.target.value })}
                />
              </div>
              <div className="sm:col-span-7">
                <FieldLabel required>Alamat Rumah</FieldLabel>
                <Input
                  data-testid="biodata-input-alamat"
                  className="mt-2 rounded-xl"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <FieldLabel>Penghuni</FieldLabel>
                  <p className="text-xs text-[#757873] mt-1">
                    Total {form.anggota.length} penghuni
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="biodata-anggota-add"
                  onClick={addAnggota}
                  className="text-sm text-[#2D4A3E] hover:underline inline-flex items-center gap-1"
                >
                  <UserPlus size={14} /> Tambah Penghuni
                </button>
              </div>

              <div className="space-y-4">
                {form.anggota.map((a, i) => (
                  <div
                    key={i}
                    data-testid={`biodata-anggota-${i}`}
                    className="grid sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-[#F4F1EB] border border-[#E5E1D8] relative"
                  >
                    <div className="sm:col-span-2">
                      <ImageUpload
                        value={a.foto}
                        onChange={(url) => setAnggota(i, "foto", url)}
                        testId={`biodata-anggota-foto-${i}`}
                        aspect="square"
                      />
                    </div>
                    <div className="sm:col-span-10 grid sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <FieldLabel required>Nama</FieldLabel>
                        <Input
                          className="mt-2 rounded-xl bg-white"
                          value={a.nama}
                          onChange={(e) => setAnggota(i, "nama", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <FieldLabel>Status</FieldLabel>
                        <select
                          className="mt-2 w-full h-10 rounded-xl border border-[#E5E1D8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                          value={a.status}
                          onChange={(e) => setAnggota(i, "status", e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <FieldLabel>Pekerjaan</FieldLabel>
                        <Input
                          className="mt-2 rounded-xl bg-white"
                          value={a.pekerjaan}
                          onChange={(e) => setAnggota(i, "pekerjaan", e.target.value)}
                        />
                      </div>
                    </div>
                    {form.anggota.length > 1 && (
                      <button
                        type="button"
                        data-testid={`biodata-anggota-remove-${i}`}
                        onClick={() => removeAnggota(i)}
                        className="absolute top-2 right-2 p-2 text-[#C05638] hover:bg-[#C05638]/10 rounded-lg"
                        aria-label="Hapus anggota"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={cancel} className="btn-secondary">
                <X size={16} /> Batal
              </button>
              <button type="submit" data-testid="biodata-save" className="btn-primary">
                <Save size={16} /> Simpan
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((kk) => (
          <PanelCard key={kk.id} className="!p-0 overflow-hidden">
            <div data-testid={`biodata-row-${kk.id}`} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="overline-eyebrow text-[#C05638] mb-1">
                    Rumah
                  </div>
                  <h3 className="font-serif-display text-xl text-[#1A1C18] leading-snug truncate">
                    {kk.nama_kepala}
                  </h3>
                  <p className="text-xs text-[#757873] mt-1">{kk.alamat}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1 text-xs">
                  <button
                    data-testid={`biodata-edit-${kk.id}`}
                    onClick={() => startEdit(kk)}
                    className="text-[#2D4A3E] hover:underline inline-flex items-center gap-1"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    data-testid={`biodata-delete-${kk.id}`}
                    onClick={() => remove(kk.id)}
                    className="text-[#C05638] hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {kk.anggota?.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 bg-[#F4F1EB] rounded-xl p-2">
                    {a.foto ? (
                      <img
                        src={resolveImageUrl(a.foto)}
                        alt={a.nama}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#2D4A3E] text-white text-[10px] flex items-center justify-center font-semibold flex-shrink-0">
                        {(a.nama[0] || "?").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#1A1C18] truncate">
                        {a.nama}
                      </div>
                      <div className="text-[10px] text-[#757873] truncate">
                        {a.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>
        ))}
        {items.length === 0 && (
          <div className="md:col-span-2 bg-white border border-[#E5E1D8] rounded-2xl p-10 text-center text-[#757873]">
            Belum ada data rumah.
          </div>
        )}
      </div>
    </div>
  );
}
;

