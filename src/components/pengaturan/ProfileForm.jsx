import { useState, useEffect, useRef } from "react";
import "../../assets/styles/settings.css";
import api, { getUser, setUser } from "../../services/api";

export default function ProfileForm({ onToast }) {
    const [form, setForm]         = useState({ nama: "", namaUsaha: "", alamat: "", deskripsi: "" });
    const [original, setOriginal] = useState({ nama: "", namaUsaha: "", alamat: "", deskripsi: "" });
    const [loading, setLoading]   = useState(true);

    // QRIS state
    const [qrisUrl, setQrisUrl]       = useState(null);   // URL tersimpan di DB
    const [qrisPreview, setQrisPreview] = useState(null); // preview sebelum upload
    const [qrisFile, setQrisFile]     = useState(null);
    const [qrisLoading, setQrisLoading] = useState(false);
    const qrisInputRef = useRef(null);

    useEffect(() => {
        api.get("/profil")
            .then(res => {
                const d = res.data || res;
                const init = {
                    nama:      d.nama_pemilik || "",
                    namaUsaha: d.nama_usaha   || "",
                    alamat:    d.alamat       || "",
                    deskripsi: d.deskripsi    || "",
                };
                setForm(init);
                setOriginal(init);
                if (d.qris_url) setQrisUrl(d.qris_url);
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

    // ── QRIS handlers ──────────────────────────────────────────────
    const handleQrisChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setQrisFile(file);
        setQrisPreview(URL.createObjectURL(file));
    };

    const handleQrisUpload = async () => {
        if (!qrisFile) return;
        setQrisLoading(true);
        try {
            const fd = new FormData();
            fd.append("file", qrisFile);
            const res = await api.postForm("/profil/qris-upload", fd);
            const url = res?.qris_url || res?.data?.qris_url;
            setQrisUrl(url);
            setQrisPreview(null);
            setQrisFile(null);
            if (qrisInputRef.current) qrisInputRef.current.value = "";

            // Sinkronisasi ke localStorage agar Kasir.jsx langsung pakai
            const currentUser = getUser();
            if (currentUser) setUser({ ...currentUser, qris_url: url });

            onToast("✅ Foto QRIS berhasil disimpan!");
        } catch (err) {
            onToast(err.message || "❌ Gagal upload QRIS", "danger");
        } finally {
            setQrisLoading(false);
        }
    };

    const handleQrisRemove = async () => {
        try {
            await api.patch("/profil", { qris_url: "" });
            setQrisUrl(null);
            setQrisPreview(null);
            setQrisFile(null);
            if (qrisInputRef.current) qrisInputRef.current.value = "";

            const currentUser = getUser();
            if (currentUser) setUser({ ...currentUser, qris_url: null });

            onToast("✅ Foto QRIS dihapus");
        } catch (err) {
            onToast(err.message || "❌ Gagal hapus QRIS", "danger");
        }
    };

    return (
        <>
            {/* ── Data Diri ── */}
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

            {/* ── Foto QRIS ── */}
            <div className="st-card" style={{ marginTop: 20 }}>
                <div className="st-card-hd">
                    <h2>📱 Foto QRIS</h2>
                    <p>Ditampilkan ke pembeli saat kasir memilih metode QRIS. Upload foto QR dari m-banking atau stiker QRIS kamu.</p>
                </div>

                <div className="st-qris-wrap">
                    {/* Preview area */}
                    <div className="st-qris-preview-box">
                        {qrisPreview ? (
                            <img src={qrisPreview} alt="Preview QRIS baru" className="st-qris-img" />
                        ) : qrisUrl ? (
                            <img src={qrisUrl} alt="QRIS tersimpan" className="st-qris-img" />
                        ) : (
                            <div className="st-qris-placeholder">
                                <span style={{ fontSize: 32 }}>📷</span>
                                <span>Belum ada foto QRIS</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="st-qris-controls">
                        {qrisPreview && (
                            <p className="st-qris-hint">
                                ⬆ Preview foto baru — klik <strong>Simpan QRIS</strong> untuk mengupload.
                            </p>
                        )}

                        <input
                            ref={qrisInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={handleQrisChange}
                        />

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                                className="st-btn-outline"
                                onClick={() => qrisInputRef.current?.click()}
                                disabled={qrisLoading}
                            >
                                📁 Pilih Foto
                            </button>

                            {qrisFile && (
                                <button
                                    className="st-btn-primary"
                                    onClick={handleQrisUpload}
                                    disabled={qrisLoading}
                                >
                                    {qrisLoading ? "Mengupload..." : "⬆ Simpan QRIS"}
                                </button>
                            )}

                            {qrisUrl && !qrisFile && (
                                <button
                                    className="st-btn-outline"
                                    onClick={handleQrisRemove}
                                    style={{ color: "#dc2626", borderColor: "#fecaca" }}
                                    disabled={qrisLoading}
                                >
                                    🗑 Hapus QRIS
                                </button>
                            )}
                        </div>

                        <p className="st-qris-hint" style={{ marginTop: 8 }}>
                            Format: JPG / PNG / WEBP · Maks. 2 MB
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}