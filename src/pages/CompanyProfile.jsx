import React, { useEffect, useMemo, useState } from 'react';

const FAQ = [
    {
        q: 'Apa itu Peken Banyumasan?',
        a: 'Peken Banyumasan adalah event yang menghadirkan pengunjung, komunitas, dan pelaku usaha lokal dalam satu rangkaian kegiatan yang terhubung.',
    },
    {
        q: 'Apakah halaman ini hanya untuk UMKM?',
        a: 'Tidak. Halaman ini adalah halaman publik event, sehingga relevan untuk pengunjung umum, calon pengunjung event, maupun calon tenant UMKM.',
    },
    {
        q: 'Apa fungsi member NFC?',
        a: 'Member NFC dipakai untuk identifikasi kunjungan secara cepat saat masuk event dan untuk mendukung benefit tertentu yang disediakan tenant atau panitia.',
    },
    {
        q: 'Apakah daftar member harus pindah ke halaman lain?',
        a: 'Tidak. Tombol dan menu daftar member pada halaman ini langsung mengarah ke section alur daftar member melalui auto-scroll, bukan membuka halaman baru.',
    },
];

const HIGHLIGHTS = [
    {
        icon: '🎪',
        title: 'Event untuk Publik',
        desc: 'Halaman ini menampilkan gambaran umum event sehingga tetap relevan bagi semua pengunjung.',
    },
    {
        icon: '🪪',
        title: 'Daftar Member NFC',
        desc: 'Pengunjung dapat melihat alur daftar member secara runtut tanpa pindah ke halaman lain.',
    },
    {
        icon: '🏪',
        title: 'Partisipasi UMKM',
        desc: 'Pelaku usaha memiliki jalur untuk ikut serta sebagai tenant dalam ekosistem event.',
    },
    {
        icon: '🔗',
        title: 'Sistem Terintegrasi',
        desc: 'Gate, member, dan tenant berjalan dalam alur yang saling terhubung.',
    },
];

const MEMBER_STEPS = [
    {
        step: '01',
        title: 'Datang ke meja registrasi member',
        desc: 'Pengunjung datang ke titik registrasi member yang tersedia di area event atau dekat pintu masuk.',
    },
    {
        step: '02',
        title: 'Berikan data singkat ke petugas',
        desc: 'Sampaikan nama dan nomor WhatsApp aktif agar petugas dapat mendaftarkan data member dengan cepat.',
    },
    {
        step: '03',
        title: 'Terima dan aktivasi keychain NFC',
        desc: 'Petugas akan menghubungkan keychain NFC ke data member sehingga siap digunakan saat masuk.',
    },
    {
        step: '04',
        title: 'Tap saat masuk ke event',
        desc: 'Setelah aktif, keychain NFC dapat digunakan untuk proses masuk yang lebih praktis di gate event.',
    },
    {
        step: '05',
        title: 'Gunakan lagi untuk event berikutnya',
        desc: 'Member yang sudah terdaftar tidak perlu mengulang proses dari awal selama keychain masih aktif di sistem.',
    },
];

function FaqItem({ item }) {
    return (
        <details className="ep-faq-item">
            <summary className="ep-faq-btn">
                <span>{item.q}</span>
                <span className="ep-faq-chevron">⌄</span>
            </summary>
            <p className="ep-faq-body">{item.a}</p>
        </details>
    );
}

const goTo = (target) => {
    window.location.href = target;
};

const goLogin = () => {
    goTo(import.meta.env.VITE_PUBLIC_LOGIN_URL || '/login');
};

const goUmkmRegister = () => {
    goTo(import.meta.env.VITE_UMKM_PUBLIC_URL || '/daftar-umkm');
};

const jumpTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const GATE_PUBLIC_API = (import.meta.env.VITE_GATE_PUBLIC_API_URL || '').replace(/\/$/, '');

async function fetchUpcomingEvent() {
    const targets = [
        API_BASE ? `${API_BASE}/public/event` : '',
        GATE_PUBLIC_API ? `${GATE_PUBLIC_API}/events/public` : '',
        API_BASE ? `${API_BASE}/events/public` : '',
    ].filter(Boolean);

    for (const url of targets) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const json = await res.json();
            if (json?.status === 'success') return json?.data || null;
        } catch {
            // try next endpoint
        }
    }
    return null;
}

function formatEventDate(dateValue) {
    if (!dateValue) return '—';
    try {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(`${dateValue}T08:00:00+07:00`));
    } catch {
        return dateValue;
    }
}

export default function CompanyProfile() {
    const [eventInfo, setEventInfo] = useState(null);
    const [eventLoading, setEventLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchUpcomingEvent()
            .then((data) => {
                if (mounted) setEventInfo(data);
            })
            .finally(() => {
                if (mounted) setEventLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const eventStatusText = useMemo(() => {
        if (eventLoading) return 'Memuat informasi event';
        if (!eventInfo) return 'Belum ada event yang ditampilkan';
        return eventInfo.status === 'aktif' ? 'Sedang berlangsung' : 'Event mendatang';
    }, [eventInfo, eventLoading]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#1f2937}
        .ep-root{min-height:100vh;background:#fff}
        .ep-serif{font-family:'Lora',serif}
        .ep-nav{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid #f0f0f0}
        .ep-nav-inner,.ep-section,.ep-hero{max-width:1140px;margin:0 auto;padding:0 24px}
        .ep-nav-inner{height:70px;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .ep-brand{display:flex;align-items:center;gap:12px;font-weight:700;color:#111827}
        .ep-brand-mark{width:40px;height:40px;border-radius:12px;background:#166534;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;box-shadow:0 10px 24px rgba(22,101,52,.18)}
        .ep-brand-sub{font-size:12px;color:#6b7280;font-weight:600}
        .ep-nav-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .ep-link-btn,.ep-primary-btn,.ep-secondary-btn{border:none;border-radius:14px;padding:12px 18px;font-weight:700;cursor:pointer;transition:.2s;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;justify-content:center}
        .ep-link-btn{background:transparent;color:#4b5563;padding:8px 12px}
        .ep-link-btn:hover{background:#f3f4f6;color:#166534}
        .ep-primary-btn{background:#166534;color:#fff;box-shadow:0 12px 24px rgba(22,101,52,.18)}
        .ep-primary-btn:hover{transform:translateY(-1px);background:#14532d}
        .ep-secondary-btn{background:#fff;color:#166534;border:1.5px solid #166534}
        .ep-secondary-btn:hover{background:#f0fdf4}
        .ep-hero-wrap{background:linear-gradient(135deg,#166534 0%,#14532d 42%,#052e16 100%);overflow:hidden;position:relative}
        .ep-hero-wrap:before{content:'';position:absolute;inset:-120px auto auto -120px;width:320px;height:320px;border-radius:999px;background:rgba(251,191,36,.12);filter:blur(30px)}
        .ep-hero-wrap:after{content:'';position:absolute;right:-100px;bottom:-120px;width:340px;height:340px;border-radius:999px;background:rgba(34,197,94,.14);filter:blur(30px)}
        .ep-hero{display:grid;grid-template-columns:1.15fr .85fr;gap:36px;align-items:center;padding-top:86px;padding-bottom:92px;position:relative;z-index:1}
        .ep-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.28);color:#fde68a;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px}
        .ep-hero-title{font-size:50px;line-height:1.12;color:#fff;margin:0 0 16px}
        .ep-hero-title span{color:#fde68a}
        .ep-hero-sub{font-size:16px;line-height:1.78;color:#d1fae5;max-width:660px;margin:0 0 28px}
        .ep-hero-actions{display:flex;flex-wrap:wrap;gap:12px}
        .ep-side-grid{display:grid;gap:16px}
        .ep-side-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:24px;padding:22px;color:#fff;backdrop-filter:blur(10px)}
        .ep-side-card.light{background:#fff;color:#111827;border-color:#eef2f7;box-shadow:0 18px 40px rgba(15,23,42,.08)}
        .ep-mini-label{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#bbf7d0}
        .ep-side-card.light .ep-mini-label{color:#6b7280}
        .ep-big{font-size:30px;font-weight:800;margin-top:8px;line-height:1.15}
        .ep-muted{font-size:14px;line-height:1.72;color:#d1fae5;margin-top:8px}
        .ep-side-card.light .ep-muted{color:#6b7280}
        .ep-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .ep-section{padding:72px 24px;scroll-margin-top:96px}
        .ep-title{font-size:34px;line-height:1.2;color:#111827;margin:0 0 12px}
        .ep-subtitle{color:#6b7280;line-height:1.8;max-width:780px;margin:0}
        .ep-highlights{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:30px}
        .ep-highlight{border:1px solid #eef2f7;border-radius:22px;padding:22px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.04)}
        .ep-highlight-icon{width:46px;height:46px;border-radius:16px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
        .ep-highlight h3{margin:0 0 10px;font-size:18px;color:#111827}
        .ep-highlight p{margin:0;color:#6b7280;line-height:1.75;font-size:14px}
        .ep-strip{background:#fafaf9;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6}
        .ep-access-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:30px}
        .ep-access-card{background:#fff;border:1px solid #eef2f7;border-radius:22px;padding:24px;box-shadow:0 12px 30px rgba(15,23,42,.04);display:flex;flex-direction:column;justify-content:space-between;gap:18px}
        .ep-access-badge{display:inline-flex;width:max-content;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:7px 12px;border-radius:999px;background:#f0fdf4;color:#166534;border:1px solid #dcfce7}
        .ep-access-title{margin:0;color:#111827;font-size:22px;line-height:1.25}
        .ep-access-desc{margin:0;color:#6b7280;line-height:1.8;font-size:14px}
        .ep-access-actions{display:flex;gap:12px;flex-wrap:wrap}
        .ep-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin-top:32px}
        .ep-step-card{background:#fff;border:1px solid #eef2f7;border-radius:22px;padding:22px;box-shadow:0 10px 24px rgba(15,23,42,.04);text-align:left}
        .ep-step-no{font-size:34px;font-weight:800;color:#166534;line-height:1;margin-bottom:12px}
        .ep-step-card h3{margin:0 0 10px;color:#111827;font-size:17px;line-height:1.4}
        .ep-step-card p{margin:0;color:#6b7280;font-size:14px;line-height:1.75}
        .ep-faq-wrap{margin-top:28px;border:1px solid #eef2f7;border-radius:24px;overflow:hidden;background:#fff;box-shadow:0 12px 26px rgba(15,23,42,.04)}
        .ep-faq-item{border-bottom:1px solid #eef2f7}
        .ep-faq-item:last-child{border-bottom:none}
        .ep-faq-btn{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;cursor:pointer;font-weight:700;color:#111827}
        .ep-faq-btn::-webkit-details-marker{display:none}
        .ep-faq-body{padding:0 22px 20px;color:#6b7280;line-height:1.8;font-size:14px;text-align:left}
        .ep-faq-chevron{font-size:22px;color:#9ca3af}
        .ep-footer{padding:26px 24px;border-top:1px solid #eef2f7;color:#6b7280;font-size:14px}
        @media (max-width: 1160px){
          .ep-access-grid{grid-template-columns:1fr 1fr}
          .ep-steps{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media (max-width: 960px){
          .ep-hero{grid-template-columns:1fr;gap:28px;padding-top:64px;padding-bottom:72px}
          .ep-mini-grid,.ep-highlights,.ep-access-grid{grid-template-columns:1fr}
          .ep-hero-title{font-size:40px}
        }
        @media (max-width: 640px){
          .ep-nav-inner,.ep-section,.ep-hero{padding-left:18px;padding-right:18px}
          .ep-nav-actions .ep-link-btn{display:none}
          .ep-hero-title{font-size:32px}
          .ep-primary-btn,.ep-secondary-btn{width:100%;justify-content:center}
          .ep-steps{grid-template-columns:1fr}
        }
      `}</style>

            <div className="ep-root">
                <div className="ep-nav">
                    <div className="ep-nav-inner">
                        <div className="ep-brand">
                            <div className="ep-brand-mark">P</div>
                            <div>
                                <div>Peken Banyumasan</div>
                                <div className="ep-brand-sub">Event Profile</div>
                            </div>
                        </div>
                        <div className="ep-nav-actions">
                            <button className="ep-link-btn" onClick={() => jumpTo('tentang')}>Tentang</button>
                            <button className="ep-link-btn" onClick={() => jumpTo('partisipasi')}>Partisipasi</button>
                            <button className="ep-link-btn" onClick={() => jumpTo('daftar-member')}>Daftar Member</button>
                            <button className="ep-link-btn" onClick={() => jumpTo('faq')}>FAQ</button>
                            <button className="ep-secondary-btn" onClick={goLogin}>Login</button>
                        </div>
                    </div>
                </div>

                <section className="ep-hero-wrap">
                    <div className="ep-hero">
                        <div>
                            <div className="ep-eyebrow">Portal Publik Peken Banyumasan</div>
                            <h1 className="ep-serif ep-hero-title">
                                Ruang publik untuk <span>Peken Banyumasan</span>.
                            </h1>
                            <p className="ep-hero-sub">
                                Informasi event, akses login, alur daftar member NFC, dan pilihan partisipasi ditempatkan dalam satu halaman yang tetap nyaman untuk pengunjung umum maupun pelaku UMKM.
                            </p>
                            <div className="ep-hero-actions">
                                <button className="ep-primary-btn" onClick={goLogin}>Login</button>
                                <button className="ep-secondary-btn" onClick={() => jumpTo('daftar-member')}>Lihat Alur Daftar Member</button>
                            </div>
                        </div>

                        <div className="ep-side-grid">
                            <div className="ep-side-card">
                                <div className="ep-mini-label">Event Mendatang</div>
                                <div className="ep-big">
                                    {eventLoading ? 'Memuat event…' : eventInfo?.nama_event || 'Belum ada event'}
                                </div>
                                <div className="ep-muted">
                                    {eventLoading
                                        ? 'Informasi event sedang diambil dari sistem.'
                                        : eventInfo
                                            ? `${formatEventDate(eventInfo.tanggal)}${eventInfo.lokasi ? ` · ${eventInfo.lokasi}` : ''}`
                                            : 'Informasi event akan tampil di sini saat sudah tersedia.'}
                                </div>
                            </div>
                            <div className="ep-mini-grid">
                                <div className="ep-side-card light">
                                    <div className="ep-mini-label">Status</div>
                                    <div className="ep-big" style={{ fontSize: 26 }}>{eventStatusText}</div>
                                    <div className="ep-muted">Data event mengikuti informasi yang tersedia di sistem.</div>
                                </div>
                                <div className="ep-side-card light">
                                    <div className="ep-mini-label">Akses</div>
                                    <div className="ep-big" style={{ fontSize: 26 }}>Login & Member</div>
                                    <div className="ep-muted">Akses penting dan alur daftar member berada dalam satu halaman publik.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="ep-section" id="tentang">
                    <h2 className="ep-serif ep-title">Satu halaman untuk keseluruhan event</h2>
                    <p className="ep-subtitle">
                        Halaman ini disusun untuk pengunjung umum dan calon tenant UMKM. Fokus utamanya tetap pada event, sementara login dan daftar member hadir sebagai jalur lanjutan yang tetap jelas.
                    </p>
                    <div className="ep-highlights">
                        {HIGHLIGHTS.map((item) => (
                            <div key={item.title} className="ep-highlight">
                                <div className="ep-highlight-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="ep-section ep-strip" id="partisipasi">
                    <h2 className="ep-serif ep-title">Pilihan partisipasi</h2>
                    <p className="ep-subtitle">
                        Login tersedia untuk pengguna yang sudah memiliki akun UMKM. Selain itu tersedia jalur daftar member NFC untuk pengunjung dan pendaftaran UMKM sebagai opsi yang relevan.
                    </p>

                    <div className="ep-access-grid">
                        <div className="ep-access-card">
                            <div className="ep-access-badge">Pengguna Terdaftar</div>
                            <h3 className="ep-access-title">Login</h3>
                            <p className="ep-access-desc">
                                Masuk ke sistem sesuai akun UMKM yang sudah dimiliki.
                            </p>
                            <div className="ep-access-actions">
                                <button className="ep-primary-btn" onClick={goLogin}>Login</button>
                            </div>
                        </div>

                        <div className="ep-access-card">
                            <div className="ep-access-badge">Pengunjung Event</div>
                            <h3 className="ep-access-title">Daftar Member NFC</h3>
                            <p className="ep-access-desc">
                                Lihat alur daftar member secara runtut tanpa pindah ke halaman lain. Tombol ini hanya mengarahkan ke section tutorial di halaman yang sama.
                            </p>
                            <div className="ep-access-actions">
                                <button className="ep-secondary-btn" onClick={() => jumpTo('daftar-member')}>Lihat Alur</button>
                            </div>
                        </div>

                        <div className="ep-access-card">
                            <div className="ep-access-badge">Pelaku Usaha</div>
                            <h3 className="ep-access-title">Daftar UMKM</h3>
                            <p className="ep-access-desc">
                                Pilihan bagi pelaku usaha yang ingin bergabung sebagai tenant.
                            </p>
                            <div className="ep-access-actions">
                                <button className="ep-secondary-btn" onClick={goUmkmRegister}>Daftar UMKM</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="ep-section" id="daftar-member">
                    <h2 className="ep-serif ep-title">Alur daftar member NFC</h2>
                    <p className="ep-subtitle">
                        Bagian ini menjelaskan langkah pendaftaran member secara singkat dan langsung. Jadi pengguna yang menekan menu atau tombol daftar member akan diarahkan ke sini, bukan dibawa ke halaman lain.
                    </p>
                    <div className="ep-steps">
                        {MEMBER_STEPS.map((item) => (
                            <div key={item.step} className="ep-step-card">
                                <div className="ep-step-no">{item.step}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="ep-section" id="faq">
                    <h2 className="ep-serif ep-title">Pertanyaan umum</h2>
                    <p className="ep-subtitle">
                        Ringkasan singkat untuk membantu pengunjung memahami konteks event dan pilihan akses yang tersedia.
                    </p>
                    <div className="ep-faq-wrap">
                        {FAQ.map((item) => (
                            <FaqItem key={item.q} item={item} />
                        ))}
                    </div>
                </section>

                <div className="ep-footer">
                    Peken Banyumasan · Halaman publik event.
                </div>
            </div>
        </>
    );
}
