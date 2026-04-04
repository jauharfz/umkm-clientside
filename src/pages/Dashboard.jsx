import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, Banknote, AlertTriangle, ChevronRight, ShoppingBasket, AlertOctagon, Box, Book, Tags, FileText } from "lucide-react";
import "../assets/styles/dashboard.css";
import api, { getUser } from "../services/api";

// ── COUNTDOWN ───────────────────────────────────────────
function Countdown() {
  const [time, setTime] = useState({ d: "00", j: "00", m: "00" });

  useEffect(() => {
    function tick() {
      const diff = new Date("2026-03-22T08:00:00+07:00") - new Date();
      if (diff <= 0) return;
      setTime({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        j: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
      });
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="cd-boxes">
      {[["d", "HARI"], ["j", "JAM"], ["m", "MENIT"]].map(([k, u]) => (
        <div className="cd-box" key={k}>
          <div className="cd-num">{time[k]}</div>
          <div className="cd-unit">{u}</div>
        </div>
      ))}
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────
function StatCard({ icon, label, value, unit, badge, badgeType }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div className="stat-lbl">{label}</div>
      <div className="stat-val">
        {value}
        {unit && <sup className="stat-unit">{unit}</sup>}
      </div>
      {badge && <span className={`stat-badge ${badgeType}`}>{badge}</span>}
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();

  const [stats,    setStats]   = useState(null);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const namaDepan   = user?.nama_pemilik?.split(" ")[0] || "Pengguna";
  const namaUsaha   = user?.nama_usaha   || "Kios Saya";
  const stand       = user?.nomor_stand  || "—";
  const zona        = user?.zona         || "—";

  const chartData   = stats?.chart_mingguan   || [];
  const stokData    = stats?.stok_ringkasan   || [];
  const trxData     = stats?.transaksi_terakhir || [];
  const kritisCount = stats?.stok_kritis      ?? 0;

  const mx = chartData.length ? Math.max(...chartData.map(d => d.g || 0)) || 1 : 1;

  return (
    <div className="dashboard">

      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div>
          <div className="pg-eye">SELAMAT DATANG</div>
          <div className="pg-title">Halo, <em>{namaDepan}</em></div>
          <div className="pg-sub">{namaUsaha} · {stand}</div>
        </div>

        <div className="topbar-actions">
          <button
            className="btn-bell"
            onClick={() => navigate("/notifikasi")}
            title="Notifikasi"
          >
            <Bell size={18} />
          </button>

          <button className="btn btn-primary" onClick={() => navigate("/stok")}>
            ＋ Tambah Barang
          </button>
        </div>
      </div>

      {/* ── COUNTDOWN BANNER ── */}
      <div className="cd-banner">
        <div>
          <div className="cd-lbl">Acara Dimulai Dalam</div>
          <div className="cd-title">Peken Banyumas 2026</div>
          <div className="cd-sub">{stand} · Zona {zona} · Masuk Gratis</div>
        </div>
        <Countdown />
      </div>

      {/* ── ALERT stok kritis ── */}
      {kritisCount > 0 && (
        <div className="alert" onClick={() => navigate("/stok")}>
          <span className="alert-icon">
            <AlertTriangle size={18} />
          </span>
          <div>
            <div className="alert-title">{kritisCount} barang stok hampir habis</div>
            <div className="alert-sub">Segera update stok sebelum acara dimulai → klik untuk kelola</div>
          </div>
          <span className="alert-arrow"></span>
        </div>
      )}

      {/* ── STATS ── */}
      {loading ? (
        <div className="stats" style={{ justifyContent: "center", padding: "24px 0" }}>
          <p style={{ color: "#9ca3af" }}>Memuat statistik...</p>
        </div>
      ) : (
        <div className="stats">
          <StatCard
            icon={<Package size={20} className="icon-stats"/>}
            label="Total Produk Kios"
            value={stats?.total_produk ?? "—"}
            unit="item"
            badge={stats?.produk_baru ? `▲ +${stats.produk_baru} item baru` : null}
            badgeType="green"
          />
          <StatCard
            icon={<Banknote size={20} className="icon-stats"/>}
            label="Omset Hari Ini"
            value={stats?.omset_hari_ini ? `Rp ${(stats.omset_hari_ini / 1000).toFixed(0)}` : "—"}
            unit={stats?.omset_hari_ini ? "rb" : null}
            badge={stats?.omset_hari_ini ? "▲ dari kemarin" : null}
            badgeType="green"
          />
          <StatCard
            icon={<ShoppingBasket size={20} className="icon-stats"/>}
            label="Transaksi Hari Ini"
            value={stats?.transaksi_hari_ini ?? "—"}
            unit="trx"
            badge={stats?.transaksi_hari_ini ? "▲ +3 dari kemarin" : null}
            badgeType="green"
          />
          <StatCard
            icon={<AlertOctagon size={20} className="icon-stats"/>}
            label="Stok Kritis"
            value={kritisCount}
            unit="item"
            badge={kritisCount > 0 ? "Perlu restok" : "Aman"}
            badgeType={kritisCount > 0 ? "warn" : "green"}
          />
        </div>
      )}

      {/* ── MID GRID ── */}
      <div className="mid-grid">

        {/* CHART */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Penjualan Minggu Ini</h3>
              <p className="card-sub">{namaUsaha} · {stand}</p>
            </div>
            <span className="link" onClick={() => navigate("/riwayat")}>Riwayat →</span>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="chart-wrap">
                {chartData.map((d, i) => (
                  <div className="bc" key={i}>
                    <div className="bars">
                      <div className="bar omzet" style={{ height: `${(d.g / mx) * 100}%` }} />
                      <div className="bar trx"   style={{ height: `${((d.w || 0) / mx) * 100}%` }} />
                    </div>
                    <span>{d.l}</span>
                  </div>
                ))}
              </div>
              <div className="legend">
                <div><span className="dot g" /> Pendapatan</div>
                <div><span className="dot w" /> Jml Transaksi</div>
              </div>
            </>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13, padding: "16px 0" }}>Belum ada data penjualan minggu ini.</p>
          )}
        </div>

        {/* AKSI CEPAT */}
        <div className="card">
          <h3>Aksi Cepat</h3>
          <button className="quick-btn primary" onClick={() => navigate("/stok")}>
            <Box size={18}/> Tambah Barang ke Stok
          </button>
          <button className="quick-btn secondary" onClick={() => navigate("/promo")}>
            <Tags size={18}/>Buat Promo Baru
          </button>
          <button className="quick-btn ghost" onClick={() => navigate("/riwayat")}>
            <FileText size={18}/>Lihat Riwayat Transaksi
          </button>
          <button className="quick-btn ghost" onClick={() => navigate("/kas")}>
            <Book size={18}/>Buku Kas Saya
          </button>
        </div>
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="bot-grid">

        {/* TRANSAKSI TERAKHIR */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Transaksi Terakhir</h3>
              <p className="card-sub">Dari kios kamu hari ini</p>
            </div>
            <span className="link" onClick={() => navigate("/riwayat")}>Semua →</span>
          </div>

          {trxData.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 13, padding: "8px 0" }}>Belum ada transaksi hari ini.</p>
          ) : trxData.map((t) => (
            <div key={t.id} className="trx" onClick={() => navigate("/riwayat")}>
              <span className="trx-dot" />
              <div className="trx-info">
                <span className="trx-name">{t.pelanggan} · {t.barang}</span>
                <span className="trx-time">{t.waktu}</span>
              </div>
              <span className="trx-total">{t.total}</span>
            </div>
          ))}
        </div>

        {/* RINGKASAN STOK */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Ringkasan Stok</h3>
              <p className="card-sub">Produk milik kios kamu</p>
            </div>
            <span className="link" onClick={() => navigate("/stok")}>Kelola →</span>
          </div>

          {stokData.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 13, padding: "8px 0" }}>Belum ada produk.</p>
          ) : stokData.map((item) => {
            const pct   = item.max ? (item.stok / item.max) * 100 : 0;
            const isLow = pct <= 20;
            return (
              <div key={item.id} className="stok-row" onClick={() => navigate("/stok")}>
                <div className="stok-label">
                  <span>{item.nama}</span>
                  <span className={`stok-count ${isLow ? "low" : ""}`}>
                    {item.stok} {item.satuan}
                  </span>
                </div>
                <div className="track">
                  <div className={`fill ${isLow ? "fill-low" : ""}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
