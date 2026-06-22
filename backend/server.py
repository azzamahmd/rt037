from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, status
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

app = FastAPI(title="RT 037 RW 002 Desa X API")
api_router = APIRouter(prefix="/api")


# ==================== Auth Helpers ====================
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token tidak valid")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User tidak ditemukan")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses admin diperlukan")
    return user


# ==================== Models ====================
class LoginRequest(BaseModel):
    email: str
    password: str


class ProfilModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    nama_rt: str = "RT 037"
    rw: str = "RW 002"
    desa: str = "Desa X"
    kecamatan: str = ""
    kabupaten: str = ""
    provinsi: str = ""
    tahun_berdiri: int = 1985
    visi: str = ""
    misi: List[str] = []
    alamat: str = ""
    telepon: str = ""
    whatsapp: str = ""
    email: str = ""
    jam_layanan: str = ""


class Pengurus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nama: str
    jabatan: str
    inisial: str
    foto: Optional[str] = None
    urutan: int = 0


class PengurusCreate(BaseModel):
    nama: str
    jabatan: str
    inisial: str
    foto: Optional[str] = None
    urutan: int = 0


class StatistikWarga(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_kk: int = 0
    total_jiwa: int = 0
    laki_laki: int = 0
    perempuan: int = 0
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Berita(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    judul: str
    ringkasan: str
    konten: str
    kategori: str
    tanggal: str
    penulis: str = "Sekretariat RT"
    gambar: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BeritaCreate(BaseModel):
    judul: str
    ringkasan: str
    konten: str
    kategori: str
    tanggal: str
    penulis: str = "Sekretariat RT"
    gambar: Optional[str] = None


class GaleriItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    judul: str
    deskripsi: str
    gambar: str
    tanggal: str


class GaleriCreate(BaseModel):
    judul: str
    deskripsi: str
    gambar: str
    tanggal: str


class PengaduanCreate(BaseModel):
    nama: str = Field(min_length=2, max_length=100)
    alamat: Optional[str] = Field(default=None, max_length=200)
    email: Optional[str] = Field(default=None, max_length=120)
    no_hp: Optional[str] = Field(default=None, max_length=30)
    subjek: str = Field(min_length=2, max_length=150)
    pesan: str = Field(min_length=5, max_length=2000)


class Pengaduan(PengaduanCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "Baru"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PengaduanStatusUpdate(BaseModel):
    status: str  # "Baru" | "Diproses" | "Selesai"


# Biodata Warga (per KK)
STATUS_ANGGOTA = {
    "Kepala Keluarga",
    "Istri",
    "Suami",
    "Anak",
    "Cucu",
    "Orang Tua",
    "Mertua",
    "Saudara",
    "Lainnya",
}


class Anggota(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nama: str
    status: str  # status dalam keluarga
    pekerjaan: str = ""
    foto: Optional[str] = None


class KK(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nomor_kk: str = ""
    nama_kepala: str
    alamat: str
    anggota: List[Anggota] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AnggotaInput(BaseModel):
    id: Optional[str] = None
    nama: str
    status: str
    pekerjaan: str = ""
    foto: Optional[str] = None


class KKCreate(BaseModel):
    nomor_kk: str = ""
    nama_kepala: str
    alamat: str
    anggota: List[AnggotaInput] = []


# ==================== Seed Data ====================
DEFAULT_PROFIL = {
    "nama_rt": "RT 037",
    "rw": "RW 002",
    "desa": "Desa X",
    "kecamatan": "Kecamatan Sukamaju",
    "kabupaten": "Kabupaten Bahagia",
    "provinsi": "Jawa Barat",
    "tahun_berdiri": 1985,
    "visi": "Mewujudkan lingkungan RT 037 yang aman, bersih, harmonis, dan sejahtera, berlandaskan gotong royong dan kekeluargaan.",
    "misi": [
        "Membangun kebersamaan antar warga melalui kegiatan sosial yang rutin.",
        "Menjaga keamanan dan ketertiban lingkungan secara partisipatif.",
        "Meningkatkan kebersihan dan kesehatan lingkungan.",
        "Mendukung pengembangan generasi muda dan kegiatan keagamaan.",
        "Memberikan pelayanan administrasi yang cepat, tepat, dan ramah.",
    ],
    "alamat": "Jl. Melati Raya No. 7, Desa X, Kec. Sukamaju",
    "telepon": "0812-3456-7890",
    "whatsapp": "6281234567890",
    "email": "rt037rw002.desax@gmail.com",
    "jam_layanan": "Senin – Jumat, 19.00 – 21.00 WIB",
}

SEED_PENGURUS = [
    {"nama": "Bapak Suryana", "jabatan": "Ketua RT", "inisial": "BS", "urutan": 1},
    {"nama": "Bapak Hidayat", "jabatan": "Wakil Ketua RT", "inisial": "BH", "urutan": 2},
    {"nama": "Ibu Nurhasanah", "jabatan": "Sekretaris", "inisial": "IN", "urutan": 3},
    {"nama": "Ibu Widyawati", "jabatan": "Bendahara", "inisial": "IW", "urutan": 4},
    {"nama": "Bapak Rahmat", "jabatan": "Seksi Keamanan", "inisial": "BR", "urutan": 5},
    {"nama": "Bapak Joko", "jabatan": "Seksi Kebersihan", "inisial": "BJ", "urutan": 6},
    {"nama": "Ibu Sri Mulyani", "jabatan": "Seksi Sosial", "inisial": "SM", "urutan": 7},
    {"nama": "Bapak Anwar", "jabatan": "Seksi Pemuda", "inisial": "BA", "urutan": 8},
]

SEED_STATISTIK = {
    "total_kk": 142,
    "total_jiwa": 487,
    "laki_laki": 246,
    "perempuan": 241,
    "updated_at": datetime.now(timezone.utc).isoformat(),
}

SEED_BERITA = [
    {
        "judul": "Kerja Bakti Bersama Menyambut Bulan Kemerdekaan",
        "ringkasan": "Seluruh warga RT 037 berpartisipasi dalam kerja bakti membersihkan lingkungan menjelang HUT RI.",
        "konten": "Pada hari Minggu pagi, warga RT 037 RW 002 berkumpul untuk melakukan kerja bakti bersama. Kegiatan ini diadakan menyambut HUT Kemerdekaan RI. Lingkungan menjadi lebih bersih dan kebersamaan antar warga semakin erat.",
        "kategori": "Kegiatan",
        "tanggal": "2025-08-10",
        "penulis": "Sekretariat RT",
        "gambar": "https://images.unsplash.com/photo-1542897643-cfccd88c7127?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    },
    {
        "judul": "Pengumuman Iuran Kas RT Bulan Desember",
        "ringkasan": "Pembayaran iuran kas RT untuk bulan Desember dibuka mulai tanggal 1 hingga 15 Desember.",
        "konten": "Diberitahukan kepada seluruh warga bahwa pembayaran iuran kas RT bulan Desember 2025 sebesar Rp 20.000,- per KK dibuka mulai 1 Desember hingga 15 Desember. Pembayaran dapat dilakukan langsung kepada Bendahara atau melalui transfer.",
        "kategori": "Pengumuman",
        "tanggal": "2025-12-01",
        "penulis": "Bendahara RT",
        "gambar": "https://images.unsplash.com/photo-1722252799188-87e1db708544?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    },
    {
        "judul": "Posyandu Balita & Lansia Rutin Setiap Bulan",
        "ringkasan": "Posyandu RT 037 melayani pemeriksaan balita dan lansia setiap tanggal 10.",
        "konten": "Posyandu RT 037 RW 002 rutin diadakan setiap tanggal 10 bertempat di Balai RT. Layanan meliputi pemeriksaan kesehatan balita, imunisasi, serta cek tensi dan gula darah untuk lansia.",
        "kategori": "Berita",
        "tanggal": "2025-11-10",
        "penulis": "Seksi Sosial",
        "gambar": "https://images.unsplash.com/photo-1769399915424-5fbd9d22b36f?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    },
    {
        "judul": "Ronda Malam Diperkuat, Jadwal Baru Berlaku",
        "ringkasan": "Mulai pekan ini, ronda malam akan diperkuat dengan tambahan jadwal piket warga.",
        "konten": "Demi menjaga keamanan lingkungan, Seksi Keamanan menetapkan jadwal ronda baru yang melibatkan seluruh kepala keluarga secara bergiliran. Mohon partisipasi aktif setiap warga.",
        "kategori": "Pengumuman",
        "tanggal": "2025-11-20",
        "penulis": "Seksi Keamanan",
        "gambar": "https://images.unsplash.com/photo-1722252799188-87e1db708544?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
    },
]

SEED_GALERI = [
    {
        "judul": "Kerja Bakti Lingkungan",
        "deskripsi": "Kebersamaan warga membersihkan lingkungan",
        "gambar": "https://images.unsplash.com/photo-1542897643-cfccd88c7127?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
        "tanggal": "2025-08-10",
    },    {
        "judul": "Pawai HUT Kemerdekaan",
        "deskripsi": "Antusiasme warga dalam pawai 17 Agustus",
        "gambar": "https://images.unsplash.com/photo-1769399915424-5fbd9d22b36f?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
        "tanggal": "2025-08-17",
    },
    {
        "judul": "Pertemuan Warga",
        "deskripsi": "Musyawarah rutin warga RT 037",
        "gambar": "https://images.unsplash.com/photo-1722252799188-87e1db708544?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
        "tanggal": "2025-09-05",
    },
    {
        "judul": "Posyandu Balita",
        "deskripsi": "Pemeriksaan kesehatan rutin balita",
        "gambar": "https://images.unsplash.com/photo-1542897643-cfccd88c7127?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
        "tanggal": "2025-10-10",
    },
]


async def seed_database():
    # Profil
    if await db.profil.count_documents({}) == 0:
        await db.profil.insert_one({**DEFAULT_PROFIL, "key": "main"})
    else:
        # Ensure new fields exist
        existing = await db.profil.find_one({"key": "main"})
        if existing and "whatsapp" not in existing:
            await db.profil.update_one(
                {"key": "main"}, {"$set": {"whatsapp": DEFAULT_PROFIL["whatsapp"]}}
            )

    # Pengurus
    if await db.pengurus.count_documents({}) == 0:
        await db.pengurus.insert_many(
            [{**p, "id": str(uuid.uuid4())} for p in SEED_PENGURUS]
        )
    # Statistik
    if await db.statistik.count_documents({}) == 0:
        await db.statistik.insert_one({**SEED_STATISTIK, "key": "warga"})
    # Berita
    if await db.berita.count_documents({}) == 0:
        await db.berita.insert_many(
            [
                {
                    **b,
                    "id": str(uuid.uuid4()),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                for b in SEED_BERITA
            ]
        )
    # Galeri
    if await db.galeri.count_documents({}) == 0:
        await db.galeri.insert_many(
            [{**g, "id": str(uuid.uuid4())} for g in SEED_GALERI]
        )
    # Warga (KK) - seed beberapa contoh KK
    if await db.warga.count_documents({}) == 0:
        seed_kk = [
            {
                "id": str(uuid.uuid4()),
                "nomor_kk": "3201001234560001",
                "nama_kepala": "Bapak Suryana",
                "alamat": "Jl. Melati Raya No. 12",
                "anggota": [
                    {"id": str(uuid.uuid4()), "nama": "Bapak Suryana", "status": "Kepala Keluarga", "pekerjaan": "Wiraswasta", "foto": None},
                    {"id": str(uuid.uuid4()), "nama": "Ibu Lestari", "status": "Istri", "pekerjaan": "Ibu Rumah Tangga", "foto": None},
                    {"id": str(uuid.uuid4()), "nama": "Dimas Suryana", "status": "Anak", "pekerjaan": "Pelajar", "foto": None},
                    {"id": str(uuid.uuid4()), "nama": "Anisa Suryana", "status": "Anak", "pekerjaan": "Pelajar", "foto": None},
                ],
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "nomor_kk": "3201001234560002",
                "nama_kepala": "Bapak Hidayat",
                "alamat": "Jl. Melati Raya No. 14",
                "anggota": [
                    {"id": str(uuid.uuid4()), "nama": "Bapak Hidayat", "status": "Kepala Keluarga", "pekerjaan": "PNS", "foto": None},
                    {"id": str(uuid.uuid4()), "nama": "Ibu Maryam", "status": "Istri", "pekerjaan": "Guru", "foto": None},
                    {"id": str(uuid.uuid4()), "nama": "Rizki Hidayat", "status": "Anak", "pekerjaan": "Mahasiswa", "foto": None},
                ],
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "nomor_kk": "3201001234560003",
                "nama_kepala": "Ibu Nurhasanah",
                "alamat": "Jl. Melati Raya No. 16",
                "anggota": [
                    {"id": str(uuid.uuid4()), "nama": "Ibu Nurhasanah", "status": "Kepala Keluarga", "pekerjaan": "Pedagang", "foto": None},
                    {"id": str(uuid.uuid4()), "nama": "Galang Nur", "status": "Anak", "pekerjaan": "Karyawan Swasta", "foto": None},
                ],
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        ]
        await db.warga.insert_many(seed_kk)


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@rt037.local").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Administrator RT",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


# ==================== Public Routes ====================
@api_router.get("/")
async def root():
    return {"message": "API RT 037 RW 002 Desa X aktif"}


@api_router.get("/profil")
async def get_profil():
    doc = await db.profil.find_one({"key": "main"}, {"_id": 0, "key": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Profil tidak ditemukan")
    return doc


@api_router.get("/pengurus", response_model=List[Pengurus])
async def list_pengurus():
    docs = await db.pengurus.find({}, {"_id": 0}).sort("urutan", 1).to_list(100)
    return [Pengurus(**d) for d in docs]


@api_router.get("/statistik", response_model=StatistikWarga)
async def get_statistik():
    doc = await db.statistik.find_one({"key": "warga"}, {"_id": 0, "key": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Statistik tidak ditemukan")
    return StatistikWarga(**doc)


@api_router.get("/berita", response_model=List[Berita])
async def list_berita(kategori: Optional[str] = None, limit: int = 20):
    query = {}
    if kategori:
        query["kategori"] = kategori
    docs = await db.berita.find(query, {"_id": 0}).sort("tanggal", -1).to_list(limit)
    return [Berita(**d) for d in docs]


@api_router.get("/berita/{berita_id}", response_model=Berita)
async def get_berita(berita_id: str):
    doc = await db.berita.find_one({"id": berita_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Berita tidak ditemukan")
    return Berita(**doc)


@api_router.get("/galeri", response_model=List[GaleriItem])
async def list_galeri():
    docs = await db.galeri.find({}, {"_id": 0}).sort("tanggal", -1).to_list(100)
    return [GaleriItem(**d) for d in docs]


@api_router.post("/pengaduan", response_model=Pengaduan, status_code=201)
async def create_pengaduan(payload: PengaduanCreate):
    obj = Pengaduan(**payload.model_dump())
    await db.pengaduan.insert_one(obj.model_dump())
    return obj


# ==================== Auth Routes ====================
@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(user["id"], user["email"], user.get("role", "admin"))
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role", "admin"),
        },
    }


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ==================== Admin Routes ====================
@api_router.put("/profil")
async def update_profil(payload: ProfilModel, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    await db.profil.update_one({"key": "main"}, {"$set": data}, upsert=True)
    doc = await db.profil.find_one({"key": "main"}, {"_id": 0, "key": 0})
    return doc


@api_router.post("/pengurus", response_model=Pengurus, status_code=201)
async def create_pengurus(payload: PengurusCreate, _: dict = Depends(require_admin)):
    obj = Pengurus(**payload.model_dump())
    await db.pengurus.insert_one(obj.model_dump())
    return obj


@api_router.put("/pengurus/{pid}", response_model=Pengurus)
async def update_pengurus(pid: str, payload: PengurusCreate, _: dict = Depends(require_admin)):
    res = await db.pengurus.update_one({"id": pid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
    doc = await db.pengurus.find_one({"id": pid}, {"_id": 0})
    return Pengurus(**doc)


@api_router.delete("/pengurus/{pid}", status_code=204)
async def delete_pengurus(pid: str, _: dict = Depends(require_admin)):
    res = await db.pengurus.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
    return None


@api_router.put("/statistik", response_model=StatistikWarga)
async def update_statistik(payload: StatistikWarga, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.statistik.update_one({"key": "warga"}, {"$set": data}, upsert=True)
    doc = await db.statistik.find_one({"key": "warga"}, {"_id": 0, "key": 0})
    return StatistikWarga(**doc)


@api_router.post("/berita", response_model=Berita, status_code=201)
async def create_berita(payload: BeritaCreate, _: dict = Depends(require_admin)):
    obj = Berita(**payload.model_dump())
    await db.berita.insert_one(obj.model_dump())
    return obj


@api_router.put("/berita/{bid}", response_model=Berita)
async def update_berita(bid: str, payload: BeritaCreate, _: dict = Depends(require_admin)):
    res = await db.berita.update_one({"id": bid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Berita tidak ditemukan")
    doc = await db.berita.find_one({"id": bid}, {"_id": 0})
    return Berita(**doc)


@api_router.delete("/berita/{bid}", status_code=204)
async def delete_berita(bid: str, _: dict = Depends(require_admin)):
    res = await db.berita.delete_one({"id": bid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Berita tidak ditemukan")
    return None


@api_router.post("/galeri", response_model=GaleriItem, status_code=201)
async def create_galeri(payload: GaleriCreate, _: dict = Depends(require_admin)):
    obj = GaleriItem(**payload.model_dump())
    await db.galeri.insert_one(obj.model_dump())
    return obj


@api_router.put("/galeri/{gid}", response_model=GaleriItem)
async def update_galeri(gid: str, payload: GaleriCreate, _: dict = Depends(require_admin)):
    res = await db.galeri.update_one({"id": gid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Galeri tidak ditemukan")
    doc = await db.galeri.find_one({"id": gid}, {"_id": 0})
    return GaleriItem(**doc)


@api_router.delete("/galeri/{gid}", status_code=204)
async def delete_galeri(gid: str, _: dict = Depends(require_admin)):
    res = await db.galeri.delete_one({"id": gid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Galeri tidak ditemukan")
    return None


@api_router.get("/pengaduan", response_model=List[Pengaduan])
async def list_pengaduan(limit: int = 100, _: dict = Depends(require_admin)):
    docs = await db.pengaduan.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return [Pengaduan(**d) for d in docs]


@api_router.put("/pengaduan/{pid}/status", response_model=Pengaduan)
async def update_pengaduan_status(
    pid: str, payload: PengaduanStatusUpdate, _: dict = Depends(require_admin)
):
    if payload.status not in {"Baru", "Diproses", "Selesai"}:
        raise HTTPException(status_code=400, detail="Status tidak valid")
    res = await db.pengaduan.update_one({"id": pid}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pengaduan tidak ditemukan")
    doc = await db.pengaduan.find_one({"id": pid}, {"_id": 0})
    return Pengaduan(**doc)


@api_router.delete("/pengaduan/{pid}", status_code=204)
async def delete_pengaduan(pid: str, _: dict = Depends(require_admin)):
    res = await db.pengaduan.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pengaduan tidak ditemukan")
    return None


# ==================== Biodata Warga ====================
def _normalize_anggota(items: List[AnggotaInput]) -> List[dict]:
    out = []
    for a in items:
        if a.status not in STATUS_ANGGOTA:
            raise HTTPException(status_code=400, detail=f"Status anggota tidak valid: {a.status}")
        out.append(
            Anggota(
                id=a.id or str(uuid.uuid4()),
                nama=a.nama,
                status=a.status,
                pekerjaan=a.pekerjaan,
                foto=a.foto,
            ).model_dump()
        )
    return out


@api_router.get("/warga", response_model=List[KK])
async def list_warga():
    docs = await db.warga.find({}, {"_id": 0}).sort("nama_kepala", 1).to_list(500)
    return [KK(**d) for d in docs]


@api_router.get("/warga/{kid}", response_model=KK)
async def get_kk(kid: str):
    doc = await db.warga.find_one({"id": kid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="KK tidak ditemukan")
    return KK(**doc)


@api_router.post("/warga", response_model=KK, status_code=201)
async def create_kk(payload: KKCreate, _: dict = Depends(require_admin)):
    obj = KK(
        nomor_kk=payload.nomor_kk,
        nama_kepala=payload.nama_kepala,
        alamat=payload.alamat,
        anggota=[Anggota(**a) for a in _normalize_anggota(payload.anggota)],
    )
    await db.warga.insert_one(obj.model_dump())
    return obj


@api_router.put("/warga/{kid}", response_model=KK)
async def update_kk(kid: str, payload: KKCreate, _: dict = Depends(require_admin)):
    data = {
        "nomor_kk": payload.nomor_kk,
        "nama_kepala": payload.nama_kepala,
        "alamat": payload.alamat,
        "anggota": _normalize_anggota(payload.anggota),
    }
    res = await db.warga.update_one({"id": kid}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="KK tidak ditemukan")
    doc = await db.warga.find_one({"id": kid}, {"_id": 0})
    return KK(**doc)


@api_router.delete("/warga/{kid}", status_code=204)
async def delete_kk(kid: str, _: dict = Depends(require_admin)):
    res = await db.warga.delete_one({"id": kid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="KK tidak ditemukan")
    return None


# ==================== Upload (Admin Only) ====================
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 4 * 1024 * 1024  # 4 MB


@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), _: dict = Depends(require_admin)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Format gambar tidak didukung")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran maksimum 4MB")
    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    ext = ext_map[file.content_type]
    fname = f"{uuid.uuid4().hex}{ext}"
    target = UPLOAD_DIR / fname
    with open(target, "wb") as f:
        f.write(data)
    return {"url": f"/api/uploads/{fname}", "filename": fname, "size": len(data)}


# ==================== App Setup ====================
app.include_router(api_router)

# Serve uploaded files (mounted on main app so prefix is /api/uploads)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
    except Exception as e:
        logger.warning(f"Index creation: {e}")
    try:
        await seed_database()
        await seed_admin()
        logger.info("Database & admin seeded.")
    except Exception as e:
        logger.exception(f"Seeding failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
