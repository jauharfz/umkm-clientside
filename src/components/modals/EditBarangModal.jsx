import { useState, useEffect, useRef } from "react";
import { getUser } from "../../services/api";

export default function EditBarangModal({ show, onClose, item, onSave }) {
    const user   = getUser();
    const stand  = user?.nomor_stand || "—";
    const fileRef = useRef();

    const [form, setForm] = useState({
        nama: "", kategori: "Makanan", harga: "", stok: "", satuan: "",
    });
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoFile, setFotoFile]       = useState(null);

    useEffect(() => {
        if (item) {
            setForm({
                nama    : item.nama,
                kategori: item.kategori || "Makanan",
                harga   : item.harga,
                stok    : item.stok,
                satuan  : item.satuan || "",
            });
            setFotoPreview(item.foto_url || null);
            setFotoFile(null);
        }
    }, [item]);

    if (!show) return null;

    const handleChange  = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = () => {
        onSave({
            ...item,
            ...form,
            stok:     Number(form.stok),
            harga:    Number(form.harga),
            fotoFile, // kirim file baru jika ada
        });
        onClose();
    };

    return (
        <div className="ms-overlay">
            <div className="ms-modal">
                {/* HEADER */}
                <div className="ms-modal-hd">
                    <div className="ms-modal-hd-left">
                        <h3>Edit Barang</h3>
                        {stand !== "—" && <span className="ms-stand-tag">Stand {stand}</span>}
                    </div>
                    <button className="ms-modal-close" onClick={onClose}>✕</button>
                </div>

                {/* FORM */}
                <div className="ms-form-grid">

                    {/* Foto produk */}
                    <div className="ms-fg full">
                        <label>Foto Produk <span style={{fontWeight:400,color:"#9ca3af"}}>(opsional)</span></label>
                        <div className="ms-foto-row">
                            <div
                                className="ms-foto-box"
                                onClick={() => fileRef.current?.click()}
                                title="Klik untuk ganti foto"
                            >
                                {fotoPreview
                                    ? <img src={fotoPreview} alt="foto produk" className="ms-foto-preview" />
                                    : <span className="ms-foto-placeholder">📷<br/><small>Pilih foto</small></span>
                                }
                            </div>
                            <div className="ms-foto-hint">
                                {fotoFile
                                    ? <span style={{color:"#2f6f4e",fontSize:12}}>✓ Foto baru dipilih — akan diupload saat simpan</span>
                                    : <span style={{color:"#9ca3af",fontSize:11}}>Klik gambar untuk ganti foto · JPG/PNG/WEBP maks 2MB</span>
                                }
                                {fotoPreview && !fotoFile && (
                                    <button
                                        style={{display:"block",marginTop:6,fontSize:11,color:"#dc2626",background:"none",border:"none",cursor:"pointer",padding:0}}
                                        onClick={() => { setFotoPreview(null); setFotoFile("remove"); }}
                                    >
                                        🗑 Hapus foto
                                    </button>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={handleFoto}
                        />
                    </div>

                    <div className="ms-fg full">
                        <label>Nama Barang</label>
                        <input name="nama" value={form.nama} onChange={handleChange} />
                    </div>

                    <div className="ms-fg">
                        <label>Kategori</label>
                        <select name="kategori" value={form.kategori} onChange={handleChange}>
                            <option>Makanan</option>
                            <option>Minuman</option>
                            <option>Camilan</option>
                            <option>Fashion</option>
                            <option>Kerajinan</option>
                            <option>Lainnya</option>
                        </select>
                    </div>

                    <div className="ms-fg">
                        <label>Harga Jual</label>
                        <input name="harga" type="number" value={form.harga} onChange={handleChange} />
                    </div>

                    <div className="ms-fg">
                        <label>Update Stok</label>
                        <input name="stok" type="number" value={form.stok} onChange={handleChange} />
                    </div>

                    <div className="ms-fg">
                        <label>Satuan</label>
                        <input name="satuan" value={form.satuan} onChange={handleChange} />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="ms-form-act">
                    <button className="ms-btn-batal" onClick={onClose}>Batal</button>
                    <button className="ms-btn-save" onClick={handleSubmit}>Perbarui Barang</button>
                </div>
            </div>
        </div>
    );
}
