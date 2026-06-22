"""Backend tests for RT 037 RW 002 Desa X API (iteration 3 - auth + admin)."""
import os
import requests
import pytest
from pathlib import Path

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_file = Path("/app/frontend/.env")
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@rt037.local"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_session(admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


# ==================== Health ====================
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ==================== Auth ====================
def test_login_success(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 10
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"


def test_login_wrong_password(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
    assert r.status_code == 401


def test_login_unknown_email(session):
    r = session.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "x"})
    assert r.status_code == 401


def test_auth_me_with_token(auth_session):
    r = auth_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"
    assert "password_hash" not in data


def test_auth_me_without_token(session):
    r = session.get(f"{API}/auth/me")
    assert r.status_code == 401


# ==================== Profil ====================
def test_profil_no_sejarah_has_whatsapp(session):
    r = session.get(f"{API}/profil")
    assert r.status_code == 200
    data = r.json()
    assert data["nama_rt"] == "RT 037"
    assert "whatsapp" in data
    # Sejarah removed in iteration 3
    assert "sejarah" not in data or data.get("sejarah") in (None, "")


def test_profil_update_requires_auth(session):
    r = session.put(f"{API}/profil", json={"nama_rt": "RT 037", "whatsapp": "62800"})
    assert r.status_code == 401


def test_profil_update_whatsapp_persists(auth_session, session):
    # Read current
    current = session.get(f"{API}/profil").json()
    new_wa = "6289999888777"
    payload = {**current, "whatsapp": new_wa}
    # Drop unknown keys not in ProfilModel
    for k in ("sejarah",):
        payload.pop(k, None)
    r = auth_session.put(f"{API}/profil", json=payload)
    assert r.status_code == 200, r.text
    assert r.json()["whatsapp"] == new_wa
    # Verify via GET
    r2 = session.get(f"{API}/profil")
    assert r2.json()["whatsapp"] == new_wa
    # Restore
    payload["whatsapp"] = current.get("whatsapp", "6281234567890")
    auth_session.put(f"{API}/profil", json=payload)


# ==================== Pengurus ====================
def test_pengurus_list(session):
    r = session.get(f"{API}/pengurus")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1


def test_pengurus_admin_requires_auth(session):
    r = session.post(f"{API}/pengurus", json={"nama": "X", "jabatan": "Y", "inisial": "Z", "urutan": 99})
    assert r.status_code == 401


def test_pengurus_crud_lifecycle(auth_session, session):
    # CREATE
    payload = {"nama": "TEST_Bapak Uji", "jabatan": "Tester", "inisial": "BU", "urutan": 999}
    r = auth_session.post(f"{API}/pengurus", json=payload)
    assert r.status_code == 201, r.text
    created = r.json()
    pid = created["id"]
    assert created["nama"] == payload["nama"]

    # LIST contains it
    r2 = session.get(f"{API}/pengurus")
    assert any(p["id"] == pid for p in r2.json())

    # UPDATE
    upd = {"nama": "TEST_Updated", "jabatan": "Tester", "inisial": "TU", "urutan": 999}
    r3 = auth_session.put(f"{API}/pengurus/{pid}", json=upd)
    assert r3.status_code == 200
    assert r3.json()["nama"] == "TEST_Updated"

    # Verify via list
    r4 = session.get(f"{API}/pengurus")
    found = next((p for p in r4.json() if p["id"] == pid), None)
    assert found and found["nama"] == "TEST_Updated"

    # DELETE
    r5 = auth_session.delete(f"{API}/pengurus/{pid}")
    assert r5.status_code == 204

    # Verify gone
    r6 = session.get(f"{API}/pengurus")
    assert not any(p["id"] == pid for p in r6.json())


# ==================== Statistik ====================
def test_statistik_get(session):
    r = session.get(f"{API}/statistik")
    assert r.status_code == 200
    data = r.json()
    for k in ("total_kk", "total_jiwa", "laki_laki", "perempuan"):
        assert k in data


def test_statistik_update_requires_auth(session):
    r = session.put(f"{API}/statistik", json={"total_kk": 1, "total_jiwa": 1, "laki_laki": 1, "perempuan": 0})
    assert r.status_code == 401


def test_statistik_update(auth_session, session):
    current = session.get(f"{API}/statistik").json()
    new_kk = current["total_kk"] + 1
    payload = {**current, "total_kk": new_kk}
    r = auth_session.put(f"{API}/statistik", json=payload)
    assert r.status_code == 200
    assert r.json()["total_kk"] == new_kk
    # Restore
    auth_session.put(f"{API}/statistik", json={**current})


# ==================== Berita ====================
def test_berita_list(session):
    r = session.get(f"{API}/berita")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_berita_crud_lifecycle(auth_session, session):
    payload = {
        "judul": "TEST_Berita Uji",
        "ringkasan": "Ringkasan uji",
        "konten": "Konten lengkap uji",
        "kategori": "Berita",
        "tanggal": "2026-01-15",
    }
    # 401 without auth
    r0 = session.post(f"{API}/berita", json=payload)
    assert r0.status_code == 401

    # CREATE
    r = auth_session.post(f"{API}/berita", json=payload)
    assert r.status_code == 201
    bid = r.json()["id"]

    # LIST contains
    r2 = session.get(f"{API}/berita", params={"limit": 100})
    assert any(b["id"] == bid for b in r2.json())

    # UPDATE
    r3 = auth_session.put(f"{API}/berita/{bid}", json={**payload, "judul": "TEST_Updated Berita"})
    assert r3.status_code == 200
    assert r3.json()["judul"] == "TEST_Updated Berita"

    # DELETE
    r4 = auth_session.delete(f"{API}/berita/{bid}")
    assert r4.status_code == 204

    # 404 after delete
    r5 = session.get(f"{API}/berita/{bid}")
    assert r5.status_code == 404


# ==================== Galeri ====================
def test_galeri_list(session):
    r = session.get(f"{API}/galeri")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_galeri_crud_lifecycle(auth_session, session):
    payload = {
        "judul": "TEST_Foto Uji",
        "deskripsi": "Deskripsi uji",
        "gambar": "https://example.com/test.jpg",
        "tanggal": "2026-01-15",
    }
    # 401 unauth
    r0 = session.post(f"{API}/galeri", json=payload)
    assert r0.status_code == 401

    r = auth_session.post(f"{API}/galeri", json=payload)
    assert r.status_code == 201
    gid = r.json()["id"]

    r2 = session.get(f"{API}/galeri")
    assert any(g["id"] == gid for g in r2.json())

    r3 = auth_session.put(f"{API}/galeri/{gid}", json={**payload, "judul": "TEST_Updated Foto"})
    assert r3.status_code == 200
    assert r3.json()["judul"] == "TEST_Updated Foto"

    r4 = auth_session.delete(f"{API}/galeri/{gid}")
    assert r4.status_code == 204


# ==================== Pengaduan ====================
def test_pengaduan_public_create(session):
    payload = {
        "nama": "TEST_Warga",
        "email": "t@example.com",
        "no_hp": "081200001111",
        "subjek": "Uji",
        "pesan": "Ini adalah pesan uji.",
    }
    r = session.post(f"{API}/pengaduan", json=payload)
    assert r.status_code == 201
    created = r.json()
    assert created["status"] == "Baru"
    assert "id" in created


def test_pengaduan_list_requires_auth(session):
    r = session.get(f"{API}/pengaduan")
    assert r.status_code == 401


def test_pengaduan_full_lifecycle(session, auth_session):
    # 1. Public creates
    payload = {"nama": "TEST_Lifecycle", "subjek": "Lifecycle subjek", "pesan": "Pesan lifecycle test"}
    r = session.post(f"{API}/pengaduan", json=payload)
    assert r.status_code == 201
    pid = r.json()["id"]

    # 2. Admin sees it
    r2 = auth_session.get(f"{API}/pengaduan")
    assert r2.status_code == 200
    assert any(p["id"] == pid for p in r2.json())

    # 3. Admin updates status to Selesai
    r3 = auth_session.put(f"{API}/pengaduan/{pid}/status", json={"status": "Selesai"})
    assert r3.status_code == 200
    assert r3.json()["status"] == "Selesai"

    # 4. Invalid status -> 400
    r4 = auth_session.put(f"{API}/pengaduan/{pid}/status", json={"status": "Invalid"})
    assert r4.status_code == 400

    # 5. Status update requires auth
    r5 = session.put(f"{API}/pengaduan/{pid}/status", json={"status": "Baru"})
    assert r5.status_code == 401

    # 6. Delete requires auth
    r6 = session.delete(f"{API}/pengaduan/{pid}")
    assert r6.status_code == 401

    # 7. Admin deletes
    r7 = auth_session.delete(f"{API}/pengaduan/{pid}")
    assert r7.status_code == 204

    # 8. Verify gone from list
    r8 = auth_session.get(f"{API}/pengaduan")
    assert not any(p["id"] == pid for p in r8.json())


def test_pengaduan_validation(session):
    r = session.post(f"{API}/pengaduan", json={"nama": "A", "subjek": "test", "pesan": "halo dunia"})
    assert r.status_code == 422


# ==================== Biodata Warga (KK) ====================
def test_warga_list_public(session):
    r = session.get(f"{API}/warga")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 3  # seeded 3 KK
    kk = data[0]
    for k in ("id", "nama_kepala", "alamat", "anggota"):
        assert k in kk
    assert isinstance(kk["anggota"], list)
    if kk["anggota"]:
        a = kk["anggota"][0]
        for k in ("nama", "status", "pekerjaan"):
            assert k in a
        assert "foto" in a  # optional but key present


def test_warga_get_by_id(session):
    listing = session.get(f"{API}/warga").json()
    assert listing
    kid = listing[0]["id"]
    r = session.get(f"{API}/warga/{kid}")
    assert r.status_code == 200
    assert r.json()["id"] == kid


def test_warga_get_invalid_id(session):
    r = session.get(f"{API}/warga/nonexistent-id-xyz")
    assert r.status_code == 404


def test_warga_create_requires_auth(session):
    r = session.post(f"{API}/warga", json={"nama_kepala": "X", "alamat": "Y", "anggota": []})
    assert r.status_code == 401


def test_warga_create_invalid_status(auth_session):
    payload = {
        "nomor_kk": "TEST_KK_INVALID",
        "nama_kepala": "TEST_Invalid",
        "alamat": "Jl. Invalid",
        "anggota": [{"nama": "X", "status": "Foo", "pekerjaan": ""}],
    }
    r = auth_session.post(f"{API}/warga", json=payload)
    assert r.status_code == 400


def test_warga_crud_lifecycle(auth_session, session):
    create_payload = {
        "nomor_kk": "TEST_KK_001",
        "nama_kepala": "TEST_Kepala",
        "alamat": "Jl. Uji No.1",
        "anggota": [
            {"nama": "TEST_Bapak", "status": "Kepala Keluarga", "pekerjaan": "Pegawai"},
            {"nama": "TEST_Ibu", "status": "Istri", "pekerjaan": "IRT"},
        ],
    }
    # CREATE
    r = auth_session.post(f"{API}/warga", json=create_payload)
    assert r.status_code == 201, r.text
    kk = r.json()
    kid = kk["id"]
    assert kk["nama_kepala"] == "TEST_Kepala"
    assert len(kk["anggota"]) == 2
    assert all("id" in a for a in kk["anggota"])

    # GET verifies persistence
    r2 = session.get(f"{API}/warga/{kid}")
    assert r2.status_code == 200
    assert r2.json()["nama_kepala"] == "TEST_Kepala"

    # UPDATE - add new anggota
    upd_payload = {
        **create_payload,
        "nama_kepala": "TEST_KepalaUpdated",
        "anggota": create_payload["anggota"] + [{"nama": "TEST_Anak", "status": "Anak", "pekerjaan": "Pelajar"}],
    }
    r3 = auth_session.put(f"{API}/warga/{kid}", json=upd_payload)
    assert r3.status_code == 200
    body3 = r3.json()
    assert body3["nama_kepala"] == "TEST_KepalaUpdated"
    assert len(body3["anggota"]) == 3

    # UPDATE no auth -> 401
    r3b = session.put(f"{API}/warga/{kid}", json=upd_payload)
    assert r3b.status_code == 401

    # UPDATE invalid id -> 404
    r4 = auth_session.put(f"{API}/warga/does-not-exist", json=upd_payload)
    assert r4.status_code == 404

    # DELETE without auth -> 401
    r5 = session.delete(f"{API}/warga/{kid}")
    assert r5.status_code == 401

    # DELETE
    r6 = auth_session.delete(f"{API}/warga/{kid}")
    assert r6.status_code == 204

    # GET after delete -> 404
    r7 = session.get(f"{API}/warga/{kid}")
    assert r7.status_code == 404


# ==================== Upload ====================
# 1x1 PNG
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff"
    b"\xff?\x00\x05\xfe\x02\xfe\xa3\x35\x81\x84\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_upload_requires_auth():
    r = requests.post(f"{API}/upload", files={"file": ("a.png", PNG_BYTES, "image/png")})
    assert r.status_code == 401


def test_upload_invalid_mime(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.post(f"{API}/upload", headers=headers,
                      files={"file": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 400


def test_upload_valid_png_accessible(admin_token, session):
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.post(f"{API}/upload", headers=headers,
                      files={"file": ("test.png", PNG_BYTES, "image/png")})
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ("url", "filename", "size"):
        assert k in data
    assert data["url"].startswith("/api/uploads/")
    assert data["url"].endswith(".png")
    assert data["size"] == len(PNG_BYTES)
    # File accessible via static mount
    img_url = f"{BASE_URL}{data['url']}"
    r2 = requests.get(img_url)
    assert r2.status_code == 200
    assert r2.content == PNG_BYTES


def test_upload_too_large(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    big = b"\x00" * (4 * 1024 * 1024 + 100)
    # Construct minimal png header so mime check passes
    payload = b"\x89PNG\r\n\x1a\n" + big
    r = requests.post(f"{API}/upload", headers=headers,
                      files={"file": ("big.png", payload, "image/png")})
    assert r.status_code == 413


# ==================== Pengurus foto field ====================
def test_pengurus_with_foto_crud(auth_session, session):
    payload = {"nama": "TEST_Foto", "jabatan": "Tester", "inisial": "TF", "foto": "/api/uploads/test.png", "urutan": 998}
    r = auth_session.post(f"{API}/pengurus", json=payload)
    assert r.status_code == 201, r.text
    created = r.json()
    pid = created["id"]
    assert created["foto"] == "/api/uploads/test.png"

    # GET list returns foto
    listing = session.get(f"{API}/pengurus").json()
    found = next((p for p in listing if p["id"] == pid), None)
    assert found and found["foto"] == "/api/uploads/test.png"

    # Update unset foto
    r2 = auth_session.put(f"{API}/pengurus/{pid}", json={**payload, "foto": None})
    assert r2.status_code == 200
    assert r2.json()["foto"] is None

    # Cleanup
    auth_session.delete(f"{API}/pengurus/{pid}")
