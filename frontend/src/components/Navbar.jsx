import { useState, useEffect } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINKS = [
  { label: "Beranda", href: "#beranda", id: "nav-beranda" },
  { label: "Profil", href: "#profil", id: "nav-profil" },
  { label: "Pengurus", href: "#pengurus", id: "nav-pengurus" },
  { label: "Statistik", href: "#statistik", id: "nav-statistik" },
  { label: "Warga", href: "#warga", id: "nav-warga" },
  { label: "Berita", href: "#berita", id: "nav-berita" },
  { label: "Galeri", href: "#galeri", id: "nav-galeri" },
  { label: "Kontak", href: "#kontak", id: "nav-kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E5E1D8]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <a
          href="#beranda"
          data-testid="navbar-logo"
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center font-serif-display text-base sm:text-lg font-semibold">
            R
          </div>
          <div className="leading-tight">
            <div className="font-serif-display text-base sm:text-lg text-[#1A1C18]">
              RT 037 / RW 002
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#757873]">
              Desa X
            </div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              data-testid={link.id}
              href={link.href}
              className="text-sm text-[#4A4D48] hover:text-[#2D4A3E] transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link to="/admin" data-testid="navbar-admin" className="btn-primary">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          ) : (
            <Link to="/login" data-testid="navbar-login" className="btn-secondary">
              <LogIn size={16} /> Admin
            </Link>
          )}
        </div>

        <button
          data-testid="navbar-mobile-toggle"
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-[#1A1C18]"
          aria-label="Buka menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div
          data-testid="navbar-mobile-menu"
          className="lg:hidden bg-[#FDFBF7] border-t border-[#E5E1D8]"
        >
          <div className="px-4 py-5 flex flex-col gap-3 max-h-[calc(100vh-80px)] overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base text-[#1A1C18] py-2 border-b border-[#E5E1D8]/60"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="btn-primary justify-center"
              >
                <LayoutDashboard size={16} /> Dashboard Admin
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn-secondary justify-center"
              >
                <LogIn size={16} /> Login Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
