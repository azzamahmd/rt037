import { useState, useMemo } from "react";
import { Home, Users, Briefcase, Search } from "lucide-react";
import { Input } from "./ui/input";
import { resolveImageUrl } from "../lib/api";

const STATUS_COLOR = {
  "Kepala Keluarga": "bg-[#2D4A3E] text-white",
  "Istri": "bg-[#C05638]/15 text-[#C05638]",
  "Suami": "bg-[#C05638]/15 text-[#C05638]",
  "Anak": "bg-amber-100 text-amber-800",
  "Cucu": "bg-amber-100 text-amber-800",
};

function AnggotaCard({ a }) {
  return (
    <div data-testid={`anggota-${a.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E5E1D8]">
      {a.foto ? (
        <img
          src={resolveImageUrl(a.foto)}
          alt={a.nama}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-[#2D4A3E] text-white text-sm flex items-center justify-center font-semibold flex-shrink-0">
          {(a.nama[0] || "?").toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#1A1C18] truncate">
          {a.nama}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] || "bg-[#F4F1EB] text-[#4A4D48]"}`}>
            {a.status}
          </span>
          {a.pekerjaan && (
            <span className="text-[11px] text-[#757873] truncate">
              {a.pekerjaan}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Biodata({ items = [] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (kk) =>
        kk.nama_kepala.toLowerCase().includes(q) ||
        (kk.alamat || "").toLowerCase().includes(q) ||
        kk.anggota?.some((a) => a.nama.toLowerCase().includes(q))
    );
  }, [items, query]);

  const totalKK = items.length;
  const totalAnggota = items.reduce((s, kk) => s + (kk.anggota?.length || 0), 0);

  return (
    <section
      id="warga"
      data-testid="warga-section"
      className="py-20 sm:py-24 lg:py-32 bg-[#FDFBF7]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="overline-eyebrow mb-4">Biodata Warga</div>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1A1C18] leading-tight">
              Direktori per <span className="italic text-[#2D4A3E]">Rumah</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#4A4D48]">
              {totalKK} Rumah · {totalAnggota} jiwa terdaftar di lingkungan RT 037.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757873] pointer-events-none" />
            <Input
              data-testid="warga-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau alamat..."
              className="pl-10 h-11 rounded-full border-[#E5E1D8] bg-white focus-visible:ring-[#2D4A3E]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div data-testid="warga-empty" className="text-center py-16 text-[#757873]">
            {items.length === 0
              ? "Data warga belum tersedia."
              : "Tidak ada hasil yang cocok dengan pencarian."}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {filtered.map((kk) => (
              <article
                key={kk.id}
                data-testid={`kk-card-${kk.id}`}
                className="heritage-card p-6 sm:p-7"
              >
                <div className="mb-5 pb-5 border-b border-[#E5E1D8]">
                  <div className="overline-eyebrow text-[#C05638] mb-2">
                    Rumah
                  </div>
                  <h3 className="font-serif-display text-2xl text-[#1A1C18] leading-tight">
                    {kk.nama_kepala}
                  </h3>
                  <div className="mt-3 flex items-start gap-2 text-sm text-[#4A4D48]">
                    <Home size={14} className="mt-0.5 text-[#2D4A3E] flex-shrink-0" />
                    <span>{kk.alamat}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-[#757873]">
                  <Users size={12} /> {kk.anggota?.length || 0} anggota
                </div>
                <div className="space-y-2">
                  {kk.anggota?.map((a) => (
                    <AnggotaCard key={a.id} a={a} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
