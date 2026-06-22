# PRD - Website Profil RT 037 RW 002 Desa X

## Original Problem Statement
"buat website profil RT 037 RW 002 Desa X"

## Iteration Updates
- Iter 2: hilangkan bagian sejarah, admin login + CRUD, WhatsApp click-to-chat, mobile-friendly.

## Architecture
- Backend: FastAPI + MongoDB (motor) + JWT (PyJWT) + bcrypt
- Frontend: React (CRA + Craco) + Tailwind + Shadcn UI + sonner toasts + React Router
- Auth: Bearer token in `localStorage` (key: `rt_token`), `Authorization: Bearer …` header

## Implemented
### Public site (`/`)
- Hero, Profil (Visi + Misi — sejarah dihapus), Statistik, Pengurus, Berita (filter), Galeri, Kontak + form pengaduan
- WhatsApp inline button di Kontak + floating WA button (fixed bottom-right)
- Mobile responsive (hamburger menu, scaling typography)

### Admin (`/login` → `/admin`)
- JWT login, dilindungi `RequireAuth`
- 6 panel CRUD: Profil RT (incl. WhatsApp number), Pengurus, Statistik Warga, Berita, Galeri, Pengaduan (status update + reply via WA)
- Auto-seed admin: `admin@rt037.local / admin123`

### Endpoints
- Public: GET /api/profil, /pengurus, /statistik, /berita[/{id}], /galeri; POST /pengaduan
- Auth: POST /api/auth/login, GET /api/auth/me
- Admin: PUT /profil, POST/PUT/DELETE /pengurus/{id}, PUT /statistik, POST/PUT/DELETE /berita/{id}, POST/PUT/DELETE /galeri/{id}, GET /pengaduan, PUT /pengaduan/{id}/status, DELETE /pengaduan/{id}

## Test Coverage
- Backend pytest: 23/23 (iteration_3.json)
- Frontend automatable flows: 100% (iteration_3.json)

## Backlog (P1/P2)
- P1: Halaman detail berita
- P1: data-testid pada row-action buttons & input form admin
- P1: Brute-force lockout pada login (sekarang unlimited)
- P2: AlertDialog (shadcn) menggantikan `window.confirm`
- P2: Manajemen multi-admin & change password
- P2: Iuran/keuangan kas RT (laporan transparan)
- P2: Upload gambar (sekarang URL eksternal)
- P2: Direktori warga (KK) dengan privasi

## Credentials
- Admin: `admin@rt037.local / admin123`  (lihat `/app/memory/test_credentials.md`)
