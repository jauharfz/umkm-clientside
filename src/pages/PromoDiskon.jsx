import { useState, useEffect } from "react";
import PromoCard from "../components/PromoDiskon/PromoCard";
import TambahPromoModal from "../components/modals/TambahPromoModal";
import EditPromoModal from "../components/modals/EditPromoModal";
import ConfirmDeletePromoModal from "../components/modals/ConfirmDeletePromoModal";
import PromoToast from "../components/PromoDiskon/PromoToast";
import "../assets/styles/promo.css";
import api from "../services/api";

export default function PromoDiskon() {
  const [promos, setPromos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toasts, setToasts]       = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // ── FETCH ──
  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/promo");
      setPromos(res.data || []);
    } catch {
      addToast("⚠️ Gagal memuat data promo", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ── TAMBAH ──
  const handleAdd = async (data) => {
    try {
      // FIX: backend menggunakan Form() — selalu multipart/form-data
      const fd = new FormData();
      fd.append("nama",  data.nama);
      fd.append("tipe",  data.tipe);
      fd.append("nilai", data.nilai);
      fd.append("mulai", data.mulai);
      fd.append("akhir", data.akhir);
      if (data.file_poster instanceof File) {
        fd.append("file_poster", data.file_poster);
      }
      const res = await api.postForm("/promo", fd);
      setPromos([res.data, ...promos]);
      setShowModal(false);
      addToast("✅ Promo berhasil ditambahkan!");
    } catch (err) {
      addToast(err.message || "Gagal menambahkan promo", "danger");
    }
  };

  // ── EDIT ──
  const handleUpdate = async (data) => {
    try {
      // FIX: backend menggunakan PUT (bukan PATCH) + multipart/form-data
      const fd = new FormData();
      if (data.nama  !== undefined) fd.append("nama",   data.nama);
      if (data.tipe  !== undefined) fd.append("tipe",   data.tipe);
      if (data.nilai !== undefined) fd.append("nilai",  data.nilai);
      if (data.mulai !== undefined) fd.append("mulai",  data.mulai);
      if (data.akhir !== undefined) fd.append("akhir",  data.akhir);
      if (data.status !== undefined) fd.append("status", data.status);
      if (data.file_poster instanceof File) {
        fd.append("file_poster", data.file_poster);
      }
      const res = await api.putForm(`/promo/${data.id}`, fd);
      setPromos(promos.map((p) => (p.id === data.id ? res.data : p)));
      setEditItem(null);
      addToast("✏️ Promo berhasil diperbarui!");
    } catch (err) {
      addToast(err.message || "Gagal mengupdate promo", "danger");
    }
  };

  // ── HAPUS ──
  const handleDelete = async () => {
    try {
      await api.delete(`/promo/${deleteItem.id}`);
      setPromos(promos.filter((p) => p.id !== deleteItem.id));
      setDeleteItem(null);
      addToast("🗑️ Promo berhasil dihapus!", "danger");
    } catch (err) {
      addToast(err.message || "Gagal menghapus promo", "danger");
    }
  };

  const activeCount = promos.filter((p) => p.status === "aktif").length;

  return (
    <div className="pd-page">
      {/* TOPBAR */}
      <div className="pd-topbar">
        <div>
          <div className="pd-eyebrow">🏷️ Kios Saya</div>
          <div className="pd-title">
            Promo <em>&amp; Diskon</em>
          </div>
          <div className="pd-subtitle">Promo yang berlaku untuk kios Anda</div>
        </div>
        <button className="pd-btn-primary" onClick={() => setShowModal(true)}>
          + Tambah Promo
        </button>
      </div>

      {/* INFO BANNER */}
      <div className="pd-info-banner">
        <div className="pd-info-left">
          <div className="pd-info-icon">🥢</div>
          <div>
            <strong>Kios Saya</strong>
            <div className="pd-info-sub">Promo hanya berlaku untuk kios ini</div>
          </div>
        </div>
        <div className="pd-pill-green">{activeCount} Promo Aktif</div>
      </div>

      {/* CARDS */}
      {loading ? (
        <p style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Memuat promo...</p>
      ) : promos.length === 0 ? (
        <div className="pd-empty">
          <div className="pd-empty-icon">🎉</div>
          <p>Belum ada promo. Yuk tambah promo pertamamu!</p>
        </div>
      ) : (
        <div className="pd-card-grid">
          {promos.map((item) => (
            <PromoCard
              key={item.id}
              item={item}
              onEdit={setEditItem}
              onDelete={setDeleteItem}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <TambahPromoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAdd}
        onToast={addToast}
      />
      <EditPromoModal
        show={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleUpdate}
        onToast={addToast}
      />
      <ConfirmDeletePromoModal
        show={!!deleteItem}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />

      {/* TOAST STACK */}
      <div className="pd-toast-stack">
        {toasts.map((t) => (
          <PromoToast key={t.id} message={t.message} type={t.type} />
        ))}
      </div>
    </div>
  );
}
