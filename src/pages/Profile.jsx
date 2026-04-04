import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmLogoutModal from "../components/modals/ConfirmLogoutModal";
import "../assets/styles/profile.css";
import api, { getUser } from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser]   = useState(getUser()); // tampilkan cached dulu
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/profil")
      .then(res => {
        const data = res.data || res;
        setUser({
          nama:     data.nama_pemilik || data.nama,
          role:     "Pemilik Kios",
          kios:     data.nama_usaha,
          stand:    data.nomor_stand,
          zona:     data.zona,
          kategori: data.kategori,
          status:   data.status_pendaftaran === "approved" ? "Aktif" : data.status_pendaftaran,
          inisial:  (data.nama_pemilik || data.nama || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          stats:    {
            produk:     data.total_produk    ?? 0,
            transaksi:  data.total_transaksi ?? 0,
            rating:     data.rating          ?? "—",
          },
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <p style={{ padding: 32, color: "#9ca3af" }}>Memuat profil...</p>;

  return (
    <div className="pf-page">
      <div className="pf-header">
        <div className="pf-eyebrow">👤 Akun</div>
        <div className="pf-title">
          Profile <em>Saya</em>
        </div>
      </div>

      <div className="pf-card">
        <div className="pf-avatar">{user.inisial}</div>
        <div className="pf-name">{user.nama}</div>
        <div className="pf-role">
          {user.role} · {user.kios} · Stand {user.stand}
        </div>

        <div className="pf-stats">
          <div className="pf-stat">
            <span className="pf-stat-num">{user.stats?.produk ?? "—"}</span>
            <span className="pf-stat-label">Total Produk</span>
          </div>
          <div className="pf-stat-divider" />
          <div className="pf-stat">
            <span className="pf-stat-num">{user.stats?.transaksi ?? "—"}</span>
            <span className="pf-stat-label">Transaksi</span>
          </div>
          <div className="pf-stat-divider" />
          <div className="pf-stat">
            <span className="pf-stat-num">{user.stats?.rating ?? "—"}</span>
            <span className="pf-stat-label">Rating</span>
          </div>
        </div>
      </div>

      <div className="pf-info-card">
        <div className="pf-info-title">Info Kios</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">NAMA KIOS</span>
            <span className="pf-info-value">{user.kios}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">NO. STAND</span>
            <span className="pf-info-value">{user.stand} · {user.zona}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">KATEGORI</span>
            <span className="pf-info-value">🪣 {user.kategori}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">STATUS</span>
            <span className="pf-status-pill">● {user.status}</span>
          </div>
        </div>
      </div>

      <div className="pf-actions">
        <button className="pf-btn-settings" onClick={() => navigate("/pengaturan")}>
          ⚙️ Pengaturan Akun
        </button>
        <button className="pf-btn-logout" onClick={() => setShowLogout(true)}>
          🚪 Logout
        </button>
      </div>

      <ConfirmLogoutModal
        show={showLogout}
        onClose={() => setShowLogout(false)}
        userName={user.nama}
      />
    </div>
  );
}
