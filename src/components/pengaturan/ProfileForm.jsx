import { useState, useEffect } from "react";
import "../../assets/styles/settings.css";
import api from "../../services/api";

export default function ProfileForm({ onToast }) {
  const [form, setForm]     = useState({ nama: "", telepon: "", email: "" });
  const [original, setOriginal] = useState({ nama: "", telepon: "", email: "" });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/profil")
      .then(res => {
        const d = res.data || res;
        const init = {
          nama:    d.nama_pemilik || d.nama || "",
          telepon: d.telepon || d.phone || "",
          email:   d.email || "",
        };
        setForm(init);
        setOriginal(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.nama || !form.telepon || !form.email) {
      onToast("⚠️ Semua field wajib diisi!", "warning");
      return;
    }
    try {
      await api.patch("/profil", {
        nama_pemilik: form.nama,
        telepon:      form.telepon,
        email:        form.email,
      });
      setOriginal({ ...form });
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

          <div className="st-row">
            <div className="st-fg">
              <label>No. Telepon</label>
              <input
                value={form.telepon}
                onChange={(e) => set("telepon", e.target.value)}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
            <div className="st-fg">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@contoh.com"
              />
            </div>
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
