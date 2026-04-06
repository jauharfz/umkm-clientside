import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SelectRole from "./pages/auth/SelectRole";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Status from "./pages/auth/Status";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ManajemenStok from "./pages/ManajemenStok";
import BukuKas from "./pages/BukuKas";
import PromoDiskon from "./pages/PromoDiskon";
import Riwayat from "./pages/Riwayat";
import Pengaturan from "./pages/Pengaturan";
import Profile from "./pages/Profile";
import Notifikasi from "./pages/Notifikasi";
import { getToken } from "./services/api";

/**
 * PrivateRoute — Proteksi di level router.
 * Layout.jsx juga punya pengecekan token, tapi meletakkan guard
 * di sini memastikan redirect terjadi sebelum komponen apapun
 * dirender — mencegah akses sekilas ke halaman protected.
 *
 * Ini juga menutup celah di mana user dengan status 'pending' bisa
 * mengakses dashboard hanya dengan menavigasi langsung ke '/'.
 */
function PrivateRoute({ children }) {
    return getToken() ? children : <Navigate to="/login" replace />;
}

/**
 * PublicOnlyRoute — Jika sudah login dan membuka /login atau /register,
 * langsung redirect ke dashboard.
 */
function PublicOnlyRoute({ children }) {
    return getToken() ? <Navigate to="/" replace /> : children;
}

function App() {
    return (
        <BrowserRouter>
            <Toaster />

            <Routes>
                {/* ── PUBLIC — tidak memerlukan login ── */}
                <Route path="/select-role" element={<SelectRole />} />

                {/* /status tidak perlu login — user perlu cek status setelah register */}
                <Route path="/status" element={<Status />} />

                {/* /login & /register redirect ke dashboard kalau sudah login */}
                <Route
                    path="/login"
                    element={
                        <PublicOnlyRoute>
                            <Login />
                        </PublicOnlyRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicOnlyRoute>
                            <Register />
                        </PublicOnlyRoute>
                    }
                />

                {/* ── PROTECTED — harus sudah login ── */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="/notifikasi" element={<Notifikasi />} />
                    <Route path="stok" element={<ManajemenStok />} />
                    <Route path="kas" element={<BukuKas />} />
                    <Route path="promo" element={<PromoDiskon />} />
                    <Route path="riwayat" element={<Riwayat />} />
                    <Route path="pengaturan" element={<Pengaturan />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;