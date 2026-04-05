import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getToken } from "../services/api";
import api from "../services/api";

export default function Layout() {
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [stokKritis, setStokKritis] = useState(0);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    // Fetch jumlah stok kritis untuk badge Manajemen Stok di sidebar
    api.get("/dashboard")
      .then((res) => {
        const k = res?.data?.stats?.stok_kritis ?? 0;
        setStokKritis(k);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="app-layout">
      <Sidebar open={open} setOpen={setOpen} stokKritis={stokKritis} />
      <main className="main">
        <button className="menu-toggle" onClick={() => setOpen(!open)}>☰</button>
        <Outlet />
      </main>
    </div>
  );
}
