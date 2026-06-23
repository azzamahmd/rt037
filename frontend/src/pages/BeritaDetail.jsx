import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBeritaDetail, resolveImageUrl } from "../lib/api";

export default function BeritaDetail() {
  const { id } = useParams();
  const [berita, setBerita] = useState(null);

  useEffect(() => {
    getBeritaDetail(id)
      .then(setBerita)
      .catch(console.error);
  }, [id]);

  if (!berita) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        Memuat berita...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        to="/"
        className="text-[#2D4A3E] hover:underline"
      >
        ← Kembali
      </Link>

      {berita.gambar && (
        <img
          src={resolveImageUrl(berita.gambar)}
          alt={berita.judul}
          className="w-full h-80 object-cover rounded-xl mt-6"
        />
      )}

      <div className="mt-6">
        <div className="text-sm text-gray-500">
          {berita.kategori} • {berita.tanggal}
        </div>

        <h1 className="text-4xl font-bold mt-2 mb-4">
          {berita.judul}
        </h1>

        <div className="text-gray-500 mb-8">
          Oleh {berita.penulis}
        </div>

        <div className="whitespace-pre-wrap leading-relaxed">
          {berita.konten}
        </div>
      </div>
    </div>
  );
}