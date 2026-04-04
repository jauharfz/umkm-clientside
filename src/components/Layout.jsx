import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getToken } from "../services/api";

export default function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Cek token JWT, bukan flag isLogin
    if (!getToken()) {
      navigate("/login");
    }
  }, []);

  const [open, setOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={open} setOpen={setOpen} />

      <main className="main">
        <button 
          className="menu-toggle"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <Outlet />
      </main>
    </div>
  );
}
