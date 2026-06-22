import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ExternalLink, Settings, BarChart3, Newspaper, Images, MessageSquare, UserSquare2, IdCard } from "lucide-react";
import ProfilPanel from "../components/admin/ProfilPanel";
import PengurusPanel from "../components/admin/PengurusPanel";
import StatistikPanel from "../components/admin/StatistikPanel";
import BeritaPanel from "../components/admin/BeritaPanel";
import GaleriPanel from "../components/admin/GaleriPanel";
import BiodataPanel from "../components/admin/BiodataPanel";
import PengaduanPanel from "../components/admin/PengaduanPanel";

const TABS = [
  { id: "profil", label: "Profil RT", icon: Settings },
  { id: "pengurus", label: "Pengurus", icon: UserSquare2 },
  { id: "statistik", label: "Statistik", icon: BarChart3 },
  { id: "biodata", label: "Biodata Warga", icon: IdCard },
  { id: "berita", label: "Berita", icon: Newspaper },
  { id: "galeri", label: "Galeri", icon: Images },
  { id: "pengaduan", label: "Pengaduan", icon: MessageSquare },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profil");

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div data-testid="admin-page" className="min-h-screen bg-[#FDFBF7]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E5E1D8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center font-serif-display text-lg">
              R
            </div>
            <div className="leading-tight">
              <div className="font-serif-display text-lg text-[#1A1C18]">
                Dashboard Admin
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#757873]">
                RT 037 / RW 002
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-[#4A4D48]">
              {user?.email}
            </span>
            <Link
              to="/"
              data-testid="admin-view-site"
              className="hidden sm:inline-flex items-center gap-1 text-[#2D4A3E] hover:underline"
            >
              Lihat Website <ExternalLink size={14} />
            </Link>
            <button
              data-testid="admin-logout"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E1D8] text-sm hover:border-[#C05638] hover:text-[#C05638]"
            >
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar tabs */}
          <aside className="lg:col-span-3">
            <nav
              data-testid="admin-tabs"
              className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0"
            >
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    data-testid={`admin-tab-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      active
                        ? "bg-[#2D4A3E] text-white"
                        : "bg-white border border-[#E5E1D8] text-[#4A4D48] hover:border-[#2D4A3E]"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.7} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-9 min-w-0">
            {tab === "profil" && <ProfilPanel />}
            {tab === "pengurus" && <PengurusPanel />}
            {tab === "statistik" && <StatistikPanel />}
            {tab === "biodata" && <BiodataPanel />}
            {tab === "berita" && <BeritaPanel />}
            {tab === "galeri" && <GaleriPanel />}
            {tab === "pengaduan" && <PengaduanPanel />}
          </main>
        </div>
      </div>
    </div>
  );
}
