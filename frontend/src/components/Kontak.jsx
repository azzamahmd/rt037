import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { postPengaduan } from "../lib/api";

function buildWhatsAppLink(num) {
  if (!num) return null;
  const cleaned = num.replace(/\D/g, "");
  if (!cleaned) return null;
  // If starts with 0, convert to 62
  const normalized = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  const text = encodeURIComponent(
    "Halo Pengurus RT 037, saya warga ingin menyampaikan pesan."
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

export default function Kontak({ profil }) {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    subjek: "",
    pesan: "",
  });
  const [loading, setLoading] = useState(false);

  const waLink = buildWhatsAppLink(profil?.whatsapp || profil?.telepon);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.subjek || !form.pesan) {
      toast.error("Mohon lengkapi nama, subjek, dan pesan");
      return;
    }
    setLoading(true);
    try {
      await postPengaduan(form);
      toast.success("Pengaduan terkirim. Terima kasih atas masukan Anda!");
      setForm({ nama: "", email: "", no_hp: "", subjek: "", pesan: "" });
    } catch (err) {
      toast.error("Gagal mengirim. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="kontak"
      data-testid="kontak-section"
      className="py-20 sm:py-24 lg:py-32 bg-[#F4F1EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="overline-eyebrow mb-4">Hubungi Kami</div>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1A1C18] leading-tight">
              Saran &{" "}
              <span className="italic text-[#2D4A3E]">Pengaduan Warga</span>
            </h2>
            <p className="mt-5 text-[#4A4D48] text-base sm:text-lg">
              Sampaikan masukan, saran, atau pengaduan Anda. Pengurus RT akan
              menindaklanjuti dengan cepat dan ramah.
            </p>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                data-testid="kontak-whatsapp-btn"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe57] transition-colors shadow-sm"
              >
                <MessageCircle size={18} /> Chat WhatsApp Langsung
              </a>
            )}

            <div className="mt-10 space-y-5 sm:space-y-6">
              {profil?.alamat && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-[#2D4A3E]" />
                  </div>
                  <div>
                    <div className="overline-eyebrow text-[#757873] mb-1">
                      Alamat Sekretariat
                    </div>
                    <div className="text-[#1A1C18] text-sm sm:text-base">
                      {profil.alamat}
                    </div>
                  </div>
                </div>
              )}
              {profil?.telepon && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-[#2D4A3E]" />
                  </div>
                  <div>
                    <div className="overline-eyebrow text-[#757873] mb-1">
                      Telepon
                    </div>
                    <a
                      data-testid="kontak-phone"
                      href={`tel:${profil.telepon}`}
                      className="text-[#1A1C18] hover:text-[#2D4A3E]"
                    >
                      {profil.telepon}
                    </a>
                  </div>
                </div>
              )}
              {profil?.email && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-[#2D4A3E]" />
                  </div>
                  <div>
                    <div className="overline-eyebrow text-[#757873] mb-1">
                      Email
                    </div>
                    <a
                      data-testid="kontak-email"
                      href={`mailto:${profil.email}`}
                      className="text-[#1A1C18] hover:text-[#2D4A3E] break-all"
                    >
                      {profil.email}
                    </a>
                  </div>
                </div>
              )}
              {profil?.jam_layanan && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-[#2D4A3E]" />
                  </div>
                  <div>
                    <div className="overline-eyebrow text-[#757873] mb-1">
                      Jam Layanan
                    </div>
                    <div className="text-[#1A1C18] text-sm sm:text-base">
                      {profil.jam_layanan}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              data-testid="kontak-form"
              onSubmit={onSubmit}
              noValidate
              className="heritage-card p-5 sm:p-8 lg:p-10 bg-white"
            >
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                    Nama Lengkap <span className="text-[#C05638]">*</span>
                  </label>
                  <Input
                    data-testid="kontak-input-nama"
                    name="nama"
                    value={form.nama}
                    onChange={onChange}
                    placeholder="Nama Anda"
                    className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                    No. HP / WhatsApp
                  </label>
                  <Input
                    data-testid="kontak-input-hp"
                    name="no_hp"
                    value={form.no_hp}
                    onChange={onChange}
                    placeholder="08xx..."
                    className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                    Email
                  </label>
                  <Input
                    data-testid="kontak-input-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="email@contoh.com"
                    className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                    Subjek <span className="text-[#C05638]">*</span>
                  </label>
                  <Input
                    data-testid="kontak-input-subjek"
                    name="subjek"
                    value={form.subjek}
                    onChange={onChange}
                    placeholder="Topik atau judul pesan"
                    className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#4A4D48]">
                    Pesan <span className="text-[#C05638]">*</span>
                  </label>
                  <Textarea
                    data-testid="kontak-input-pesan"
                    name="pesan"
                    rows={5}
                    value={form.pesan}
                    onChange={onChange}
                    placeholder="Tulis pesan, saran, atau pengaduan Anda di sini..."
                    className="mt-2 rounded-xl border-[#E5E1D8] focus-visible:ring-[#2D4A3E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                data-testid="kontak-submit"
                disabled={loading}
                className="btn-primary mt-7 sm:mt-8 disabled:opacity-60"
              >
                {loading ? "Mengirim..." : "Kirim Pesan"}{" "}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
