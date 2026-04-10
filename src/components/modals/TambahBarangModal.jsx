import { useRef } from "react";
import { getUser } from "../../services/api";

export default function TambahBarangModal({
    show, onClose, form, handleChange, handleSubmit, fotoPreview, onFotoChange,
}) {
    const user       = getUser();
    const stand      = user?.nomor_stand || "—";
    const namaUsaha  = user?.nama_usaha  || "Kios Saya";
    const fileRef    = useRef();

    if (!show) return null;

    return (
        <div className="ms-overlay">
            <div className="ms-modal">
                {/* HEADER */}
                <div className="ms-modal-hd">
                    <div className="ms-modal-hd-left">
                        <h3>Tambah Barang</h3>
                        {stand !== "—" && <span className="ms-stand-tag">Stand {stand}</span>}
                    </div>
                    <button className="ms-modal-close" onClick={onClose}>✕</button>
                </div>

                {/* INFO */}
                <div className="ms-modal-info">
                    Barang ini akan ditambahkan ke stok <strong>{namaUsaha}</strong>
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
                                title="Klik untuk pilih foto"
                            >
                                {fotoPreview
                                    ? <img src={fotoPreview} alt="preview" className="ms-foto-preview" />
                                    : <span className="ms-foto-placeholder">📷<br/><small>Pilih foto</small></span>
                                }
                            </div>
                            <div className="ms-foto-hint">
                                JPG / PNG / WEBP · maks 2 MB<br/>
                                <span style={{color:"#9ca3af",fontSize:11}}>Foto ditampilkan di kasir sebagai thumbnail produk</span>
                            </div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={onFotoChange}
                        />
                    </div>

                    <div className="ms-fg full">
                        <label>Nama Barang</label>
                        <input name="nama" placeholder="cth: nama produk kamu" value={form.nama} onChange={handleChange} />
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
                        <input name="harga" type="number" placeholder="Rp 0" value={form.harga} onChange={handleChange} />
                    </div>

                    <div className="ms-fg">
                        <label>Stok Awal</label>
                        <input name="stok" type="number" placeholder="0" value={form.stok} onChange={handleChange} />
                    </div>

                    <div className="ms-fg">
                        <label>Satuan</label>
                        <input name="satuan" placeholder="porsi / pcs / cup" value={form.satuan} onChange={handleChange} />
                    </div>

                    <div className="ms-fg full">
                        <label>Keterangan</label>
                        <textarea name="deskripsi" placeholder="Deskripsi singkat produk..." value={form.deskripsi} onChange={handleChange} />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="ms-form-act">
                    <button className="ms-btn-batal" onClick={onClose}>Batal</button>
                    <button className="ms-btn-save" onClick={handleSubmit}>Simpan Barang</button>
                </div>
            </div>
        </div>
    );
}
