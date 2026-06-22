import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Selamat datang!");
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || "Login gagal";
      toast.error(typeof msg === "string" ? msg : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-page"
      className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-12 batik-overlay"
    >
      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          data-testid="login-back"
          className="inline-flex items-center gap-2 text-sm text-[#4A4D48] hover:text-[#2D4A3E] mb-6"
        >
          <ArrowLeft size={16} /> Kembali ke beranda
        </Link>
        <div className="heritage-card p-8 sm:p-10 bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div className="overline-eyebrow">Area Admin</div>
          </div>
          <h1 className="font-serif-display text-3xl text-[#1A1C18] mt-2">
            Masuk ke Dashboard
          </h1>
          <p className="text-sm text-[#757873] mt-2">
            Khusus untuk pengurus RT yang berwenang mengelola konten website.
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 space-y-5"
            data-testid="login-form"
          >
            <div>
              <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                Email
              </label>
              <Input
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rt037.local"
                className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                Password
              </label>
              <Input
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
              />
            </div>
            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
