import { ArrowRight, MapPin } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1722252799188-87e1db708544?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwbmVpZ2hib3Job29kJTIwYWN0aXZpdGllc3xlbnwwfHx8fDE3ODExMDQzNTR8MA&ixlib=rb-4.1.0&q=85";

export default function Hero({ profil }) {
  return (
    <section
      id="beranda"
      data-testid="hero-section"
      className="relative batik-overlay pt-28 sm:pt-32 pb-16 sm:pb-20 lg:pt-40 lg:pb-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-6 fade-up">
            <div className="overline-eyebrow mb-5 sm:mb-6 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-[#2D4A3E]" />
              Selamat Datang di
            </div>
            <h1
              data-testid="hero-title"
              className="font-serif-display text-4xl sm:text-5xl lg:text-7xl text-[#1A1C18] leading-[1.05] tracking-tight"
            >
              {profil?.nama_rt || "RT 037"}
              <br />
              <span className="italic text-[#2D4A3E]">
                {profil?.rw || "RW 002"}
              </span>
              <br />
              <span className="text-[#C05638]">
                {profil?.desa || "Desa X"}
              </span>
            </h1>
            <p className="mt-6 sm:mt-8 text-base sm:text-lg text-[#4A4D48] leading-relaxed max-w-xl font-sans-body">
              Membangun lingkungan yang harmonis, aman, dan sejahtera melalui
              semangat gotong royong dan kekeluargaan antar warga.
            </p>

            <div className="mt-7 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
              <a
                href="#profil"
                data-testid="hero-cta-primary"
                className="btn-primary"
              >
                Kenali Kami <ArrowRight size={18} />
              </a>
              <a
                href="#berita"
                data-testid="hero-cta-secondary"
                className="btn-secondary"
              >
                Berita Terkini
              </a>
            </div>

            {profil?.alamat && (
              <div className="mt-12 flex items-start gap-3 text-sm text-[#757873]">
                <MapPin size={18} className="mt-0.5 text-[#2D4A3E]" />
                <div>
                  <div className="font-medium text-[#1A1C18]">
                    {profil.alamat}
                  </div>
                  <div className="mt-1">
                    {profil.kecamatan}, {profil.kabupaten} – {profil.provinsi}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 relative fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-[#C05638]/20 blur-2xl" />
              <div className="absolute -bottom-8 -right-4 w-40 h-40 rounded-full bg-[#2D4A3E]/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-[#E5E1D8] shadow-sm">
                <img
                  src={HERO_IMG}
                  alt="Warga RT 037"
                  className="w-full h-[320px] sm:h-[460px] lg:h-[540px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
