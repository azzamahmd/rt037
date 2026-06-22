import { resolveImageUrl } from "../lib/api";

export default function Pengurus({ data = [] }) {
  return (
    <section
      id="pengurus"
      data-testid="pengurus-section"
      className="py-20 sm:py-24 lg:py-32 bg-[#FDFBF7]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="overline-eyebrow mb-4">Struktur Organisasi</div>
          <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1A1C18] leading-tight">
            Pengurus <span className="italic text-[#2D4A3E]">RT 037</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#4A4D48]">
            Tim pengurus yang berdedikasi melayani dan menjaga kepentingan warga.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {data.map((p) => (
            <div
              key={p.id}
              data-testid={`pengurus-${p.urutan}`}
              className="heritage-card p-6 text-center flex flex-col items-center"
            >
              {p.foto ? (
                <img
                  src={resolveImageUrl(p.foto)}
                  alt={p.nama}
                  className="w-24 h-24 rounded-full object-cover mb-5 ring-2 ring-[#2D4A3E]/15"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center font-serif-display text-2xl font-semibold mb-5">
                  {p.inisial}
                </div>
              )}
              <div className="overline-eyebrow text-[#C05638] mb-2">
                {p.jabatan}
              </div>
              <div className="font-serif-display text-lg sm:text-xl text-[#1A1C18] leading-tight">
                {p.nama}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
