import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, Banknote, AlertTriangle, ShoppingBasket, AlertOctagon, Box, Book, Tags, FileText } from "lucide-react";
import "../assets/styles/dashboard.css";
import api, { getUser } from "../services/api";

// ── COUNTDOWN ───────────────────────────────────────────
function Countdown() {
    const [state, setState] = useState("loading"); // "loading"|"countdown"|"ongoing"|"none"
    const [time,  setTime]  = useState({ d: "00", j: "00", m: "00", s: "00" });

    useEffect(() => {
        // Endpoint publik, tidak butuh token.
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        let timerId;

        fetch(`${API_URL}/public/event`)
            .then(r => r.json())
            .then(res => {
                const ev = res?.data;
                if (!ev) { setState("none"); return; }

                // Event aktif → sedang berlangsung sekarang
                if (ev.status === "aktif") { setState("ongoing"); return; }

                // Event mendatang: Gate DB hanya simpan DATE (tanpa jam).
                // Default jam mulai: 08:00 WIB (UTC+7) — sesuai kebijakan event.
                const target = new Date(`${ev.tanggal}T08:00:00+07:00`);
                if (target <= new Date()) { setState("ongoing"); return; }

                setState("countdown");

                function tick() {
                    const diff = target - new Date();
                    if (diff <= 0) { setState("ongoing"); clearInterval(timerId); return; }
                    setTime({
                        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
                        j: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
                        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
                        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
                    });
                }
                tick();
                // Update setiap 1 detik agar hitungan detik berjalan
                timerId = setInterval(tick, 1000);
            })
            .catch(() => setState("none"));

        return () => clearInterval(timerId);
    }, []);

    if (state === "loading") return null;

    if (state === "none") return (
        <div className="cd-boxes" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.65)", fontStyle: "italic" }}>
                Belum ada event mendatang
            </span>
        </div>
    );

    if (state === "ongoing") return (
        <div className="cd-boxes" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,.9)", fontWeight: 600 }}>
                🎉 Acara sedang berlangsung!
            </span>
        </div>
    );

    // state === "countdown"
    return (
        <div className="cd-boxes">
            {[["d", "HARI"], ["j", "JAM"], ["m", "MENIT"], ["s", "DETIK"]].map(([k, u]) => (
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
    // FIX: simpan info event aktif untuk ditampilkan di banner
    const [activeEvent, setActiveEvent] = useState(null);

    useEffect(() => {
        api.get("/dashboard")
            .then(res => setStats(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));

        // Fetch event info untuk nama event di banner (publik, no auth)
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        fetch(`${API_URL}/public/event`)
            .then(r => r.json())
            .then(res => { if (res?.data) setActiveEvent(res.data); })
            .catch(() => {});
    }, []);

    const namaDepan   = user?.nama_pemilik?.split(" ")[0] || "Pengguna";
    const namaUsaha   = user?.nama_usaha   || "Kios Saya";
    const stand       = user?.nomor_stand  || "—";
    const zona        = user?.zona         || "—";

    // FIX: field dari backend adalah chart_penjualan, bukan chart_mingguan
    const chartData   = stats?.chart_penjualan    || [];
    // FIX: field dari backend adalah ringkasan_stok, bukan stok_ringkasan
    const stokData    = stats?.ringkasan_stok     || [];
    // FIX: field dari backend adalah transaksi_terakhir (sudah benar)
    const trxData     = stats?.transaksi_terakhir || [];
    const kritisCount = stats?.stats?.stok_kritis ?? stats?.stok_kritis ?? 0;

    // chart_penjualan dari backend: { label, pendapatan, jumlah_transaksi }
    const mx = chartData.length ? Math.max(...chartData.map(d => d.pendapatan || 0)) || 1 : 1;

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
                    {/* FIX: nama event dari Gate, bukan hardcode */}
                    <div className="cd-title">{activeEvent?.nama_event || "Peken Banyumas"}</div>
                    <div className="cd-sub">{stand} · Zona {zona} · {activeEvent?.lokasi || "Masuk Gratis"}</div>
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
                        // FIX: stats dari backend ada di stats.stats.total_produk
                        value={stats?.stats?.total_produk ?? stats?.total_produk ?? "—"}
                        unit="item"
                    />
                    <StatCard
                        icon={<Banknote size={20} className="icon-stats"/>}
                        label="Omset Hari Ini"
                        value={
                            (stats?.stats?.omset_hari_ini ?? stats?.omset_hari_ini)
                                ? `Rp ${((stats?.stats?.omset_hari_ini ?? stats?.omset_hari_ini) / 1000).toFixed(0)}`
                                : "—"
                        }
                        unit={(stats?.stats?.omset_hari_ini ?? stats?.omset_hari_ini) ? "rb" : null}
                    />
                    <StatCard
                        icon={<ShoppingBasket size={20} className="icon-stats"/>}
                        label="Transaksi Hari Ini"
                        value={stats?.stats?.transaksi_hari_ini ?? stats?.transaksi_hari_ini ?? "—"}
                        unit="trx"
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
                                {/* FIX: chart_penjualan dari backend: { label, pendapatan, jumlah_transaksi } */}
                                {chartData.map((d, i) => (
                                    <div className="bc" key={i}>
                                        <div className="bars">
                                            <div className="bar omzet" style={{ height: `${(d.pendapatan / mx) * 100}%` }} />
                                            <div className="bar trx"   style={{ height: `${((d.jumlah_transaksi || 0) / mx) * 100}%` }} />
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
                                {/* FIX: backend mengembalikan t.customer dan t.item, bukan t.pelanggan dan t.barang */}
                                <span className="trx-name">{t.customer || "Pelanggan"} · {t.item || "—"}</span>
                                {/* FIX: waktu dari backend ada di t.time (sudah di-format di _fmt_trx) */}
                                <span className="trx-time">{t.time ? new Date(t.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                            </div>
                            <span className="trx-total">
                Rp {(t.total || 0).toLocaleString("id-ID")}
              </span>
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
                        // FIX: field dari backend adalah item.max (stok_max), bukan item.stok_max
                        const pct   = item.max ? (item.stok / item.max) * 100 : 0;
                        const isLow = pct <= 20;
                        return (
                            <div key={item.id} className="stok-row" onClick={() => navigate("/stok")}>
                                <div className="stok-label">
                                    <span>{item.nama}</span>
                                    <span className={`stok-count ${isLow ? "low" : ""}`}>
                    {item.stok} {item.satuan || "unit"}
                  </span>
                                </div>
                                <div className="track">
                                    <div className={`fill ${isLow ? "fill-low" : ""}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}