import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listPengaduan,
  updatePengaduanStatus,
  deletePengaduan,
} from "../../lib/api";
import { PanelHeader, PanelCard } from "./_common";
import { Trash2, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const STATUS = ["Baru", "Diproses", "Selesai"];

const statusColor = {
  Baru: "bg-[#C05638]/10 text-[#C05638] border-[#C05638]/30",
  Diproses: "bg-amber-100 text-amber-800 border-amber-300",
  Selesai: "bg-[#2D4A3E]/10 text-[#2D4A3E] border-[#2D4A3E]/30",
};

export default function PengaduanPanel() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("Semua");

  const load = () =>
    listPengaduan()
      .then(setItems)
      .catch(() => toast.error("Gagal memuat pengaduan"));

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, s) => {
    try {
      await updatePengaduanStatus(id, s);
      toast.success("Status diperbarui");
      load();
    } catch {
      toast.error("Gagal memperbarui");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus pengaduan ini?")) return;
    try {
      await deletePengaduan(id);
      toast.success("Pengaduan dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const filtered =
    filter === "Semua" ? items : items.filter((p) => p.status === filter);

  return (
    <div data-testid="pengaduan-panel">
      <PanelHeader
        title="Saran & Pengaduan Warga"
        subtitle={`Total ${items.length} pesan masuk.`}
        action={
          <div className="flex flex-wrap gap-2">
            {["Semua", ...STATUS].map((s) => (
              <button
                key={s}
                data-testid={`pengaduan-filter-${s.toLowerCase()}`}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-xs border transition-colors ${
                  filter === s
                    ? "bg-[#2D4A3E] text-white border-[#2D4A3E]"
                    : "bg-white text-[#4A4D48] border-[#E5E1D8] hover:border-[#2D4A3E]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-4">
        {filtered.map((p) => (
          <PanelCard key={p.id}>
            <div data-testid={`pengaduan-${p.id}`} className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border ${statusColor[p.status] || ""}`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-[#757873]">
                    {new Date(p.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <h3 className="font-serif-display text-xl text-[#1A1C18]">{p.subjek}</h3>
                <p className="text-sm text-[#4A4D48] mt-2 whitespace-pre-line">{p.pesan}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#757873]">
                  <span className="font-medium text-[#1A1C18]">{p.nama}</span>
                  {p.no_hp && (
                    <a href={`tel:${p.no_hp}`} className="inline-flex items-center gap-1 hover:text-[#2D4A3E]">
                      <Phone size={12} /> {p.no_hp}
                    </a>
                  )}
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 hover:text-[#2D4A3E]">
                      <Mail size={12} /> {p.email}
                    </a>
                  )}
                  {p.alamat && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {p.alamat}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                <select
                  data-testid={`pengaduan-status-${p.id}`}
                  value={p.status}
                  onChange={(e) => setStatus(p.id, e.target.value)}
                  className="h-9 rounded-xl border border-[#E5E1D8] bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {p.no_hp && (
                  <a
                    href={`https://wa.me/${p.no_hp.replace(/^0/, "62").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs border border-[#E5E1D8] hover:border-[#2D4A3E] hover:text-[#2D4A3E]"
                  >
                    <MessageCircle size={12} /> Balas WA
                  </a>
                )}
                <button
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs border border-[#E5E1D8] hover:border-[#C05638] hover:text-[#C05638]"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          </PanelCard>
        ))}
        {filtered.length === 0 && (
          <PanelCard className="text-center text-[#757873]">
            Belum ada pengaduan {filter !== "Semua" ? `dengan status "${filter}"` : ""}.
          </PanelCard>
        )}
      </div>
    </div>
  );
}
