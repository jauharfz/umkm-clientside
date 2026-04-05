import { useState, useEffect } from "react";
import "../../assets/styles/settings.css";
import api, { getUser, setUser } from "../../services/api";

export default function ProfileForm({ onToast }) {
  // FIX: form hanya field yang didukung backend (nama_pemilik, nama_usaha, alamat, deskripsi)
  // Field telepon dihapus — backend schema tidak menerima field ini
  const [form, setForm]         = useState({ nama: "", namaUsaha: "", alamat: "", deskripsi: "" });
  const [original, setOriginal] = useState({ nama: "", namaUsaha: "", alamat: "", deskripsi: "" });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/profil")
      .then(res => {
        // FIX: response adalah { status, data: {...} } → ambil res.data
        const d = res.data || res;
        const init = {
          nama:      d.nama_pemilik || "",
          namaUsaha: d.nama_usaha   || "",
          alamat:    d.alamat       || "",
          deskripsi: d.deskripsi    || "",
        };
        setForm(init);
        setOriginal(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.nama) {
      onToast("⚠️ Nama lengkap wajib diisi!", "warning");
      return;
    }
    try {
      await api.patch("/profil", {
        nama_pemilik: form.nama,
        nama_usaha:   form.namaUsaha,
        alamat:       form.alamat,
        deskripsi:    form.deskripsi,
      });
      setOriginal({ ...form });

      // FIX: update localStorage agar Dashboard & Layout langsung sinkron
      const currentUser = getUser();
      if (currentUser) {
        setUser({
          ...currentUser,
          nama_pemilik: form.nama,
          nama_usaha:   form.namaUsaha,
          alamat:       form.alamat,
          deskripsi:    form.deskripsi,
        });
      }

      onToast("✅ Data diri berhasil disimpan!");
    } catch (err) {
      onToast(err.message || "❌ Gagal menyimpan data", "danger");
    }
  };

  const handleCancel = () => setForm({ ...original });

  return (
    <div className="st-card">
      <div className="st-card-hd">
        <h2>Data Diri</h2>
        <p>Informasi pemilik kios</p>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: 14, padding: "8px 0" }}>Memuat data...</p>
      ) : (
        <div className="st-form">
          <div className="st-fg st-full">
            <label>Nama Lengkap</label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="Nama lengkap kamu"
            />
          </div>

          <div className="st-fg st-full">
            <label>Nama Usaha</label>
            <input
              value={form.namaUsaha}
              onChange={(e) => set("namaUsaha", e.target.value)}
              placeholder="Nama usaha kamu"
            />
          </div>

          <div className="st-fg st-full">
            <label>Alamat</label>
            <input
              value={form.alamat}
              onChange={(e) => set("alamat", e.target.value)}
              placeholder="Alamat usaha kamu"
            />
          </div>

          <div className="st-fg st-full">
            <label>Deskripsi</label>
            <input
              value={form.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
              placeholder="Deskripsi singkat usaha kamu"
            />
          </div>

          <div className="st-form-act">
            <button className="st-btn-outline" onClick={handleCancel}>Batal</button>
            <button className="st-btn-primary" onClick={handleSave}>Simpan</button>
          </div>
        </div>
      )}
    </div>
  );
}

