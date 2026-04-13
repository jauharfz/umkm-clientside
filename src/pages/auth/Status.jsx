import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.status-root{min-height:100vh;background:#f0ede6;display:flex;align-items:center;justify-content:center;padding:40px 16px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;position:relative}
.status-root::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle at 30% 30%,rgba(47,133,90,.07) 0%,transparent 50%),radial-gradient(circle at 70% 70%,rgba(217,119,6,.05) 0%,transparent 50%);pointer-events:none}
.status-card{position:relative;background:white;border-radius:28px;padding:52px 48px;width:100%;max-width:460px;box-shadow:0 0 0 1px rgba(0,0,0,.05),0 8px 32px rgba(0,0,0,.08);text-align:center;animation:cardIn .5s cubic-bezier(.22,1,.36,1) both}
@keyframes cardIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:500px){.status-card{padding:36px 24px}}
.status-brand{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:36px}
.status-brand-mark{width:36px;height:36px;background:linear-gradient(135deg,#2f855a,#48bb78);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 10px rgba(47,133,90,.3)}
.status-brand-name{font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:700;color:#1a2e1f}
.status-icon-wrap{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:40px;animation:popIn .4s .15s cubic-bezier(.22,1,.36,1) both}
@keyframes popIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.status-icon-wrap.pending{background:#fefce8;box-shadow:0 0 0 8px #fef9c3}
.status-icon-wrap.rejected{background:#fff1f0;box-shadow:0 0 0 8px #fee2e2}
.status-icon-wrap.approved{background:#f0fdf4;box-shadow:0 0 0 8px #dcfce7}
.status-title{font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#1a2e1f;margin-bottom:8px}
.status-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 16px;border-radius:999px;font-size:13px;font-weight:700;margin-bottom:16px;letter-spacing:.02em}
.status-badge.pending{background:#fef9c3;color:#a16207}
.status-badge.rejected{background:#fee2e2;color:#b91c1c}
.status-badge.approved{background:#dcfce7;color:#166534}
.status-desc{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:32px;max-width:320px;margin-left:auto;margin-right:auto}
.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:linear-gradient(135deg,#276749,#2f855a);color:white;border:none;border-radius:14px;font-size:15px;font-weight:700;font-family:'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer;transition:all .2s;box-shadow:0 6px 20px rgba(47,133,90,.38);margin-bottom:12px}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(47,133,90,.45)}
.btn-danger{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:linear-gradient(135deg,#b91c1c,#dc2626);color:white;border:none;border-radius:14px;font-size:15px;font-weight:700;font-family:'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer;transition:all .2s;box-shadow:0 6px 20px rgba(220,38,38,.35);margin-bottom:12px}
.btn-danger:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(220,38,38,.45)}
.info-box{background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:14px;padding:14px 16px;margin-bottom:24px;text-align:left}
.info-row{display:flex;align-items:center;gap:8px;font-size:13px;color:#4b5563}
.info-row+.info-row{margin-top:8px}
.info-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.pulse{animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.btn-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;background:white;border:1.5px solid #e5e7eb;border-radius:14px;font-size:14px;font-weight:600;font-family:'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer;color:#374151;transition:all .2s;margin-bottom:8px}
.btn-secondary:hover{border-color:#9ca3af;background:#f9fafb}
.no-email-box{background:#fff7ed;border:1.5px solid #fed7aa;border-radius:14px;padding:14px 16px;margin-bottom:24px;font-size:13px;color:#9a3412;text-align:left}
`;

const STATUS_CONFIG = {
    pending: {
        icon:   "⏳",
        badge:  "Menunggu Konfirmasi",
        title:  "Sedang Diproses",
        desc:   "Pendaftaranmu sudah kami terima. Admin sedang memverifikasi data dan akan segera menghubungimu melalui WhatsApp.",
        infos: [
            { dot: "#f59e0b", text: "Proses verifikasi biasanya 1×24 jam" },
            { dot: "#f59e0b", text: "Pastikan WhatsApp kamu aktif" },
            { dot: "#f59e0b", text: "Halaman ini refresh otomatis setiap 30 detik" },
        ],
    },
    rejected: {
        icon:   "❌",
        badge:  "Tidak Disetujui",
        title:  "Pendaftaran Ditolak",
        desc:   "Maaf, pendaftaranmu belum bisa diproses. Kemungkinan karena kios tidak cocok atau ada kendala lain. Silakan pilih kios lain dan coba lagi.",
        infos: [
            { dot: "#ef4444", text: "Kamu bisa pilih kios lain yang tersedia" },
            { dot: "#ef4444", text: "Hubungi admin untuk informasi lebih lanjut" },
        ],
    },
    approved: {
        icon:   "🎉",
        badge:  "Disetujui",
        title:  "Selamat, Berhasil!",
        desc:   "Pendaftaranmu telah disetujui oleh admin. Silakan login untuk mengakses dashboard UMKM dan mulai mengelola kiosmu.",
        infos: [
            { dot: "#22c55e", text: "Kios kamu sudah siap digunakan" },
            { dot: "#22c55e", text: "Pantau stok & transaksi di dashboard" },
            { dot: "#22c55e", text: "Acara dimulai 22 Maret 2026" },
        ],
    },
};

export default function Status() {
    const navigate = useNavigate();
    const [status, setStatus]   = useState("pending");
    const [loading, setLoading] = useState(true);

    // FIX: ambil email dari localStorage yang disimpan oleh Register.jsx
    // Endpoint GET /api/auth/status membutuhkan query param ?email=
    const email = localStorage.getItem("reg_email") || "";

    const fetchStatus = async () => {
        // Jika tidak ada email, tidak bisa query status — tampilkan pending saja
        if (!email) {
            setLoading(false);
            return;
        }

        try {
            // FIX: kirim email sebagai query param sesuai signature backend
            const res = await api.get(`/auth/status?email=${encodeURIComponent(email)}`);
            // Backend mengembalikan { status: "success", data: { email, status_pendaftaran, nama_usaha } }
            const s = res?.data?.status_pendaftaran || "pending";
            setStatus(s);

            // FIX: endpoint /auth/status TIDAK mengembalikan token.
            // Token hanya didapat dari POST /auth/login.
            // Saat approved, cukup tampilkan tombol "Masuk / Login".
            // Jangan coba setToken/setUser di sini — tidak ada datanya.
        } catch {
            // Jika email tidak ditemukan (404) atau error lain, tetap pending
            setStatus("pending");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => {
            if (status === "pending") fetchStatus();
        }, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    if (loading) {
        return (
            <>
                <style>{CSS}</style>
                <div className="status-root">
                    <div className="status-card">
                        <div className="status-brand">
                            <div className="status-brand-mark">🎪</div>
                            <span className="status-brand-name">Peken Banyumas 2026</span>
                        </div>
                        <p style={{ color: "#6b7280", fontSize: 14 }}>Memeriksa status pendaftaran...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{CSS}</style>
            <div className="status-root">
                <div className="status-card">

                    {/* Brand */}
                    <div className="status-brand">
                        <div className="status-brand-mark">🎪</div>
                        <span className="status-brand-name">Peken Banyumas 2026</span>
                    </div>

                    {/* Peringatan jika tidak ada email */}
                    {!email && (
                        <div className="no-email-box">
                            ⚠ Email tidak ditemukan. Silakan daftar ulang atau cek status langsung via halaman <strong>Login</strong>.
                        </div>
                    )}

                    {/* Icon */}
                    <div className={`status-icon-wrap ${status}`}>
                        {status === "pending" && <span className="pulse">{cfg.icon}</span>}
                        {status !== "pending" && cfg.icon}
                    </div>

                    {/* Badge */}
                    <div className={`status-badge ${status}`}>
                        {status === "pending"  && "⏳ "}
                        {status === "rejected" && "✕ "}
                        {status === "approved" && "✓ "}
                        {cfg.badge}
                    </div>

                    <h2 className="status-title">{cfg.title}</h2>
                    <p className="status-desc">{cfg.desc}</p>

                    <div className="info-box">
                        {cfg.infos.map(({ dot, text }, i) => (
                            <div className="info-row" key={i}>
                                <span className="info-dot" style={{ background: dot }} />
                                {text}
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    {status === "approved" && (
                        // FIX: endpoint status tidak mengembalikan token.
                        // Arahkan ke halaman login — user login manual untuk dapat token.
                        <button className="btn-primary" onClick={() => {
                            localStorage.removeItem("reg_email"); // bersihkan setelah approved
                            navigate("/login");
                        }}>
                            🔑 Login ke Dashboard
                        </button>
                    )}
                    {status === "rejected" && (
                        <button className="btn-danger" onClick={() => navigate("/register")}>
                            🔄 Pilih Kios Lain
                        </button>
                    )}
                    {status === "pending" && (
                        <>
                            <button
                                className="btn-primary"
                                style={{ background: "linear-gradient(135deg,#a16207,#d97706)", boxShadow: "0 6px 20px rgba(217,119,6,.35)" }}
                                onClick={() => window.open("https://wa.me/6282192058122", "_blank")}
                            >
                                💬 Hubungi Admin WA
                            </button>
                            <button className="btn-secondary" onClick={fetchStatus}>
                                🔄 Refresh Status
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}