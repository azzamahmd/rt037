import { Calendar, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const KATEGORI = ["Semua", "Berita", "Pengumuman", "Kegiatan"];

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function Berita({ items = [] }) {
  const [filter, setFilter] = useState("Semua");
  const [selectedBerita, setSelectedBerita] = useState(null);
  const filtered =
    filter === "Semua" ? items : items.filter((b) => b.kategori === filter);

  return (
    <section
      id="berita"
      data-testid="berita-section"
      className="py-24 lg:py-32 bg-[#F4F1EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="overline-eyebrow mb-4">Berita & Pengumuman</div>
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#1A1C18] leading-tight">
              Kabar dari{" "}
              <span className="italic text-[#2D4A3E]">lingkungan kami</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="berita-filter">
            {KATEGORI.map((k) => (
              <button
                key={k}
                data-testid={`berita-filter-${k.toLowerCase()}`}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  filter === k
                    ? "bg-[#2D4A3E] text-white border-[#2D4A3E]"
                    : "bg-transparent text-[#4A4D48] border-[#E5E1D8] hover:border-[#2D4A3E]"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            data-testid="berita-empty"
            className="text-center py-16 text-[#757873]"
          >
            Belum ada {filter === "Semua" ? "berita" : filter.toLowerCase()}.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((b) => (
              <article
                key={b.id}
                data-testid={`berita-card-${b.id}`}
                onClick={() => setSelectedBerita(b)}
                className="heritage-card overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="gallery-image h-48 overflow-hidden">
                  {b.gambar && (
                    <img
                      src={b.gambar}
                      alt={b.judul}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#C05638] px-2 py-1 rounded-full border border-[#C05638]/30">
                      {b.kategori}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#757873]">
                      <Calendar size={12} /> {formatDate(b.tanggal)}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-xl text-[#1A1C18] leading-snug mb-3">
                    {b.judul}
                  </h3>
                  <p className="text-sm text-[#4A4D48] line-clamp-3 mb-4">
                    {b.ringkasan}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs text-[#757873]">
                    <span>oleh {b.penulis}</span>
                    <ArrowUpRight
                      size={18}
                      className="text-[#2D4A3E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedBerita && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBerita(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedBerita.gambar && (
              <img
                src={selectedBerita.gambar}
                alt={selectedBerita.judul}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                {selectedBerita.judul}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {formatDate(selectedBerita.tanggal)}
              </p>

              <div className="whitespace-pre-wrap">
                {selectedBerita.isi || selectedBerita.ringkasan}
              </div>

              <button
                onClick={() => setSelectedBerita(null)}
                className="mt-6 px-4 py-2 bg-[#2D4A3E] text-white rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
