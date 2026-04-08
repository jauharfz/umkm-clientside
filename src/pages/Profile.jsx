import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmLogoutModal from "../components/modals/ConfirmLogoutModal";
import "../assets/styles/profile.css";
import api, { getUser, setUser } from "../services/api";

function normalizeProfile(payload, fallbackUser) {
  const stats = payload?.stats || {};
  const namaPemilik = payload?.nama_pemilik || fallbackUser?.nama_pemilik || "Pengguna";
  const namaUsaha = payload?.nama_usaha || fallbackUser?.nama_usaha || "Kios Saya";
  const stand = payload?.nomor_stand || fallbackUser?.nomor_stand || "—";
  const zona = payload?.zona || fallbackUser?.zona || "—";
  const kategori = payload?.kategori || fallbackUser?.kategori || "—";
  const statusPendaftaran = payload?.status_pendaftaran || fallbackUser?.status_pendaftaran || "pending";

  return {
    nama: namaPemilik,
    role: "Pemilik Kios",
    kios: namaUsaha,
    stand,
    zona,
    kategori,
    status: statusPendaftaran === "approved" ? "Aktif" : statusPendaftaran,
    inisial: namaPemilik
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U",
    stats: {
      produk: stats?.total_produk ?? 0,
      transaksi: stats?.total_transaksi ?? 0,
      rating: "—",
    },
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const cachedUser = useMemo(() => getUser(), []);
  const [user, setUserState] = useState(normalizeProfile(null, cachedUser));

  useEffect(() => {
    let mounted = true;

    api
      .get("/profil")
      .then((res) => {
        if (!mounted) return;
        const payload = res?.data ?? {};
        setUserState(normalizeProfile(payload, cachedUser));

        if (cachedUser) {
          setUser({
            ...cachedUser,
            nama_pemilik: payload?.nama_pemilik || cachedUser.nama_pemilik,
            nama_usaha: payload?.nama_usaha || cachedUser.nama_usaha,
            alamat: payload?.alamat || cachedUser.alamat,
            kategori: payload?.kategori || cachedUser.kategori,
            deskripsi: payload?.deskripsi || cachedUser.deskripsi,
            nomor_stand: payload?.nomor_stand || cachedUser.nomor_stand,
            zona: payload?.zona || cachedUser.zona,
            status_pendaftaran: payload?.status_pendaftaran || cachedUser.status_pendaftaran,
          });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setUserState(normalizeProfile(null, cachedUser));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [cachedUser]);

  if (loading && !user) {
    return <p style={{ padding: 32, color: "#9ca3af" }}>Memuat profil...</p>;
  }

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
        <button className="pf-btn-settings" onClick={() => navigate("/dashboard/pengaturan")}>⚙️ Pengaturan Akun</button>
        <button className="pf-btn-logout" onClick={() => setShowLogout(true)}>🚪 Logout</button>
      </div>

      <ConfirmLogoutModal show={showLogout} onClose={() => setShowLogout(false)} userName={user.nama} />
    </div>
  );
}
