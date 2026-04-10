import { useState } from "react";
import "../../assets/styles/promo.css";
import { getUser } from "../../services/api";

export default function TambahPromoModal({ show, onClose, onSave, onToast }) {
    const user       = getUser();
    const namaUsaha  = user?.nama_usaha  || "Kios Saya";
    const nomorStand = user?.nomor_stand || "—";

    const empty = { nama: "", tipe: "Persentase", nilai: "", mulai: "", akhir: "" };
    const [form, setForm] = useState(empty);

    if (!show) return null;

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = () => {
        if (!form.nama || !form.nilai || !form.mulai || !form.akhir) {
            onToast("⚠️ Semua field wajib diisi!", "warning");
            return;
        }
        onSave({ ...form });
        setForm(empty);
    };

    const handleClose = () => {
        setForm(empty);
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
                    <div className="pd-fg pd-full">
                        <label>Nama Promo</label>
                        <input
                            value={form.nama}
                            onChange={(e) => set("nama", e.target.value)}
                            placeholder="cth: Diskon Hari Pertama"
                        />
                    </div>

                    <div className="pd-fg">
                        <label>Tipe Diskon</label>
                        <select value={form.tipe} onChange={(e) => set("tipe", e.target.value)}>
                            <option value="Persentase">Persentase (%)</option>
                            <option value="Nominal">Nominal (Rp)</option>
                            <option value="BeliXGratisY">Beli X Gratis Y</option>
                        </select>
                    </div>

                    <div className="pd-fg">
                        <label>
                            {form.tipe === "Persentase" && "Nilai (%)"}
                            {form.tipe === "Nominal"    && "Nilai (Rp)"}
                            {form.tipe === "BeliXGratisY" && "Format (cth: B2G1)"}
                        </label>
                        <input
                            value={form.nilai}
                            onChange={(e) => set("nilai", e.target.value)}
                            placeholder={
                                form.tipe === "Persentase"   ? "cth: 20"   :
                                    form.tipe === "Nominal"      ? "cth: 5000" : "cth: B2G1"
                            }
                        />
                    </div>

                    <div className="pd-fg">
                        <label>Berlaku Mulai</label>
                        <input type="date" value={form.mulai} onChange={(e) => set("mulai", e.target.value)} />
                    </div>
                    <div className="pd-fg">
                        <label>Berlaku Hingga</label>
                        <input type="date" value={form.akhir} onChange={(e) => set("akhir", e.target.value)} />
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