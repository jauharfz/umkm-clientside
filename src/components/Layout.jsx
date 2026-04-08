import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import api, { getToken } from "../services/api";

export default function Layout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stokKritis, setStokKritis] = useState(0);

  useEffect(() => {
    const handleLoggedOut = () => navigate("/login", { replace: true });

    if (!getToken()) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let mounted = true;

    const loadBadge = async () => {
      try {
        const res = await api.get("/dashboard");
        if (!mounted) return;
        setStokKritis(res?.data?.stats?.stok_kritis ?? 0);
      } catch {
        if (!mounted) return;
        setStokKritis(0);
      }
    };

    loadBadge();
    window.addEventListener("auth:logout", handleLoggedOut);

    return () => {
      mounted = false;
      window.removeEventListener("auth:logout", handleLoggedOut);
    };
  }, [navigate]);

  return (
    <div className="app-layout">
      <Sidebar open={open} setOpen={setOpen} stokKritis={stokKritis} />
      <main className="main">
        <button className="menu-toggle" onClick={() => setOpen((prev) => !prev)}>☰</button>
        <Outlet />
      </main>
    </div>
  );
}
