import { Sparkles, Target } from "lucide-react";

export default function Profil({ profil }) {
  if (!profil) return null;
  return (
    <section
      id="profil"
      data-testid="profil-section"
      className="py-20 sm:py-24 lg:py-32 bg-[#FDFBF7]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="overline-eyebrow mb-4">Profil Kami</div>
          <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1A1C18] leading-tight">
            Mengenal lebih dekat <br />
            <span className="italic text-[#2D4A3E]">
              {profil.nama_rt} {profil.rw}
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#4A4D48]">
            Komunitas warga yang tumbuh dengan semangat kebersamaan, menjunjung
            tinggi gotong royong, dan terus berbenah untuk masa depan yang
            lebih baik.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-5 lg:gap-8">
          {/* Visi - full width */}
          <div
            data-testid="profil-visi-card"
            className="lg:col-span-12 heritage-card p-7 sm:p-10 lg:p-14 !bg-[#2D4A3E] text-white"
          >
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <Sparkles size={20} className="text-[#C05638]" strokeWidth={1.5} />
              <div className="overline-eyebrow text-[#E5E1D8]">Visi</div>
            </div>
            <p className="font-serif-display text-2xl sm:text-3xl lg:text-4xl leading-snug text-white/95">
              &ldquo;{profil.visi}&rdquo;
            </p>
          </div>

          {/* Misi */}
          <div
            data-testid="profil-misi-card"
            className="lg:col-span-12 heritage-card p-7 sm:p-10 lg:p-12"
          >
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <Target size={20} className="text-[#C05638]" strokeWidth={1.5} />
              <div className="overline-eyebrow">Misi Kami</div>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-5">
              {profil.misi?.map((m, i) => (
                <div
                  key={i}
                  data-testid={`profil-misi-${i}`}
                  className="flex gap-4 border-b border-[#E5E1D8] pb-5 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <span className="font-serif-display text-2xl sm:text-3xl text-[#C05638] leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm sm:text-base text-[#1A1C18] leading-relaxed pt-1">
                    {m}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
