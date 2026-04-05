import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, X, Package, ShoppingCart, AlertTriangle, Info, ChevronRight, Calendar, Clock, Tag } from "lucide-react";
import "../assets/styles/notifikasi.css";
import api from "../services/api";

// ── TYPE CONFIG ─────────────────────────────────────────────
const TYPE_META = {
  stok:      { label: "Stok",       color: "#f97316", bg: "#fff7ed", icon: <Package size={16} /> },
  transaksi: { label: "Transaksi",  color: "#2f6f4e", bg: "#eef5ef", icon: <ShoppingCart size={16} /> },
  promo:     { label: "Promo",      color: "#7c3aed", bg: "#f5f3ff", icon: <Tag size={16} /> },
  info:      { label: "Info",       color: "#0ea5e9", bg: "#f0f9ff", icon: <Info size={16} /> },
};

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "belum", label: "Belum Dibaca" },
  { key: "sudah", label: "Sudah Dibaca" },
];

function NotifAvatar({ type }) {
  const meta = TYPE_META[type] || TYPE_META.info;
  return (
    <div className="notif-avatar" style={{ background: meta.bg, color: meta.color }}>
      {type === "stok"      && <AlertTriangle size={20} />}
      {type === "transaksi" && <ShoppingCart size={20} />}
      {type === "promo"     && <Tag size={20} />}
      {type === "info"      && <Info size={20} />}
      {!TYPE_META[type]     && <Info size={20} />}
    </div>
  );
}

function DetailModal({ notif, onClose }) {
  if (!notif) return null;
  const meta = TYPE_META[notif.type] || TYPE_META.info;
  const rows = notif.detail ? Object.entries(notif.detail) : [];

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nm-header">
          <div className="nm-title-row">
            <NotifAvatar type={notif.type} />
            <h3 className="nm-title">{notif.title}</h3>
          </div>
          <button className="nm-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="nm-time-box">
          <div className="nm-time-left">
            <p className="nm-time-label">Waktu Notifikasi</p>
            <p className="nm-time-val">
              <Calendar size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              {notif.time || notif.created_at}
            </p>
          </div>
          <span className="nm-type-badge" style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </span>
        </div>

        {rows.length > 0 && (
          <div className="nm-detail-box">
            <p className="nm-detail-title">
              <Info size={14} style={{ marginRight: 6 }} />
              Detail Informasi
            </p>
            {rows.map(([k, v]) => (
              <div className="nm-row" key={k}>
                <span className="nm-key">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                <span className="nm-val">{v}</span>
              </div>
            ))}
          </div>
        )}

        {!rows.length && notif.desc && (
          <div className="nm-detail-box">
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7 }}>{notif.desc}</p>
          </div>
        )}

        <div className="nm-footer">
          <button className="nm-btn-tutup" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────
export default function Notifikasi() {
  const navigate  = useNavigate();
  const [filter, setFilter]   = useState("semua");
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/notifikasi")
      .then(res => setNotifs(res.data?.notifikasi || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifs.filter((n) => !n.read && !n.is_read).length;

  const filtered = notifs.filter((n) => {
    const isRead = n.read || n.is_read;
    if (filter === "belum") return !isRead;
    if (filter === "sudah") return isRead;
    return true;
  });

  const markAllRead = async () => {
    try {
      await api.patch("/notifikasi/baca-semua", {});
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
    } catch {
      // Silent fail — tetap tandai di state lokal
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
    }
  };

  const handleClick = async (notif) => {
    const isRead = notif.read || notif.is_read;
    if (!isRead) {
      try {
        await api.patch(`/notifikasi/${notif.id}/baca`, {});
      } catch {}
      setNotifs((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true, is_read: true } : n))
      );
    }
    setSelected(notif);
  };

  return (
    <div className="notif-page">
      {/* TOP BAR */}
      <div className="notif-topbar">
        <div className="notif-topbar-left">
          <h1 className="notif-page-title">Notifikasi</h1>
        </div>
        <div className="notif-topbar-right">
          <span className="notif-date">
            <Clock size={13} style={{ marginRight: 5 }} />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <div className="notif-bell-wrap">
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="notif-content">

        <div className="notif-section-header">
          <div>
            <h2 className="notif-section-title">
              <Bell size={20} style={{ marginRight: 10, color: "#f97316" }} />
              Notifikasi
            </h2>
            <p className="notif-section-sub">Semua pemberitahuan aktivitas akun & kios Anda</p>
          </div>
          {unreadCount > 0 && (
            <button className="notif-btn-markall" onClick={markAllRead}>
              <CheckCheck size={15} style={{ marginRight: 6 }} />
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* FILTER PILLS */}
        <div className="notif-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`notif-pill ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === "belum" && unreadCount > 0 && (
                <span className="notif-pill-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="notif-list">
          {loading ? (
            <p style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Memuat notifikasi...</p>
          ) : filtered.length === 0 ? (
            <div className="notif-empty">
              <Bell size={36} style={{ color: "#d1d5db", marginBottom: 10 }} />
              <p>Tidak ada notifikasi</p>
            </div>
          ) : (
            filtered.map((n) => {
              const isRead = n.read || n.is_read;
              const meta   = TYPE_META[n.type] || TYPE_META.info;
              return (
                <div
                  key={n.id}
                  className={`notif-item ${!isRead ? "unread" : ""}`}
                  onClick={() => handleClick(n)}
                >
                  <NotifAvatar type={n.type} />
                  <div className="notif-item-body">
                    <div className="notif-item-top">
                      <span className="notif-item-title">{n.title}</span>
                      <div className="notif-item-meta">
                        {!isRead && <span className="notif-dot" />}
                        <span className="notif-item-time">{n.time || n.created_at}</span>
                      </div>
                    </div>
                    <p className="notif-item-desc">{n.desc || n.description}</p>
                    <span
                      className="notif-type-chip"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  <ChevronRight size={16} className="notif-chevron" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <DetailModal notif={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
