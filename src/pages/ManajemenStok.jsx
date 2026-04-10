import { useState, useEffect } from "react";
import { Search, Box, AlertTriangle, Utensils, Plus } from "lucide-react";
import StokTable from "../components/ManajemenStok/StokTable";
import StokRow from "../components/ManajemenStok/StokRow";
import TambahBarangModal from "../components/modals/TambahBarangModal";
import EditBarangModal from "../components/modals/EditBarangModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import "../assets/styles/stok.css";
import api, { getUser } from "../services/api";

export default function ManajemenStok() {
    const user      = getUser();
    const namaUsaha = user?.nama_usaha  || "Kios Saya";
    const stand     = user?.nomor_stand || "—";

    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");

    // ── FETCH ──
    useEffect(() => { fetchStok(); }, []);

    const fetchStok = async () => {
        setLoading(true);
        try {
            const res = await api.get("/stok");
            setItems(res.data || []);
        } catch { /* tetap tampilkan halaman */ }
        finally { setLoading(false); }
    };

    const filtered = items.filter(i =>
        i.nama.toLowerCase().includes(search.toLowerCase()) ||
        i.kategori?.toLowerCase().includes(search.toLowerCase())
    );

    // ── TAMBAH ──
    const [showModal,    setShowModal]    = useState(false);
    const [fotoFile,     setFotoFile]     = useState(null);
    const [fotoPreview,  setFotoPreview]  = useState(null);
    const [form, setForm] = useState({
        nama: "", stok: "", harga: "", kategori: "Makanan", satuan: "", deskripsi: "",
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleAdd = async () => {
        if (!form.nama || !form.stok || !form.harga) {
            alert("Nama, stok, dan harga wajib diisi!");
            return;
        }
        try {
            // 1. Simpan data barang
            const res = await api.post("/stok", {
                nama:      form.nama,
                stok:      Number(form.stok),
                harga:     Number(form.harga),
                kategori:  form.kategori,
                satuan:    form.satuan,
                deskripsi: form.deskripsi,
            });

            let newItem = res.data;

            // 2. Upload foto jika ada
            if (fotoFile instanceof File) {
                try {
                    const fd = new FormData();
                    fd.append("file", fotoFile);
                    const fotoRes = await api.postForm(`/stok/${newItem.id}/foto`, fd);
                    newItem = { ...newItem, foto_url: fotoRes.foto_url };
                } catch { /* foto gagal tidak batalkan barang */ }
            }

            setItems(prev => [newItem, ...prev]);
            setForm({ nama: "", stok: "", harga: "", kategori: "Makanan", satuan: "", deskripsi: "" });
            setFotoFile(null);
            setFotoPreview(null);
            setShowModal(false);
        } catch (err) {
            alert(err.message || "Gagal menambahkan barang");
        }
    };

    const handleCloseAdd = () => {
        setShowModal(false);
        setFotoFile(null);
        setFotoPreview(null);
        setForm({ nama: "", stok: "", harga: "", kategori: "Makanan", satuan: "", deskripsi: "" });
    };

    // ── EDIT ──
    const [editItem, setEditItem] = useState(null);

    const handleUpdate = async (updatedItem) => {
        try {
            // 1. Update data barang
            const res = await api.put(`/stok/${updatedItem.id}`, {
                nama:      updatedItem.nama,
                stok:      updatedItem.stok,
                harga:     updatedItem.harga,
                kategori:  updatedItem.kategori,
                satuan:    updatedItem.satuan,
                deskripsi: updatedItem.deskripsi,
            });

            let updated = res.data;

            // 2. Upload foto baru jika ada
            if (updatedItem.fotoFile instanceof File) {
                try {
                    const fd = new FormData();
                    fd.append("file", updatedItem.fotoFile);
                    const fotoRes = await api.postForm(`/stok/${updatedItem.id}/foto`, fd);
                    updated = { ...updated, foto_url: fotoRes.foto_url };
                } catch { /* foto gagal tidak batalkan update */ }
            } else if (updatedItem.fotoFile === "remove") {
                // User hapus foto — set null di DB
                try {
                    await api.patch(`/stok/${updatedItem.id}/foto-hapus`);
                    updated = { ...updated, foto_url: null };
                } catch { /* abaikan */ }
            }

            setItems(prev => prev.map(i => i.id === updatedItem.id ? updated : i));
            setEditItem(null);
        } catch (err) {
            alert(err.message || "Gagal mengupdate barang");
        }
    };

    // ── HAPUS ──
    const [deleteItem, setDeleteItem] = useState(null);

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/stok/${deleteItem.id}`);
            setItems(prev => prev.filter(i => i.id !== deleteItem.id));
            setDeleteItem(null);
        } catch (err) {
            alert(err.message || "Gagal menghapus barang");
        }
    };

    const kritisCount = items.filter(i => i.stok <= 5).length;

    return (
        <div>
            {/* TOPBAR */}
            <div className="ms-topbar">
                <div>
                    <div className="pg-eye"><Box size={15} />KIOS SAYA</div>
                    <div className="pg-title">Manajemen <em>Stok</em></div>
                    <div className="pg-sub">Produk yang dijual di Stand {stand} · {namaUsaha}</div>
                </div>
                <div className="ms-topbar-right">
                    <div className="ms-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Cari barang..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Tambah Barang
                    </button>
                </div>
            </div>

            {/* KIOS BANNER */}
            <div className="kios-banner">
                <div className="kios-banner-left">
                    <div className="kios-avatar"><Utensils size={20} /></div>
                    <div>
                        <div className="kios-banner-name">{namaUsaha}</div>
                        <div className="kios-banner-sub">Stand {stand} · Peken Banyumas 2026</div>
                    </div>
                </div>
                <div className="kios-banner-right">
                    <span className="kios-badge-active">● Kios Aktif</span>
                    {kritisCount > 0 && (
                        <span className="kios-badge-warn">
                            <AlertTriangle size={14} /> {kritisCount} stok kritis
                        </span>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="ms-card">
                {loading ? (
                    <p style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Memuat data stok...</p>
                ) : (
                    <StokTable
                        items={filtered}
                        onEdit={item => setEditItem(item)}
                        onDelete={item => setDeleteItem(item)}
                    />
                )}
            </div>

            {/* MODALS */}
            <TambahBarangModal
                show={showModal}
                onClose={handleCloseAdd}
                form={form}
                handleChange={handleChange}
                handleSubmit={handleAdd}
                fotoPreview={fotoPreview}
                onFotoChange={handleFotoChange}
            />

            <EditBarangModal
                show={!!editItem}
                item={editItem}
                onClose={() => setEditItem(null)}
                onSave={handleUpdate}
            />

            <ConfirmDeleteModal
                show={!!deleteItem}
                item={deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
