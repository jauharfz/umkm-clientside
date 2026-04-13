import { useState, useEffect } from "react";
import "../assets/styles/riwayat.css";
import api from "../services/api";

const fmt = n => `Rp ${(n||0).toLocaleString('id-ID')}`;

const DEMO_TRX = [
  { id:'TX001', customer:'Ani Susanti',   item:'Batik Sekar Jagad',    total:185000, time: new Date(Date.now()-3600000).toISOString(),   status:'Selesai' },
  { id:'TX002', customer:'Budi Santoso',  item:'Keripik Tempe 3pcs',   total:45000,  time: new Date(Date.now()-7200000).toISOString(),   status:'Selesai' },
  { id:'TX003', customer:'Citra Dewi',    item:'Kain Lurik 2m',        total:320000, time: new Date(Date.now()-10800000).toISOString(),  status:'Selesai' },
  { id:'TX004', customer:'Dian Pratiwi',  item:'Gula Semut 500g',      total:35000,  time: new Date(Date.now()-86400000).toISOString(),  status:'Selesai' },
  { id:'TX005', customer:'Eko Prasetyo',  item:'Tas Anyam Bambu',      total:210000, time: new Date(Date.now()-172800000).toISOString(), status:'Selesai' },
  { id:'TX006', customer:'Fitri Handayani',item:'Ondel Batik Mini',    total:95000,  time: new Date(Date.now()-172900000).toISOString(), status:'Selesai' },
  { id:'TX007', customer:'Galih Wibowo',  item:'Dawet Ayu 2pax',       total:28000,  time: new Date(Date.now()-259200000).toISOString(), status:'Proses'  },
];

export default function Riwayat() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [openId, setOpenId]             = useState(null);

  // komisiRate lifted to component level — used in both summary bar and each table row
  const komisiRate = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}')?.komisi_persen || 15; }
    catch { return 15; }
  })();

  useEffect(() => {
    api.get("/transaksi")
      .then(res => setTransactions(res.data || DEMO_TRX))
      .catch(() => setTransactions(DEMO_TRX))
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
          <div className="rw-title">Riwayat <em>Transaksi</em></div>
          <div className="rw-subtitle">Semua transaksi dari kios Anda</div>
        </div>

        <div className="rw-topbar-actions">
          <div className="rw-search-box">
            <span className="rw-search-icon">🔍</span>
            <input type="text" placeholder="Cari..." value={search}
              onChange={(e) => setSearch(e.target.value)}/>
          </div>
          <button className="rw-btn-export" onClick={handleExport}>⬇ Export</button>
        </div>
      </div>

      {/* SUMMARY BAR */}
      {(() => {
        const totalOmset  = filtered.reduce((a,t) => a+(t.total||0), 0);
        const totalKomisi = Math.round(totalOmset * komisiRate / 100);
        const totalDiterima = totalOmset - totalKomisi;
        const totalTrx    = filtered.length;
        return (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
            gap:12,marginBottom:20}}>
            {[
              { label:'Total Transaksi', value: totalTrx + ' trx', color:'#1a3a2a', bg:'#f0fdf4', border:'#bbf7d0' },
              { label:'Total Omset', value: fmt(totalOmset), color:'#1a3a2a', bg:'#f0fdf4', border:'#bbf7d0' },
              { label:`Komisi (${komisiRate}%)`, value: '−' + fmt(totalKomisi), color:'#c53030', bg:'#fff5f5', border:'#fed7d7' },
              { label:'Kamu Terima', value: fmt(totalDiterima), color:'#2f6f4e', bg:'#f0fdf4', border:'#86efac', bold:true },
            ].map(s => (
              <div key={s.label} style={{background:s.bg,border:`1px solid ${s.border}`,
                borderRadius:14,padding:'14px 16px'}}>
                <p style={{fontSize:11,fontWeight:600,color:'#6b7280',marginBottom:5,
                  textTransform:'uppercase',letterSpacing:'.04em'}}>{s.label}</p>
                <p style={{fontSize:s.bold?20:17,fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</p>
              </div>
            ))}
          </div>
        );
      })()}

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
                <th style={{color:'#dc2626'}}>Komisi (15%)</th>
                <th style={{color:'#16a34a'}}>Diterima</th>
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
                      <td style={{color:'#dc2626',fontWeight:600,fontSize:13}}>−Rp {(Math.round((trx.total||0)*(komisiRate/100))).toLocaleString("id-ID")}</td>
                      <td style={{color:'#16a34a',fontWeight:600,fontSize:13}}>Rp {(Math.round((trx.total||0)*(1-komisiRate/100))).toLocaleString("id-ID")}</td>
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
                        <td colSpan={9}>
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
                  <td colSpan="9" className="rw-empty">Tidak ada transaksi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
