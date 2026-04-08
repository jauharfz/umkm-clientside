import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Home, Box, Book, Tag, FileText, Settings, User, Store, ShieldCheck } from "lucide-react";
import "../assets/styles/sidebar.css";
import logo from "../assets/images/logo.jpeg";
import ConfirmLogoutModal from "./modals/ConfirmLogoutModal";
import { getUser } from "../services/api";

export default function Sidebar({ open, setOpen, stokKritis = 0 }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogout, setShowLogout] = useState(false);

    // Ambil data user dari localStorage (di-set saat login & update profil)
    const user        = getUser();
    const namaUsaha   = user?.nama_usaha  || "Kios Saya";
    const stand       = user?.nomor_stand || "—";
    const zona        = user?.zona        || "—";
    const namaPemilik = user?.nama_pemilik || "Pengguna";
    const namaDepan   = namaPemilik.split(" ")[0];

    // Inisial avatar dari nama pemilik (maks 2 huruf)
    const inisial = namaPemilik
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    // ── PERBAIKAN UTAMA: semua path pakai /dashboard/... ─────────────────────
    // Sebelumnya path seperti "/" dan "/stok" tidak cocok dengan
    // nested routes di App.jsx (semua berada di bawah /dashboard/*),
    // sehingga navigasi selalu jatuh ke catch-all dan redirect balik ke /dashboard.
    const menu = [
        { path: "/dashboard",                  label: "Dashboard",         icon: <Home size={18} /> },
        { path: "/dashboard/stok",             label: "Manajemen Stok",    icon: <Box size={18} />, badge: stokKritis || null },
        { path: "/dashboard/kas",              label: "Buku Kas",          icon: <Book size={18} /> },
        { path: "/dashboard/promo",            label: "Promo & Diskon",    icon: <Tag size={18} /> },
        { path: "/dashboard/verifikasi-member",label: "Verifikasi Member", icon: <ShieldCheck size={18} /> },
        { path: "/dashboard/riwayat",          label: "Riwayat",           icon: <FileText size={18} /> },
    ];

    // Cek apakah route aktif — pakai startsWith agar nested path juga ter-highlight
    const isActive = (path) => {
        if (path === "/dashboard") {
            // Dashboard hanya aktif jika persis /dashboard, bukan /dashboard/stok dsb.
            return location.pathname === "/dashboard";
        }
        return location.pathname.startsWith(path);
    };

    const handleNav = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <>
            {open && <div className="sb-backdrop" onClick={() => setOpen(false)} />}

            <aside className={`sb ${open ? "open" : ""}`}>

                <div className="sb-top">
                    <div className="sb-event">
                        <img src={logo} alt="logo" />
                        <span>PEKEN BANYUMAS 2026</span>
                    </div>
                    <div className="sb-brand">
                        <span className="sb-brand-icon"><Store size={20} /></span>
                        <span className="sb-brand-dashboard">Dashboard</span>
                        <span className="sb-brand-umkm">UMKM</span>
                    </div>
                    <div className="sb-kios">
                        <p className="lbl">KIOS ANDA</p>
                        <h3>{namaUsaha}</h3>
                        <span>Stand {stand} · Zona {zona}</span>
                    </div>
                </div>

                <div className="sb-divider" />

                <div className="sb-scroll">
                    <div className="sb-nav">
                        <p className="lbl">MENU</p>
                        {menu.map((item) => (
                            <div
                                key={item.path}
                                className={`si ${isActive(item.path) ? "active" : ""}`}
                                onClick={() => handleNav(item.path)}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="si-label">{item.label}</span>
                                {item.badge > 0 && <span className="badge">{item.badge}</span>}
                            </div>
                        ))}
                    </div>

                    <div className="sb-akun">
                        <p className="lbl">AKUN</p>
                        <div
                            className={`si ${isActive("/dashboard/pengaturan") ? "active" : ""}`}
                            onClick={() => handleNav("/dashboard/pengaturan")}
                        >
                            <span className="icon"><Settings size={18} /></span>
                            <span className="si-label">Pengaturan</span>
                        </div>
                        <div
                            className={`si ${isActive("/dashboard/profile") ? "active" : ""}`}
                            onClick={() => handleNav("/dashboard/profile")}
                        >
                            <span className="icon"><User size={18} /></span>
                            <span className="si-label">Profile</span>
                        </div>
                    </div>
                </div>

                <div className="sb-divider" />
                <div className="sb-profile" onClick={() => setShowLogout(true)}>
                    <div className="avatar">{inisial}</div>
                    <div className="sb-profile-info">
                        <strong>{namaDepan}</strong>
                        <p>Pemilik · Stand {stand}</p>
                    </div>
                    <span className="sb-profile-arrow">›</span>
                </div>
            </aside>

            <ConfirmLogoutModal
                show={showLogout}
                onClose={() => setShowLogout(false)}
                userName={namaPemilik}
            />
        </>
    );
}