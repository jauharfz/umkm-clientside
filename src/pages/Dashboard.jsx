// Dashboard.jsx — UMKM Dashboard
// Event banner: cd-boxes style — 3 boxes HARI/JAM/MENIT, updates every minute
// StatCard: .stat pattern matching uploaded reference
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Banknote, AlertTriangle, ShoppingBasket,
  AlertOctagon, Box, Tags, FileText, Package
} from "lucide-react";
import "../assets/styles/dashboard.css";
import api, { getUser } from "../services/api";
import { getNotifs } from "../lib/notifications";

// ── Countdown: HARI · JAM · MENIT (real-time, updates every minute) ────────────
function useEventCountdown(tanggal, jamMulai) {
  const [time, setTime] = useState({ d:"00", j:"00", m:"00" });
  const [selesai, setSelesai] = useState(false);

  useEffect(() => {
    if (!tanggal) return;
    // Default event start: 08:00 WIB if only a date string is given
    const target = tanggal
      ? new Date(`${tanggal}T${jamMulai || '08:00'}:00+07:00`)
      : null;

    function tick() {
      const diff = target - new Date();
      if (diff <= 0) {
        setTime({ d:"00", j:"00", m:"00" });
        setSelesai(true);
        return;
      }
      setSelesai(false);
      setTime({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        j: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
      });
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [tanggal]);

  return { time, selesai };
}

function Countdown({ eventTanggal, jamMulai }) {
  const { time, selesai } = useEventCountdown(eventTanggal, jamMulai);

  if (!eventTanggal) {
    return (
      <div className="cd-boxes">
        {[["—","HARI"],["—","JAM"],["—","MENIT"]].map(([v,u]) => (
          <div className="cd-box" key={u}>
            <div className="cd-num">{v}</div>
            <div className="cd-unit">{u}</div>
          </div>
        ))}
      </div>
    );
  }
  if (selesai) {
    return (
      <div className="cd-boxes">
        <div className="cd-box" style={{gridColumn:"span 3", width:"auto", padding:"10px 20px"}}>
          <div className="cd-num" style={{fontSize:14}}>✓ Acara Selesai</div>
        </div>
      </div>
    );
  }
  return (
    <div className="cd-boxes">
      {[["d","HARI"],["j","JAM"],["m","MENIT"]].map(([k,u]) => (
        <div className="cd-box" key={k}>
          <div className="cd-num">{time[k]}</div>
          <div className="cd-unit">{u}</div>
        </div>
      ))}
    </div>
  );
}

// StatCard — matches .stat / .stat-icon / .stat-lbl / .stat-val pattern
function StatCard({ icon, label, value, unit, badge, badgeType }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div className="stat-lbl">{label}</div>
      <div className="stat-val">
        {value ?? "—"}
        {unit && <sup className="stat-unit">{unit}</sup>}
      </div>
      {badge && (
        <span className={`stat-badge ${badgeType === "warn" ? "warn" : badgeType === "green" ? "green" : ""}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();

  const [stats,       setStats]      = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [notifCount,  setNotifCount]  = useState(0);

  useEffect(() => {
    const DEMO = {
      stats: { omset_hari_ini: 1250000, jumlah_transaksi: 8, stok_kritis: 2, total_produk: 12 },
      chart_penjualan: [
        { label:"Sen", pendapatan:820000,  jumlah_transaksi:5  },
        { label:"Sel", pendapatan:1040000, jumlah_transaksi:7  },
        { label:"Rab", pendapatan:680000,  jumlah_transaksi:4  },
        { label:"Kam", pendapatan:1450000, jumlah_transaksi:9  },
        { label:"Jum", pendapatan:970000,  jumlah_transaksi:6  },
        { label:"Sab", pendapatan:1890000, jumlah_transaksi:12 },
        { label:"Min", pendapatan:1250000, jumlah_transaksi:8  },
      ],
      transaksi_terakhir: [
        { id:"tx1", customer:"Ani Susanti",  item:"Batik Motif Sekar", total:185000, time: new Date().toISOString()               },
        { id:"tx2", customer:"Budi Santoso", item:"Keripik Tempe",     total:45000,  time: new Date(Date.now()-600000).toISOString()  },
        { id:"tx3", customer:"Citra Dewi",   item:"Kain Lurik 2m",     total:320000, time: new Date(Date.now()-1800000).toISOString() },
      ],
    };

    api.get("/dashboard")
      .then(res => setStats(res.data || DEMO))
      .catch(() => setStats(DEMO))
      .finally(() => setLoading(false));

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    fetch(`${apiUrl}/public/event`)
      .then(r => r.json())
      .then(res => { if (res?.data) setActiveEvent(res.data); })
      .catch(() => {
        setActiveEvent({
          nama_event: "Festival Budaya Banyumasan 2025",
          lokasi:     "Alun-Alun Purwokerto",
          tanggal:    "2025-05-17",
          jam_mulai:  "08:00",
          jam_selesai:"22:00",
        });
      });

    const refreshNotif = () =>
      setNotifCount(getNotifs("umkm").filter(n => !n.read).length);
    refreshNotif();
    window.addEventListener("pekan_notif_update", refreshNotif);
    return () => window.removeEventListener("pekan_notif_update", refreshNotif);
  }, []);

  const namaDepan = user?.nama_pemilik?.split(" ")[0] || "Pengguna";
  const namaUsaha = user?.nama_usaha   || "Kios Saya";
  const stand     = user?.nomor_stand  || "—";
  const zona      = user?.zona         || "—";

  const chartData   = stats?.chart_penjualan    || [];
  const trxData     = stats?.transaksi_terakhir || [];
  const kritisCount = stats?.stats?.stok_kritis  ?? stats?.stok_kritis  ?? 0;
  const totalProduk = stats?.stats?.total_produk ?? stats?.total_produk ?? "—";
  const omsetHariIni = stats?.stats?.omset_hari_ini ?? stats?.omset_hari_ini;
  const jmlTrx      = stats?.stats?.jumlah_transaksi ?? stats?.jumlah_transaksi;

  const komisiPersen   = user?.komisi_persen || 15;
  const komisiHariIni  = omsetHariIni ? Math.round(omsetHariIni * komisiPersen / 100) : null;
  const diterimaHariIni = omsetHariIni ? omsetHariIni - komisiHariIni : null;

  const mx = chartData.length
    ? Math.max(...chartData.map(d => d.pendapatan || 0)) || 1
    : 1;

  // Today string for topbar sub
  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="dashboard">

      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div>
          <div className="pg-eye">SELAMAT DATANG</div>
          <div className="pg-title">Halo, <em>{namaDepan}</em></div>
          <div className="pg-sub">{namaUsaha} · Stand {stand}</div>
        </div>
        <div className="topbar-actions">
          <button className="btn-bell" onClick={() => navigate("/dashboard/notifikasi")}
            title="Notifikasi" style={{ position: "relative" }}>
            <Bell size={18} />
            {notifCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, width: 16, height: 16,
                borderRadius: "50%", background: "#c48930", color: "#fff",
                fontSize: 9, fontWeight: 700, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard/stok")}>
            ＋ Tambah Barang
          </button>
        </div>
      </div>

      {/* ── COUNTDOWN BANNER — cd-boxes style ── */}
      <div className="cd-banner">
        <div>
          <div className="cd-lbl">Acara Dimulai Dalam</div>
          <div className="cd-title">{activeEvent?.nama_event || "Peken Banyumas"}</div>
          <div className="cd-sub">
            Stand {stand} · Zona {zona} · {activeEvent?.lokasi || "Masuk Gratis"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Countdown eventTanggal={activeEvent?.tanggal} jamMulai={activeEvent?.jam_mulai} />
          <button
            onClick={() => navigate("/dashboard/event")}
            style={{
              fontSize: 11, color: "rgba(255,255,255,.7)", background: "none",
              border: "none", cursor: "pointer", fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            Kelola Event →
          </button>
        </div>
      </div>

      {/* ── ALERT stok kritis ── */}
      {kritisCount > 0 && (
        <div className="alert" onClick={() => navigate("/dashboard/stok")}>
          <span className="alert-icon"><AlertTriangle size={18} /></span>
          <div>
            <div className="alert-title">{kritisCount} barang stok hampir habis</div>
            <div className="alert-sub">Segera update stok sebelum acara dimulai → klik untuk kelola</div>
          </div>
          <span className="alert-arrow" />
        </div>
      )}

      {/* ── 4 STAT CARDS — .stat pattern ── */}
      {loading ? (
        <div className="stats" style={{ padding: "24px 0" }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="stat" style={{ opacity: .4 }}>
              <div className="stat-lbl">Memuat...</div>
              <div className="stat-val">—</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stats">
          <StatCard
            icon={<Package size={20} className="icon-stats" />}
            label="Total Produk Kios"
            value={totalProduk}
            unit="item"
            badge="Produk aktif"
            badgeType="green"
          />
          <StatCard
            icon={<Banknote size={20} className="icon-stats" />}
            label="Omset Hari Ini"
            value={omsetHariIni ? `Rp ${(omsetHariIni / 1000).toFixed(0)}` : "—"}
            unit={omsetHariIni ? "rb" : null}
            badge={omsetHariIni ? "▲ hari ini" : undefined}
            badgeType="green"
          />
          <StatCard
            icon={<ShoppingBasket size={20} className="icon-stats" />}
            label="Transaksi Hari Ini"
            value={jmlTrx ?? "—"}
            unit={jmlTrx ? "trx" : null}
            badge={jmlTrx ? `${jmlTrx} transaksi` : undefined}
            badgeType="green"
          />
          <StatCard
            icon={<AlertOctagon size={20} className="icon-stats" />}
            label="Stok Kritis"
            value={kritisCount}
            unit="item"
            badge={kritisCount > 0 ? "Perlu restok" : "Aman"}
            badgeType={kritisCount > 0 ? "warn" : "green"}
          />
        </div>
      )}

      {/* ── REVENUE BAR ── */}
      {omsetHariIni != null && (
        <div className="rev-bar" onClick={() => navigate("/dashboard/riwayat")}>
          <div>
            <p className="rev-bar-title">💰 Revenue Hari Ini</p>
            <div className="rev-bar-items">
              <span className="rev-bar-item">Omset: <b>Rp {omsetHariIni.toLocaleString("id-ID")}</b></span>
              <span className="rev-bar-item">Komisi ({komisiPersen}%): <b className="neg">−Rp {(komisiHariIni||0).toLocaleString("id-ID")}</b></span>
              <span className="rev-bar-item">Kamu Terima: <b className="pos">Rp {(diterimaHariIni||0).toLocaleString("id-ID")}</b></span>
            </div>
          </div>
          <span className="rev-bar-arrow">›</span>
        </div>
      )}

      {/* ── MID GRID: chart + aksi cepat ── */}
      <div className="mid-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Penjualan Minggu Ini</h3>
              <p className="card-sub">{namaUsaha} · Stand {stand}</p>
            </div>
            <span className="link" onClick={() => navigate("/dashboard/riwayat")}>Riwayat →</span>
          </div>
          {chartData.length > 0 ? (
            <>
              <div className="chart-wrap">
                {chartData.map((d, i) => (
                  <div className="bc" key={i}>
                    <div className="bars">
                      <div className="bar omzet" style={{ height: `${(d.pendapatan / mx) * 100}%` }} />
                      <div className="bar trx"   style={{ height: `${((d.jumlah_transaksi||0) / mx) * 100}%` }} />
                    </div>
                    <span>{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="legend">
                <div><span className="dot g" /> Pendapatan</div>
                <div><span className="dot w" /> Jml Transaksi</div>
              </div>
            </>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13, padding: "16px 0" }}>
              Belum ada data penjualan minggu ini.
            </p>
          )}
        </div>

        <div className="card">
          <h3>Aksi Cepat</h3>
          <button className="quick-btn primary" onClick={() => navigate("/dashboard/stok")}>
            <Box size={18} /> Tambah Barang ke Stok
          </button>
          <button className="quick-btn secondary" onClick={() => navigate("/dashboard/promo")}>
            <Tags size={18} /> Buat Promo Baru
          </button>
          <button className="quick-btn ghost" onClick={() => navigate("/dashboard/kasir")}>
            <ShoppingBasket size={18} /> Buka Kasir
          </button>
          <button className="quick-btn ghost" onClick={() => navigate("/dashboard/riwayat")}>
            <FileText size={18} /> Riwayat Transaksi
          </button>
        </div>
      </div>

      {/* ── TRANSAKSI TERAKHIR ── */}
      {trxData.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Transaksi Terakhir</h3>
              <p className="card-sub">Dari kios kamu hari ini</p>
            </div>
            <span className="link" onClick={() => navigate("/dashboard/riwayat")}>Semua →</span>
          </div>
          {trxData.slice(0, 5).map(t => (
            <div key={t.id} className="trx" onClick={() => navigate("/dashboard/riwayat")}>
              <span className="trx-dot" />
              <div className="trx-info">
                <span className="trx-name">{t.customer || "Pelanggan"} · {t.item || "—"}</span>
                <span className="trx-time">
                  {t.time
                    ? new Date(t.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
              </div>
              <span className="trx-total">Rp {(t.total || 0).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
