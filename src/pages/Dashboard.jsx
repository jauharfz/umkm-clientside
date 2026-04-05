import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, Banknote, AlertTriangle, ShoppingBasket, AlertOctagon, Box, Book, Tags, FileText } from "lucide-react";
import "../assets/styles/dashboard.css";
import api, { getUser } from "../services/api";

// ── HELPERS ──────────────────────────────────────────────────

/**
 * Kembalikan tanggal hari ini dalam format YYYY-MM-DD sesuai zona WIB (UTC+7).
 * Menggunakan Intl API agar akurat di semua browser/OS, terlepas dari
 * zona lokal device pengguna.
 */
function getTodayWIB() {
    try {
        const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })
            .formatToParts(new Date());
        const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
        return `${get("year")}-${get("month")}-${get("day")}`;
    } catch {
        // Fallback sederhana jika Intl tidak tersedia
        const d = new Date(Date.now() + 7 * 3600 * 1000);
        return d.toISOString().slice(0, 10);
    }
}

/**
 * Selisih hari antara tanggal event (YYYY-MM-DD) dan hari ini WIB.
 * Positif = event di masa depan, 0 = hari ini, negatif = sudah lewat.
 * Perbandingan string YYYY-MM-DD cukup akurat untuk membandingkan tanggal.
 */
function getDaysUntil(tanggal) {
    const [ey, em, ed] = tanggal.split("-").map(Number);
    const today        = getTodayWIB();
    const [ty, tm, td] = today.split("-").map(Number);
    const msPerDay     = 24 * 60 * 60 * 1000;
    const eventMs      = new Date(ey, em - 1, ed).getTime();
    const todayMs      = new Date(ty, tm - 1, td).getTime();
    return Math.round((eventMs - todayMs) / msPerDay);
}


// ── COUNTDOWN ───────────────────────────────────────────────
/**
 * Tampilkan countdown event dalam satuan HARI saja.
 *
 * Alasan tidak memakai jam/menit/detik:
 *   - DB Gate menyimpan DATE bukan TIMESTAMPTZ → jam mulai tidak diketahui
 *   - Sebelumnya hardcode T08:00:00+07:00 yang tidak akurat
 *   - Event Peken Banyumasan bersifat day-long, bukan per-jam
 *   - Cukup logis untuk admin aktifkan event di hari pelaksanaan
 *
 * States:
 *   loading  → belum dapat respons API
 *   ongoing  → event status = 'aktif'
 *   today    → tanggal = hari ini, admin belum aktifkan (status masih selesai)
 *   countdown→ event mendatang (days > 0)
 *   none     → tidak ada event aktif/mendatang
 */
function Countdown() {
    const [state, setState] = useState("loading"); // "loading"|"countdown"|"today"|"ongoing"|"none"
    const [days,  setDays]  = useState(0);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

        fetch(`${API_URL}/public/event`)
            .then((r) => r.json())
            .then((res) => {
                const ev = res?.data;
                if (!ev) { setState("none"); return; }

                // Event sedang berlangsung
                if (ev.status === "aktif") { setState("ongoing"); return; }

                // Event mendatang — hitung selisih hari berdasarkan tanggal WIB
                // Tidak ada asumsi jam mulai karena DB hanya simpan DATE
                const diff = getDaysUntil(ev.tanggal);

                if (diff <= 0) {
                    // Tanggal = hari ini atau sudah lewat, tapi admin belum aktifkan
                    setState("today");
                } else {
                    setDays(diff);
                    setState("countdown");
                }
            })
            .catch(() => setState("none"));

        // Tidak butuh setInterval — HARI tidak berubah dalam satu sesi.
        // Jika user buka halaman pas tengah malam: refresh halaman cukup.
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

    if (state === "today") return (
        <div className="cd-boxes" style={{ alignItems: "center" }}>
            <div className="cd-box" style={{ width: "auto", padding: "12px 20px" }}>
                <div className="cd-num">🗓️</div>
                <div className="cd-unit" style={{ fontSize: 11, marginTop: 6 }}>HARI INI</div>
            </div>
        </div>
    );

    // state === "countdown" — tampilkan hanya HARI
    return (
        <div className="cd-boxes">
            <div className="cd-box" style={{ width: 90 }}>
                <div className="cd-num">{String(days).padStart(2, "0")}</div>
                <div className="cd-unit">HARI</div>
            </div>
        </div>
    );
}

// ── STAT CARD ────────────────────────────────────────────────
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

// ── MAIN DASHBOARD ───────────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const user     = getUser();

    const [stats,       setStats]      = useState(null);
    const [loading,     setLoading]    = useState(true);
    const [activeEvent, setActiveEvent] = useState(null);

    useEffect(() => {
        api.get("/dashboard")
            .then((res) => setStats(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        fetch(`${API_URL}/public/event`)
            .then((r) => r.json())
            .then((res) => { if (res?.data) setActiveEvent(res.data); })
            .catch(() => {});
    }, []);

    const namaDepan = user?.nama_pemilik?.split(" ")[0] || "Pengguna";
    const namaUsaha = user?.nama_usaha   || "Kios Saya";
    const stand     = user?.nomor_stand  || "—";
    const zona      = user?.zona         || "—";

    const chartData   = stats?.chart_penjualan    || [];
    const stokData    = stats?.ringkasan_stok     || [];
    const trxData     = stats?.transaksi_terakhir || [];
    const kritisCount = stats?.stats?.stok_kritis ?? stats?.stok_kritis ?? 0;

    const mx = chartData.length ? Math.max(...chartData.map((d) => d.pendapatan || 0)) || 1 : 1;

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
                                <span className="trx-name">{t.customer || "Pelanggan"} · {t.item || "—"}</span>
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