import { useNavigate } from "react-router-dom";

export default function SelectRole() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f3f4f6",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        background: "white",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        borderRadius: "16px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "480px",
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 28, color: "#1a2e1f" }}>
          Pilih Role
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Pengunjung */}
          <div
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              border: "1.5px solid #e5e7eb",
              borderRadius: "12px",
              padding: "24px 16px",
              textAlign: "center",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1a2e1f", marginBottom: 8 }}>Pengunjung</h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Lihat informasi tanpa login</p>
          </div>

          {/* UMKM */}
          <div
            onClick={() => navigate("/login")}
            style={{
              cursor: "pointer",
              border: "1.5px solid #2f855a",
              borderRadius: "12px",
              padding: "24px 16px",
              textAlign: "center",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(47,133,90,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#2f855a", marginBottom: 8 }}>UMKM</h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Kelola usaha & kios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
