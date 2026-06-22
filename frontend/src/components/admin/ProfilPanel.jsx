import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { getProfil, updateProfil } from "../../lib/api";
import { PanelHeader, PanelCard, FieldLabel } from "./_common";
import { Plus, Trash2 } from "lucide-react";

export default function ProfilPanel() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfil().then(setForm).catch(() => toast.error("Gagal memuat profil"));
  }, []);

  if (!form) {
    return <div className="text-[#757873]">Memuat...</div>;
  }

  const onChange = (k) => (e) =>
    setForm({ ...form, [k]: e.target.value });

  const onMisiChange = (i, v) => {
    const next = [...form.misi];
    next[i] = v;
    setForm({ ...form, misi: next });
  };

  const addMisi = () => setForm({ ...form, misi: [...form.misi, ""] });
  const removeMisi = (i) =>
    setForm({ ...form, misi: form.misi.filter((_, idx) => idx !== i) });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tahun_berdiri: Number(form.tahun_berdiri) || 0,
        misi: form.misi.filter((m) => m && m.trim()),
      };
      const updated = await updateProfil(payload);
      setForm(updated);
      toast.success("Profil RT berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} data-testid="profil-panel" noValidate>
      <PanelHeader
        title="Profil RT"
        subtitle="Kelola informasi umum, visi, misi, dan kontak RT."
        action={
          <button
            data-testid="profil-save"
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        }
      />

      <PanelCard className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Nama RT</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.nama_rt || ""} onChange={onChange("nama_rt")} />
          </div>
          <div>
            <FieldLabel>RW</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.rw || ""} onChange={onChange("rw")} />
          </div>
          <div>
            <FieldLabel>Desa</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.desa || ""} onChange={onChange("desa")} />
          </div>
          <div>
            <FieldLabel>Kecamatan</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.kecamatan || ""} onChange={onChange("kecamatan")} />
          </div>
          <div>
            <FieldLabel>Kabupaten</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.kabupaten || ""} onChange={onChange("kabupaten")} />
          </div>
          <div>
            <FieldLabel>Provinsi</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.provinsi || ""} onChange={onChange("provinsi")} />
          </div>
          <div>
            <FieldLabel>Tahun Berdiri</FieldLabel>
            <Input type="number" className="mt-2 rounded-xl" value={form.tahun_berdiri || ""} onChange={onChange("tahun_berdiri")} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Alamat Sekretariat</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.alamat || ""} onChange={onChange("alamat")} />
          </div>
          <div>
            <FieldLabel>Telepon</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.telepon || ""} onChange={onChange("telepon")} />
          </div>
          <div>
            <FieldLabel>WhatsApp (cth: 6281234567890)</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.whatsapp || ""} onChange={onChange("whatsapp")} placeholder="62..." />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" className="mt-2 rounded-xl" value={form.email || ""} onChange={onChange("email")} />
          </div>
          <div className="sm:col-span-3">
            <FieldLabel>Jam Layanan</FieldLabel>
            <Input className="mt-2 rounded-xl" value={form.jam_layanan || ""} onChange={onChange("jam_layanan")} />
          </div>
        </div>

        <div>
          <FieldLabel>Visi</FieldLabel>
          <Textarea
            rows={3}
            className="mt-2 rounded-xl"
            value={form.visi || ""}
            onChange={onChange("visi")}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Misi</FieldLabel>
            <button
              type="button"
              onClick={addMisi}
              data-testid="profil-add-misi"
              className="inline-flex items-center gap-1 text-xs text-[#2D4A3E] hover:underline"
            >
              <Plus size={14} /> Tambah misi
            </button>
          </div>
          <div className="space-y-2">
            {form.misi.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-serif-display text-xl text-[#C05638] w-7 pt-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Input
                  className="rounded-xl flex-1"
                  value={m}
                  onChange={(e) => onMisiChange(i, e.target.value)}
                  placeholder={`Misi ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeMisi(i)}
                  className="p-2 text-[#C05638] hover:bg-[#C05638]/10 rounded-lg"
                  aria-label="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </PanelCard>
    </form>
  );
}
