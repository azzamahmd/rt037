export default function Galeri({ items = [] }) {
  return (
    <section
      id="galeri"
      data-testid="galeri-section"
      className="py-24 lg:py-32 bg-[#FDFBF7]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="overline-eyebrow mb-4">Galeri Kegiatan</div>
          <h2 className="font-serif-display text-4xl sm:text-5xl text-[#1A1C18] leading-tight">
            Momen-momen <span className="italic text-[#2D4A3E]">bersama</span>
          </h2>
          <p className="mt-6 text-lg text-[#4A4D48]">
            Potret kebersamaan, gotong royong, dan kegiatan rutin warga RT 037.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[200px] lg:auto-rows-[260px]">
          {items.map((g, i) => (
            <div
              key={g.id}
              data-testid={`galeri-item-${i}`}
              className={`gallery-image relative group ${
                i % 5 === 0 ? "row-span-2 col-span-2" : ""
              }`}
            >
              <img
                src={g.gambar}
                alt={g.judul}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C18]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="font-serif-display text-lg">{g.judul}</div>
                  <div className="text-xs text-white/80 mt-1">{g.deskripsi}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
