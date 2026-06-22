export default function Footer({ profil }) {
  const year = new Date().getFullYear();
  return (
    <footer
      data-testid="footer"
      className="relative batik-overlay bg-[#2D4A3E] text-[#E5E1D8]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#C05638] text-white flex items-center justify-center font-serif-display text-lg font-semibold">
                R
              </div>
              <div className="leading-tight">
                <div className="font-serif-display text-xl text-white">
                  RT 037 / RW 002
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#E5E1D8]/70">
                  {profil?.desa || "Desa X"}
                </div>
              </div>
            </div>
            <p className="text-[#E5E1D8]/80 leading-relaxed max-w-md">
              Membangun lingkungan harmonis melalui semangat gotong royong dan
              kekeluargaan antar warga.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="overline-eyebrow text-[#C05638] mb-5">Tautan</div>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#profil" className="hover:text-white transition-colors">
                  Profil
                </a>
              </li>
              <li>
                <a
                  href="#pengurus"
                  className="hover:text-white transition-colors"
                >
                  Pengurus
                </a>
              </li>
              <li>
                <a href="#berita" className="hover:text-white transition-colors">
                  Berita
                </a>
              </li>
              <li>
                <a href="#galeri" className="hover:text-white transition-colors">
                  Galeri
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-white transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="overline-eyebrow text-[#C05638] mb-5">Kontak</div>
            <ul className="space-y-3 text-sm text-[#E5E1D8]/80">
              {profil?.alamat && <li>{profil.alamat}</li>}
              {profil?.telepon && (
                <li>
                  <a
                    href={`tel:${profil.telepon}`}
                    className="hover:text-white"
                  >
                    {profil.telepon}
                  </a>
                </li>
              )}
              {profil?.email && (
                <li>
                  <a
                    href={`mailto:${profil.email}`}
                    className="hover:text-white"
                  >
                    {profil.email}
                  </a>
                </li>
              )}
              {profil?.jam_layanan && <li>{profil.jam_layanan}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-[#E5E1D8]/60">
          <div>
            © {year} RT 037 RW 002 {profil?.desa || "Desa X"}. Semua hak
            dilindungi.
          </div>
          <div>Dibangun dengan semangat gotong royong.</div>
        </div>
      </div>
    </footer>
  );
}
