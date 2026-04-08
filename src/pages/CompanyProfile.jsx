import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif}
.cp-root{min-height:100vh;background:#f9f6f0;color:#1a2e1f}
.cp-nav{position:sticky;top:0;z-index:100;background:rgba(249,246,240,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(47,133,90,0.1);padding:0 32px}
.cp-nav-inner{max-width:1100px;margin:0 auto;height:64px;display:flex;align-items:center;justify-content:space-between}
.cp-logo{display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none}
.cp-logo-mark{width:38px;height:38px;background:linear-gradient(135deg,#2f855a,#48bb78);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(47,133,90,.25)}
.cp-logo-text{font-family:'Lora',serif;font-size:17px;font-weight:700;color:#1a2e1f}
.cp-nav-links{display:flex;align-items:center;gap:8px}
.cp-nav-link{font-size:14px;font-weight:500;color:#4b5563;padding:7px 14px;border-radius:8px;cursor:pointer;transition:all .2s;border:none;background:none;font-family:'DM Sans',sans-serif}
.cp-nav-link:hover{background:#f0fdf4;color:#2f855a}
.cp-nav-cta{background:linear-gradient(135deg,#2f855a,#48bb78);color:white;font-size:14px;font-weight:600;padding:8px 18px;border-radius:99px;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;box-shadow:0 3px 10px rgba(47,133,90,.3);transition:all .2s}
.cp-nav-cta:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(47,133,90,.35)}
.cp-hero{max-width:1100px;margin:0 auto;padding:80px 32px 60px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
@media(max-width:768px){.cp-hero{grid-template-columns:1fr;padding:48px 20px 40px;gap:40px}.cp-nav{padding:0 16px}.cp-nav-link{display:none}}
.cp-hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:999px;margin-bottom:20px}
.cp-hero-title{font-family:'Lora',serif;font-size:46px;font-weight:700;line-height:1.15;color:#1a2e1f;margin-bottom:16px}
@media(max-width:768px){.cp-hero-title{font-size:32px}}
.cp-hero-title em{font-style:italic;color:#2f855a}
.cp-hero-subtitle{font-size:16px;color:#4b5563;line-height:1.7;margin-bottom:32px;max-width:460px}
.cp-hero-actions{display:flex;gap:12px;flex-wrap:wrap}
.cp-btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#276749,#2f855a);color:white;font-size:15px;font-weight:600;font-family:'DM Sans',sans-serif;padding:14px 28px;border-radius:14px;cursor:pointer;border:none;box-shadow:0 6px 20px rgba(47,133,90,.35);transition:all .2s}
.cp-btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(47,133,90,.4)}
.cp-btn-secondary{display:inline-flex;align-items:center;gap:8px;background:white;color:#2f855a;font-size:15px;font-weight:600;font-family:'DM Sans',sans-serif;padding:13px 26px;border-radius:14px;cursor:pointer;border:2px solid #2f855a;transition:all .2s}
.cp-btn-secondary:hover{background:#f0fdf4;transform:translateY(-1px)}
.cp-hero-visual{display:flex;flex-direction:column;gap:16px}
.cp-stat-card{background:white;border-radius:20px;padding:20px 24px;box-shadow:0 2px 16px rgba(0,0,0,.06);border:1px solid rgba(47,133,90,.08);display:flex;align-items:center;gap:16px;transition:transform .2s}
.cp-stat-card:hover{transform:translateY(-3px)}
.cp-stat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.cp-stat-value{font-family:'Lora',serif;font-size:24px;font-weight:700;color:#1a2e1f;line-height:1}
.cp-stat-label{font-size:12px;color:#6b7280;margin-top:3px}
.cp-event-badge{background:linear-gradient(90deg,#1a2e1f,#2f855a);color:white;border-radius:20px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.cp-event-badge-date{font-family:'Lora',serif;font-size:20px;font-weight:700}
.cp-event-badge-loc{font-size:13px;opacity:.8;margin-top:3px}
.cp-event-badge-countdown{text-align:right}
.cp-event-badge-days{font-family:'Lora',serif;font-size:28px;font-weight:700;line-height:1}
.cp-event-badge-soon{font-size:11px;opacity:.8;margin-top:2px;text-transform:uppercase;letter-spacing:.06em}
.cp-section{max-width:1100px;margin:0 auto;padding:60px 32px}
@media(max-width:768px){.cp-section{padding:48px 20px}}
.cp-section-eyebrow{font-size:12px;font-weight:700;color:#2f855a;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px}
.cp-section-title{font-family:'Lora',serif;font-size:34px;font-weight:700;color:#1a2e1f;margin-bottom:12px}
.cp-section-subtitle{font-size:15px;color:#6b7280;line-height:1.7;max-width:520px}
.cp-register-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}
@media(max-width:640px){.cp-register-grid{grid-template-columns:1fr}}
.cp-reg-card{background:white;border-radius:24px;padding:36px 32px;box-shadow:0 2px 20px rgba(0,0,0,.06);border:2px solid transparent;transition:all .25s;position:relative;overflow:hidden}
.cp-reg-card.clickable{cursor:pointer}
.cp-reg-card.clickable:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(47,133,90,.15);border-color:#2f855a}
.cp-reg-card-icon{width:60px;height:60px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px}
.cp-reg-card-title{font-family:'Lora',serif;font-size:22px;font-weight:700;color:#1a2e1f;margin-bottom:8px}
.cp-reg-card-desc{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:24px}
.cp-reg-card-features{list-style:none;margin-bottom:28px}
.cp-reg-card-features li{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#374151;padding:5px 0}
.cp-reg-card-features li::before{content:'✓';color:#2f855a;font-weight:700;flex-shrink:0}
.cp-reg-card-cta{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;font-size:14px;font-weight:600;transition:all .2s}
.cp-info-box{background:#fffbeb;border:1.5px solid #fde68a;border-radius:14px;padding:16px 18px;margin-top:16px;font-size:13.5px;color:#92400e;line-height:1.7;display:flex;gap:10px;align-items:flex-start}
.cp-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px}
@media(max-width:640px){.cp-timeline{grid-template-columns:1fr}}
.cp-timeline-step{display:flex;flex-direction:column;gap:12px}
.cp-timeline-num{width:40px;height:40px;background:linear-gradient(135deg,#2f855a,#48bb78);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Lora',serif;font-size:16px;font-weight:700;color:white}
.cp-timeline-title{font-size:15px;font-weight:700;color:#1a2e1f}
.cp-timeline-desc{font-size:13.5px;color:#6b7280;line-height:1.65}
.cp-divider{border:none;border-top:1px solid #e9eaeb;margin:0 32px}
.cp-footer{max-width:1100px;margin:0 auto;padding:40px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
@media(max-width:768px){.cp-footer{padding:32px 20px}}
.cp-footer-copy{font-size:13px;color:#9ca3af}
.cp-footer-links{display:flex;gap:20px}
.cp-footer-link{font-size:13px;color:#6b7280;cursor:pointer;transition:color .2s}
.cp-footer-link:hover{color:#2f855a}
`;

export default function CompanyProfile() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ days: null, loading: true });

    useEffect(() => {
        const API = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
        fetch(`${API}/public/event`)
            .then(r => r.json())
            .then(res => {
                const ev = res?.data;
                if (!ev) { setCountdown({ days: null, loading: false }); return; }
                if (ev.status === "aktif") { setCountdown({ days: 0, loading: false, ongoing: true }); return; }
                const [ey, em, ed] = ev.tanggal.split("-").map(Number);
                const todayMs = new Date().setHours(0,0,0,0);
                const eventMs = new Date(ey, em-1, ed).getTime();
                const days = Math.round((eventMs - todayMs) / 86400000);
                setCountdown({ days, loading: false, tanggal: ev.tanggal, nama: ev.nama_event });
            })
            .catch(() => setCountdown({ days: null, loading: false }));
    }, []);

    return (
        <>
            <style>{CSS}</style>
            <div className="cp-root">

                {/* NAV */}
                <nav className="cp-nav">
                    <div className="cp-nav-inner">
                        <div className="cp-logo" onClick={() => navigate("/")}>
                            <div className="cp-logo-mark">🎪</div>
                            <div className="cp-logo-text">Peken Banyumas</div>
                        </div>
                        <div className="cp-nav-links">
                            <button className="cp-nav-link" onClick={() => document.getElementById("daftar-section")?.scrollIntoView({ behavior: "smooth" })}>
                                Pendaftaran
                            </button>
                            <button className="cp-nav-link" onClick={() => navigate("/login")}>
                                Masuk UMKM
                            </button>
                            <button className="cp-nav-cta" onClick={() => navigate("/daftar-umkm")}>
                                Daftar UMKM
                            </button>
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <section style={{ background: "linear-gradient(180deg,#f0ede6 0%,#f9f6f0 100%)" }}>
                    <div className="cp-hero">
                        <div>
                            <div className="cp-hero-eyebrow">
                                <span>🗓</span> 22–24 Maret 2026 · Purwokerto
                            </div>
                            <h1 className="cp-hero-title">
                                Pasar Rakyat<br />
                                <em>Peken Banyumasan</em><br />
                                2026
                            </h1>
                            <p className="cp-hero-subtitle">
                                Festival kuliner, fashion, dan kerajinan tangan terbesar di Banyumas.
                                Bergabunglah sebagai pelaku UMKM atau kunjungi event dan daftar member NFC langsung di lokasi.
                            </p>
                            <div className="cp-hero-actions">
                                <button className="cp-btn-primary"
                                        onClick={() => document.getElementById("daftar-section")?.scrollIntoView({ behavior: "smooth" })}>
                                    🚀 Daftar Sekarang
                                </button>
                                <button className="cp-btn-secondary" onClick={() => navigate("/login")}>
                                    🔑 Login UMKM
                                </button>
                            </div>
                        </div>

                        <div className="cp-hero-visual">
                            {/* Event countdown */}
                            <div className="cp-event-badge">
                                <div>
                                    <div className="cp-event-badge-date">22–24 Maret 2026</div>
                                    <div className="cp-event-badge-loc">📍 Alun-alun Purwokerto, Banyumas</div>
                                </div>
                                <div className="cp-event-badge-countdown">
                                    {countdown.loading ? (
                                        <div className="cp-event-badge-days">⏳</div>
                                    ) : countdown.ongoing ? (
                                        <>
                                            <div className="cp-event-badge-days">🟢</div>
                                            <div className="cp-event-badge-soon">Sedang berlangsung</div>
                                        </>
                                    ) : countdown.days !== null ? (
                                        <>
                                            <div className="cp-event-badge-days">{countdown.days}</div>
                                            <div className="cp-event-badge-soon">hari lagi</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="cp-event-badge-days">🎪</div>
                                            <div className="cp-event-badge-soon">Segera hadir</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            {[
                                { icon: "🏪", bg: "#f0fdf4", value: "50+", label: "Kios UMKM Tersedia" },
                                { icon: "👥", bg: "#fff7ed", value: "3 Zona", label: "Kuliner · Fashion · Kerajinan" },
                                { icon: "🏷️", bg: "#f5f3ff", value: "Diskon", label: "Benefit Eksklusif Member NFC" },
                            ].map(({ icon, bg, value, label }) => (
                                <div className="cp-stat-card" key={label}>
                                    <div className="cp-stat-icon" style={{ background: bg }}>{icon}</div>
                                    <div>
                                        <div className="cp-stat-value">{value}</div>
                                        <div className="cp-stat-label">{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="cp-divider" />

                {/* DAFTAR SECTION */}
                <section className="cp-section" id="daftar-section">
                    <div className="cp-section-eyebrow">Pendaftaran</div>
                    <h2 className="cp-section-title">Pilih Cara Bergabung</h2>
                    <p className="cp-section-subtitle">
                        Ikuti Peken Banyumas sebagai pelaku UMKM dengan membuka kios, atau kunjungi booth Gate saat event untuk mendaftar sebagai member NFC.
                    </p>

                    <div className="cp-register-grid">
                        {/* Card UMKM */}
                        <div className="cp-reg-card clickable" onClick={() => navigate("/daftar-umkm")}>
                            <div className="cp-reg-card-icon" style={{ background: "#f0fdf4" }}>🏪</div>
                            <div className="cp-reg-card-title">Daftar sebagai UMKM</div>
                            <p className="cp-reg-card-desc">
                                Buka kios dan jangkau ribuan pengunjung. Kelola usaha lewat dashboard digital kami.
                            </p>
                            <ul className="cp-reg-card-features">
                                <li>Pilih kios & zona sesuai kategori usaha</li>
                                <li>Dashboard manajemen stok & transaksi</li>
                                <li>Buat promo & diskon untuk member</li>
                                <li>Laporan penjualan real-time</li>
                            </ul>
                            <div className="cp-reg-card-cta" style={{ background: "#f0fdf4", color: "#2f855a" }}>
                                <span>Daftar UMKM Online</span>
                                <span>→</span>
                            </div>
                        </div>

                        {/* Card Member — tidak ada link online, datang langsung */}
                        <div className="cp-reg-card">
                            <div className="cp-reg-card-icon" style={{ background: "#fff7ed" }}>🏷️</div>
                            <div className="cp-reg-card-title">Jadi Member NFC</div>
                            <p className="cp-reg-card-desc">
                                Dapatkan kartu NFC eksklusif untuk akses mudah dan nikmati diskon spesial dari puluhan UMKM.
                            </p>
                            <ul className="cp-reg-card-features">
                                <li>NFC Tag untuk tap masuk mudah</li>
                                <li>Diskon eksklusif dari kios UMKM peserta</li>
                                <li>Antrian lebih cepat di pintu masuk</li>
                                <li>Pendaftaran gratis, langsung di lokasi</li>
                            </ul>
                            <div className="cp-info-box">
                                <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
                                <span>
                                    <strong>Daftar langsung di Booth Gate</strong> saat event berlangsung.
                                    Cukup datang ke loket pendaftaran di pintu masuk, bawa nama & nomor HP.
                                    Petugas akan membuatkan NFC Tag untuk kamu saat itu juga — gratis!
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="cp-divider" />

                {/* ALUR PENDAFTARAN UMKM */}
                <section className="cp-section">
                    <div className="cp-section-eyebrow">Cara Mendaftar UMKM</div>
                    <h2 className="cp-section-title">Alur Pendaftaran UMKM</h2>
                    <div className="cp-timeline">
                        {[
                            { num: "1", title: "Isi Formulir Online", desc: "Lengkapi data usaha, akun, dan upload dokumen KTP & NIB melalui form pendaftaran digital." },
                            { num: "2", title: "Pilih Kios & Zona", desc: "Pilih lokasi kios yang tersedia sesuai kategori usaha kamu (Kuliner, Fashion, atau Kerajinan)." },
                            { num: "3", title: "Verifikasi Admin", desc: "Tim kami akan memverifikasi dokumen dan data usahamu. Status dapat dicek lewat halaman Login setelah mendaftar." },
                            { num: "4", title: "Konfirmasi & Bayar", desc: "Setelah disetujui, lakukan konfirmasi dan pembayaran sewa kios sesuai instruksi admin." },
                            { num: "5", title: "Akses Dashboard", desc: "Login ke dashboard UMKM untuk mulai kelola stok, promosi, dan transaksi selama event." },
                        ].map(({ num, title, desc }) => (
                            <div className="cp-timeline-step" key={num}>
                                <div className="cp-timeline-num">{num}</div>
                                <div className="cp-timeline-title">{title}</div>
                                <div className="cp-timeline-desc">{desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="cp-divider" />

                {/* CTA BOTTOM */}
                <section className="cp-section" style={{ textAlign: "center", paddingTop: 48, paddingBottom: 64 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontSize: 28, fontWeight: 700, color: "#1a2e1f", marginBottom: 12 }}>
                        Siap bergabung di Peken Banyumas 2026?
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 32 }}>
                        Tempat kios terbatas. Daftarkan usahamu sekarang sebelum kehabisan.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="cp-btn-primary" onClick={() => navigate("/daftar-umkm")}>
                            🏪 Daftar sebagai UMKM
                        </button>
                        <button className="cp-btn-secondary" onClick={() => navigate("/login")}>
                            🔑 Login UMKM
                        </button>
                    </div>
                </section>

                {/* FOOTER */}
                <div style={{ borderTop: "1px solid #e9eaeb" }}>
                    <div className="cp-footer">
                        <div className="cp-footer-copy">© 2026 Peken Banyumasan. Hak cipta dilindungi.</div>
                        <div className="cp-footer-links">
                            <span className="cp-footer-link" onClick={() => navigate("/login")}>Login UMKM</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
