import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Profil from "../components/Profil";
import Statistik from "../components/Statistik";
import Pengurus from "../components/Pengurus";
import Biodata from "../components/Biodata";
import Berita from "../components/Berita";
import Galeri from "../components/Galeri";
import Kontak from "../components/Kontak";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import {
  getProfil,
  getPengurus,
  getStatistik,
  getBerita,
  getGaleri,
  getWarga,
} from "../lib/api";

export default function Home() {
  const [profil, setProfil] = useState(null);
  const [pengurus, setPengurus] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [berita, setBerita] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const [warga, setWarga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, pg, st, br, gl, wg] = await Promise.all([
          getProfil(),
          getPengurus(),
          getStatistik(),
          getBerita(),
          getGaleri(),
          getWarga(),
        ]);
        if (!mounted) return;
        setProfil(p);
        setPengurus(pg);
        setStatistik(st);
        setBerita(br);
        setGaleri(gl);
        setWarga(wg);
      } catch (e) {
        console.error("Gagal memuat data:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div data-testid="home-page" className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <main>
        <Hero profil={profil} />
        <Profil profil={profil} />
        <Statistik data={statistik} />
        <Pengurus data={pengurus} />
        <Biodata items={warga} />
        <Berita items={berita} />
        <Galeri items={galeri} />
        <Kontak profil={profil} />
      </main>
      <Footer profil={profil} />
      <FloatingWhatsApp number={profil?.whatsapp || profil?.telepon} />
      {loading && (
        <div
          data-testid="loading-indicator"
          className="fixed bottom-4 right-4 bg-white border border-[#E5E1D8] rounded-full px-4 py-2 text-xs text-[#757873] shadow-sm"
        >
          Memuat data...
        </div>
      )}
    </div>
  );
}
