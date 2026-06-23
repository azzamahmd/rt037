import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("rt_token");
    }
    return Promise.reject(err);
  }
);

// Public
export const getProfil = () => api.get("/profil").then((r) => r.data);
export const getPengurus = () => api.get("/pengurus").then((r) => r.data);
export const getStatistik = () => api.get("/statistik").then((r) => r.data);
export const getBerita = (params = {}) => api.get("/berita", { params }).then((r) => r.data);
export const getBeritaDetail = (id) => api.get(`/berita/${id}`).then((r) => r.data);
export const getGaleri = () => api.get("/galeri").then((r) => r.data);
export const postPengaduan = (payload) => api.post("/pengaduan", payload).then((r) => r.data);

// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);

// Admin
export const updateProfil = (data) => api.put("/profil", data).then((r) => r.data);

export const createPengurus = (data) => api.post("/pengurus", data).then((r) => r.data);
export const updatePengurus = (id, data) => api.put(`/pengurus/${id}`, data).then((r) => r.data);
export const deletePengurus = (id) => api.delete(`/pengurus/${id}`).then((r) => r.data);

export const updateStatistik = (data) => api.put("/statistik", data).then((r) => r.data);

export const createBerita = (data) => api.post("/berita", data).then((r) => r.data);
export const updateBerita = (id, data) => api.put(`/berita/${id}`, data).then((r) => r.data);
export const deleteBerita = (id) => api.delete(`/berita/${id}`).then((r) => r.data);

export const createGaleri = (data) => api.post("/galeri", data).then((r) => r.data);
export const updateGaleri = (id, data) => api.put(`/galeri/${id}`, data).then((r) => r.data);
export const deleteGaleri = (id) => api.delete(`/galeri/${id}`).then((r) => r.data);

export const listPengaduan = () => api.get("/pengaduan").then((r) => r.data);
export const updatePengaduanStatus = (id, status) =>
  api.put(`/pengaduan/${id}/status`, { status }).then((r) => r.data);
export const deletePengaduan = (id) => api.delete(`/pengaduan/${id}`).then((r) => r.data);

// Warga (Biodata)
export const getWarga = () => api.get("/warga").then((r) => r.data);
export const createKK = (data) => api.post("/warga", data).then((r) => r.data);
export const updateKK = (id, data) => api.put(`/warga/${id}`, data).then((r) => r.data);
export const deleteKK = (id) => api.delete(`/warga/${id}`).then((r) => r.data);

// Upload (admin only). Returns { url, filename, size }
export const uploadImage = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

// Helper: convert returned upload URL (relative /api/uploads/x) to absolute browser URL
export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_URL}${url}`;
};
