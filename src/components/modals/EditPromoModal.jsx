import { useState, useEffect } from "react";
import "../../assets/styles/promo.css";
import { getUser } from "../../services/api";

export default function EditPromoModal({ show, item, onClose, onSave, onToast }) {
    const user  = getUser();
    const stand = user?.nomor_stand || "—";

    const [form, setForm] = useState({
        nama: "", tipe: "Persentase", nilai: "", mulai: "", akhir: "", status: "aktif",
    });

    useEffect(() => {
        if (item) {
            setForm({
                nama:   item.nama   || "",
                tipe:   item.tipe   || "Persentase",
                nilai:  item.nilai  || "",
                mulai:  item.mulai  || "",
                akhir:  item.akhir  || "",
                status: item.status || "aktif",
            });
        }
    }, [item]);

    if (!show) return null;

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = () => {
        if (!form.nama || !form.nilai || !form.mulai || !form.akhir) {
            onToast("⚠️ Semua field wajib diisi!", "warning");
            return;
        }
        onSave({ ...item, ...form });
    };

    return (
        <div className="pd-overlay">
            <div className="pd-modal">
                {/* HEADER */}
                <div className="pd-modal-hd">
                    <div>
                        <h3 className="pd-modal-title">Edit Promo</h3>
                    </div>
                    <div className="pd-modal-hd-right">
                        {stand !== "—" && <span className="pd-kios-tag">Stand {stand}</span>}
                        <button className="pd-modal-x" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* BODY */}
                <div className="pd-form-grid">
                    <div className="pd-fg pd-full">
                        <label>Nama Promo</label>
                        <input value={form.nama} onChange={(e) => set("nama", e.target.value)} />
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
                        <label>Nilai</label>
                        <input value={form.nilai} onChange={(e) => set("nilai", e.target.value)} />
                    </div>

                    <div className="pd-fg">
                        <label>Berlaku Mulai</label>
                        <input type="date" value={form.mulai} onChange={(e) => set("mulai", e.target.value)} />
                    </div>
                    <div className="pd-fg">
                        <label>Berlaku Hingga</label>
                        <input type="date" value={form.akhir} onChange={(e) => set("akhir", e.target.value)} />
                    </div>

                    <div className="pd-fg">
                        <label>Status</label>
                        <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>
                </div>

                <div className="pd-form-act">
                    <button className="pd-btn-outline" onClick={onClose}>Batal</button>
                    <button className="pd-btn-primary" onClick={handleSubmit}>Simpan</button>
                </div>
            </div>
        </div>
    );
}