import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { getStatistik, updateStatistik } from "../../lib/api";
import { PanelHeader, PanelCard, FieldLabel } from "./_common";

export default function StatistikPanel() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStatistik().then(setForm).catch(() => toast.error("Gagal memuat"));
  }, []);

  if (!form) return <div className="text-[#757873]">Memuat...</div>;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        total_kk: Number(form.total_kk) || 0,
        total_jiwa: Number(form.total_jiwa) || 0,
        laki_laki: Number(form.laki_laki) || 0,
        perempuan: Number(form.perempuan) || 0,
        updated_at: new Date().toISOString(),
      };
      const updated = await updateStatistik(payload);
      setForm(updated);
      toast.success("Statistik diperbarui");
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} data-testid="statistik-panel" noValidate>
      <PanelHeader
        title="Statistik Warga"
        subtitle="Perbarui jumlah KK dan jiwa secara berkala."
        action={
          <button data-testid="statistik-save" type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        }
      />
      <PanelCard>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { k: "total_kk", l: "Total KK" },
            { k: "total_jiwa", l: "Total Jiwa" },
            { k: "laki_laki", l: "Laki - laki" },
            { k: "perempuan", l: "Perempuan" },
          ].map((f) => (
            <div key={f.k}>
              <FieldLabel>{f.l}</FieldLabel>
              <Input
                data-testid={`statistik-${f.k}`}
                type="number"
                className="mt-2 rounded-xl"
                value={form[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 text-xs text-[#757873]">
          Terakhir diperbarui:{" "}
          {form.updated_at
            ? new Date(form.updated_at).toLocaleString("id-ID")
            : "—"}
        </div>
      </PanelCard>
    </form>
  );
}
