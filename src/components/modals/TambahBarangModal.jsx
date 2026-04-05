import { getUser } from "../../services/api";
export default function TambahBarangModal({
                                              show,
                                              onClose,
                                              form,
                                              handleChange,
                                              handleSubmit,
                                          }) {
    const user      = getUser();
    const stand     = user?.nomor_stand || "—";
    const namaUsaha = user?.nama_usaha  || "Kios Saya";
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
                    <div className="ms-fg full">
                        <label>Nama Barang</label>
                        <input
                            name="nama"
                            placeholder="cth: nama produk kamu"
                            value={form.nama}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="ms-fg">
                        <label>Kategori</label>
                        <select name="kategori" value={form.kategori} onChange={handleChange}>
                            <option>Makanan</option>
                            <option>Minuman</option>
                            <option>Camilan</option>
                        </select>
                    </div>

                    <div className="ms-fg">
                        <label>Harga Jual</label>
                        <input
                            name="harga"
                            type="number"
                            placeholder="Rp 0"
                            value={form.harga}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="ms-fg">
                        <label>Stok Awal</label>
                        <input
                            name="stok"
                            type="number"
                            placeholder="0"
                            value={form.stok}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="ms-fg">
                        <label>Satuan</label>
                        <input
                            name="satuan"
                            placeholder="porsi / pcs / cup"
                            value={form.satuan}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="ms-fg full">
                        <label>Keterangan</label>
                        <textarea
                            name="deskripsi"
                            placeholder="Deskripsi singkat produk..."
                            value={form.deskripsi}
                            onChange={handleChange}
                        />
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