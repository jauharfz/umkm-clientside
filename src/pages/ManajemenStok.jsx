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
  const user = getUser();
  const namaUsaha = user?.nama_usaha  || "Kios Saya";
  const stand     = user?.nomor_stand || "—";

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  // ── FETCH ──
  useEffect(() => {
    fetchStok();
  }, []);

  const fetchStok = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stok");
      setItems(res.data || []);
    } catch {
      // Tetap tampilkan halaman meski gagal load
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  // ── TAMBAH ──
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nama: "", stok: "", harga: "", kategori: "Makanan", satuan: "", deskripsi: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.nama || !form.stok || !form.harga) {
      alert("Nama, stok, dan harga wajib diisi!");
      return;
    }
    try {
      const res = await api.post("/stok", {
        nama:      form.nama,
        stok:      Number(form.stok),
        harga:     Number(form.harga),
        kategori:  form.kategori,
        satuan:    form.satuan,
        deskripsi: form.deskripsi,
      });
      setItems([...items, res.data]);
      setForm({ nama: "", stok: "", harga: "", kategori: "Makanan", satuan: "", deskripsi: "" });
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Gagal menambahkan barang");
    }
  };

  // ── EDIT ──
  const [editItem, setEditItem] = useState(null);

  const handleUpdate = async (updatedItem) => {
    try {
      const res = await api.patch(`/stok/${updatedItem.id}`, {
        nama:      updatedItem.nama,
        stok:      updatedItem.stok,
        harga:     updatedItem.harga,
        kategori:  updatedItem.kategori,
        satuan:    updatedItem.satuan,
        deskripsi: updatedItem.deskripsi,
      });
      setItems(items.map((item) => (item.id === updatedItem.id ? res.data : item)));
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
      setItems(items.filter((item) => item.id !== deleteItem.id));
      setDeleteItem(null);
    } catch (err) {
      alert(err.message || "Gagal menghapus barang");
    }
  };

  const kritisCount = items.filter((i) => i.stok <= 5).length;

  return (
    <div>
      {/* TOPBAR */}
      <div className="ms-topbar">
        <div>
          <div className="pg-eye">
            <Box size={15} />KIOS SAYA</div>
          <div className="pg-title">
            Manajemen <em>Stok</em>
          </div>
          <div className="pg-sub">
            Produk yang dijual di Stand {stand} · {namaUsaha}
          </div>
        </div>

        <div className="ms-topbar-right">
          <div className="ms-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <AlertTriangle size={14} />
              {kritisCount} stok kritis
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
            items={filteredItems}
            onEdit={(item) => setEditItem(item)}
            onDelete={(item) => setDeleteItem(item)}
          />
        )}
      </div>

      {/* MODALS */}
      <TambahBarangModal
        show={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        handleChange={handleChange}
        handleSubmit={handleAdd}
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
