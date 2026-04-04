import { useState, useEffect } from "react";
import "../assets/styles/riwayat.css";
import api from "../services/api";

export default function Riwayat() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [openId, setOpenId]             = useState(null);

  useEffect(() => {
    api.get("/transaksi")
      .then(res => setTransactions(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) =>
    t.customer?.toLowerCase().includes(search.toLowerCase()) ||
    t.item?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csv = [
      ["ID", "Pelanggan", "Barang", "Total", "Waktu", "Status"],
      ...filtered.map((t) => [t.id, t.customer, t.item, t.total, t.time, t.status]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "transaksi.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rw-page">
      {/* TOPBAR */}
      <div className="rw-topbar">
        <div>
          <div className="rw-eyebrow">📋 Kios Saya</div>
          <div className="rw-title">
            Riwayat <em>Transaksi</em>
          </div>
          <div className="rw-subtitle">
            Semua transaksi dari kios Anda
          </div>
        </div>

        <div className="rw-topbar-actions">
          <div className="rw-search-box">
            <span className="rw-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="rw-btn-export" onClick={handleExport}>
            ⬇ Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rw-table-card">
        {loading ? (
          <p style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Memuat riwayat transaksi...</p>
        ) : (
          <table className="rw-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelanggan</th>
                <th>Barang</th>
                <th>Total</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trx) => {
                const isOpen = openId === trx.id;
                return (
                  <>
                    <tr key={trx.id} className="rw-row">
                      <td className="rw-td-id">#{trx.id}</td>
                      <td className="rw-td-customer">{trx.customer}</td>
                      <td>{trx.item}</td>
                      <td className="rw-td-total">Rp {(trx.total || 0).toLocaleString("id-ID")}</td>
                      <td className="rw-td-time">{trx.time}</td>
                      <td>
                        <span className={`rw-status ${trx.status === "Selesai" ? "rw-status-selesai" : "rw-status-proses"}`}>
                          {trx.status === "Selesai" ? "✓" : "⏳"} {trx.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`rw-btn-detail ${isOpen ? "rw-btn-detail-active" : ""}`}
                          onClick={() => setOpenId(isOpen ? null : trx.id)}
                        >
                          {isOpen ? "✕ Tutup" : "👁 Lihat"}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`detail-${trx.id}`} className="rw-detail-row">
                        <td colSpan="7">
                          <div className="rw-detail">
                            <div className="rw-detail-grid">
                              <span className="rw-detail-label">ID Transaksi</span>
                              <span className="rw-detail-value">#{trx.id}</span>

                              <span className="rw-detail-label">Pelanggan</span>
                              <span className="rw-detail-value">{trx.customer}</span>

                              <span className="rw-detail-label">Barang</span>
                              <span className="rw-detail-value">{trx.item}</span>

                              <span className="rw-detail-label">Total</span>
                              <span className="rw-detail-value rw-detail-highlight">
                                Rp {(trx.total || 0).toLocaleString("id-ID")}
                              </span>

                              <span className="rw-detail-label">Waktu</span>
                              <span className="rw-detail-value">{trx.time}</span>

                              {trx.kiosk && (
                                <>
                                  <span className="rw-detail-label">Kios</span>
                                  <span className="rw-detail-value">{trx.kiosk}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="rw-empty">Tidak ada transaksi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
