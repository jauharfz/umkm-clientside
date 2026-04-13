// src/App.jsx — UMKM Frontend (+ route /dashboard/event)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import CompanyProfile  from "./pages/CompanyProfile";
import Login           from "./pages/auth/Login";
import Register        from "./pages/auth/Register";
import Status          from "./pages/auth/Status";
import SelectRole      from "./pages/auth/SelectRole";

import Layout          from "./components/Layout";
import Dashboard       from "./pages/Dashboard";
import ManajemenStok   from "./pages/ManajemenStok";
import BukuKas         from "./pages/BukuKas";
import PromoDiskon     from "./pages/PromoDiskon";
import Riwayat         from "./pages/Riwayat";
import Pengaturan      from "./pages/Pengaturan";
import Profile         from "./pages/Profile";
import Notifikasi      from "./pages/Notifikasi";
import Kasir           from "./pages/Kasir";
import Event           from "./pages/Event";      // 🆕

import { getToken } from "./services/api";

function PublicOnlyRoute({ children }) {
    return getToken() ? <Navigate to="/dashboard" replace /> : children;
}
function PrivateRoute({ children }) {
    return getToken() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                {/* Landing / publik */}
                <Route path="/" element={<CompanyProfile />} />

                {/* Auth */}
                <Route path="/login"       element={<PublicOnlyRoute><Login    /></PublicOnlyRoute>} />
                <Route path="/daftar"      element={<PublicOnlyRoute><SelectRole /></PublicOnlyRoute>} />
                <Route path="/daftar-umkm" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
                <Route path="/status"      element={<Status />} />

                {/* Legacy redirects */}
                <Route path="/register"      element={<Navigate to="/daftar-umkm" replace />} />
                <Route path="/select-role"   element={<Navigate to="/"            replace />} />
                <Route path="/daftar-member" element={<Navigate to="/"            replace />} />

                {/* Protected */}
                <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index                    element={<Dashboard />} />
                    <Route path="event"             element={<Event />} />           {/* 🆕 */}
                    <Route path="notifikasi"        element={<Notifikasi />} />
                    <Route path="stok"              element={<ManajemenStok />} />
                    <Route path="kas"               element={<BukuKas />} />
                    <Route path="promo"             element={<PromoDiskon />} />
                    <Route path="kasir"             element={<Kasir />} />
                    <Route path="riwayat"           element={<Riwayat />} />
                    <Route path="pengaturan"        element={<Pengaturan />} />
                    <Route path="profile"           element={<Profile />} />
                    <Route path="verifikasi-member" element={<Navigate to="/dashboard/kasir" replace />} />
                    <Route path="company-profile"   element={<CompanyProfile />} />
                </Route>

                <Route path="*" element={getToken() ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
