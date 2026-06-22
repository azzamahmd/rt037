import { MessageCircle } from "lucide-react";

function buildWhatsAppLink(num) {
  if (!num) return null;
  const cleaned = num.replace(/\D/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  const text = encodeURIComponent(
    "Halo Pengurus RT 037, saya warga ingin menyampaikan pesan."
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

export default function FloatingWhatsApp({ number }) {
  const link = buildWhatsAppLink(number);
  if (!link) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Chat WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#1ebe57] transition-colors"
    >
      <MessageCircle size={26} />
      <span className="sr-only">Chat WhatsApp</span>
    </a>
  );
}
