import { useState, useRef } from "react";
import "../../assets/styles/promo.css";
import { getUser } from "../../services/api";

export default function TambahPromoModal({ show, onClose, onSave, onToast }) {
  // FIX: ambil info user dari localStorage, bukan hardcode
  const user = getUser();
  const namaUsaha  = user?.nama_usaha  || "Kios Saya";
  const nomorStand = user?.nomor_stand || "—";

  const [form, setForm] = useState({
    nama: "",
    tipe: "Persentase",
    nilai: "",
    mulai: "",
    akhir: "",
    file_poster: null,
  });
  const [posterPreview, setPosterPreview] = useState(null);
  const fileRef = useRef();

  if (!show) return null;

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("file_poster", file);
    const reader = new FileReader();
    reader.onload = (ev) => setPosterPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.nama || !form.nilai || !form.mulai || !form.akhir) {
      onToast("⚠️ Semua field wajib diisi!", "warning");
      return;
    }
    onSave({ ...form });
    setForm({ nama: "", tipe: "Persentase", nilai: "", mulai: "", akhir: "", file_poster: null });
    setPosterPreview(null);
  };

  const handleClose = () => {
    setForm({ nama: "", tipe: "Persentase", nilai: "", mulai: "", akhir: "", file_poster: null });
    setPosterPreview(null);
    onClose();
  };

  return (
    <div className="pd-overlay">
      <div className="pd-modal">
        {/* HEADER */}
        <div className="pd-modal-hd">
          <div>
            <h3 className="pd-modal-title">Tambah Promo</h3>
          </div>
          <div className="pd-modal-hd-right">
            {/* FIX: tampilkan stand dan nama usaha dari data user nyata */}
            <span className="pd-kios-tag">Stand {nomorStand}</span>
            <button className="pd-modal-x" onClick={handleClose}>✕</button>
          </div>
        </div>

        {/* KIOS NOTE */}
        <div className="pd-modal-note">
          Promo ini berlaku khusus untuk kios <strong>{namaUsaha}</strong>
        </div>

        {/* BODY */}
        <div className="pd-form-grid">
          {/* Nama */}
          <div className="pd-fg pd-full">
            <label>Nama Promo</label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="cth: Diskon Hari Pertama"
            />
          </div>

          {/* Tipe */}
          <div className="pd-fg">
            <label>Tipe Diskon</label>
            <select value={form.tipe} onChange={(e) => set("tipe", e.target.value)}>
              <option value="Persentase">Persentase (%)</option>
              <option value="Nominal">Nominal (Rp)</option>
              <option value="BeliXGratisY">Beli X Gratis Y</option>
            </select>
          </div>

          {/* Nilai */}
          <div className="pd-fg">
            <label>
              {form.tipe === "Persentase" && "Nilai (%)"}
              {form.tipe === "Nominal" && "Nilai (Rp)"}
              {form.tipe === "BeliXGratisY" && "Format (cth: B2G1)"}
            </label>
            <input
              value={form.nilai}
              onChange={(e) => set("nilai", e.target.value)}
              placeholder={
                form.tipe === "Persentase" ? "cth: 20" :
                form.tipe === "Nominal" ? "cth: 5000" : "cth: B2G1"
              }
            />
          </div>

          {/* Tanggal */}
          <div className="pd-fg">
            <label>Berlaku Mulai</label>
            <input type="date" value={form.mulai} onChange={(e) => set("mulai", e.target.value)} />
          </div>
          <div className="pd-fg">
            <label>Berlaku Hingga</label>
            <input type="date" value={form.akhir} onChange={(e) => set("akhir", e.target.value)} />
          </div>

          {/* Upload Poster */}
          <div className="pd-fg pd-full">
            <label>Poster Promo <span className="pd-label-opt">(opsional)</span></label>
            {posterPreview ? (
              <div className="pd-poster-preview">
                <img src={posterPreview} alt="preview" />
                <button className="pd-poster-remove" onClick={() => { setPosterPreview(null); set("poster", null); }}>
                  ✕ Hapus Gambar
                </button>
              </div>
            ) : (
              <div className="pd-upload-zone" onClick={() => fileRef.current.click()}>
                <span className="pd-upload-icon">🖼️</span>
                <span>Klik untuk upload poster promo</span>
                <span className="pd-upload-hint">JPG, PNG – maks 2MB</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pd-form-act">
          <button className="pd-btn-outline" onClick={handleClose}>Batal</button>
          <button className="pd-btn-primary" onClick={handleSubmit}>Simpan Promo</button>
        </div>
      </div>
    </div>
  );
}