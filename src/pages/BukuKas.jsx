import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Flame,
  Receipt,
  Banknote,
  FileText,
  Download
} from "lucide-react";
import KasTable from "../components/BukuKas/KasTable";
import TambahKasModal from "../components/modals/TambahKasModal";
import EditKasModal from "../components/modals/EditKasModal";
import ConfirmDeleteKasModal from "../components/modals/ConfirmDeleteKasModal";
import Toast from "../components/BukuKas/Toast";
import "../assets/styles/kas.css";
import api, { getUser } from "../services/api";

const fmt = (angka) => new Intl.NumberFormat("id-ID").format(angka);

export default function BukuKas() {
  const user      = getUser();
  const namaUsaha = user?.nama_usaha  || "Kios Saya";
  const stand     = user?.nomor_stand || "—";
  // FIX: Pisahkan state ringkasan dan transaksi sesuai respons backend
  // Backend: { status, data: { ringkasan: {...}, transaksi: [...] } }
  const [data, setData]             = useState([]);        // array transaksi
  const [ringkasan, setRingkasan]   = useState(null);      // objek ringkasan dari backend
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("semua");
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast, setToast]           = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ── FETCH ──
  useEffect(() => {
    fetchKas();
  }, []);

  const fetchKas = async () => {
    setLoading(true);
    const DEMO = {
      ringkasan: { total_masuk:4850000, total_keluar:1240000, saldo:3610000, count_masuk:12, count_keluar:5 },
      transaksi: [
        { id:'k1', tgl:'2025-04-12', ket:'Penjualan batik',   kategori:'Penjualan', jenis:'masuk',  nominal:320000, saldo:3610000 },
        { id:'k2', tgl:'2025-04-12', ket:'Beli bahan baku',   kategori:'Belanja',   jenis:'keluar', nominal:150000, saldo:3290000 },
        { id:'k3', tgl:'2025-04-11', ket:'Penjualan keripik', kategori:'Penjualan', jenis:'masuk',  nominal:85000,  saldo:3440000 },
        { id:'k4', tgl:'2025-04-10', ket:'Biaya parkir',      kategori:'Operasional',jenis:'keluar',nominal:25000,  saldo:3355000 },
        { id:'k5', tgl:'2025-04-10', ket:'Penjualan kain',    kategori:'Penjualan', jenis:'masuk',  nominal:640000, saldo:3380000 },
      ],
    };
    try {
      const res = await api.get("/kas");
      setData(res.data?.transaksi || DEMO.transaksi);
      setRingkasan(res.data?.ringkasan || DEMO.ringkasan);
    } catch {
      setData(DEMO.transaksi);
      setRingkasan(DEMO.ringkasan);
    } finally {
      setLoading(false);
    }
  };

  // ── SUMMARY — gunakan ringkasan dari backend jika tersedia ──
  // Fallback ke hitung manual dari array jika ringkasan belum ada
  const totalMasuk  = ringkasan?.total_masuk  ?? data.filter(d => d.jenis === "masuk" ).reduce((a, b) => a + b.nominal, 0);
  const totalKeluar = ringkasan?.total_keluar ?? data.filter(d => d.jenis === "keluar").reduce((a, b) => a + b.nominal, 0);
  const saldo       = ringkasan?.saldo        ?? (totalMasuk - totalKeluar);
  const cntMasuk    = ringkasan?.count_masuk  ?? data.filter(d => d.jenis === "masuk" ).length;
  const cntKeluar   = ringkasan?.count_keluar ?? data.filter(d => d.jenis === "keluar").length;

  // ── FILTER ──
  const filteredData = filter === "semua" ? data : data.filter(d => d.jenis === filter);

  // ── TAMBAH ──
  const handleAdd = async (item) => {
    try {
      // FIX: field names sesuai backend (tgl/ket bukan tanggal/keterangan)
      const res = await api.post("/kas", {
        tgl:      item.tgl,
        ket:      item.ket,
        jenis:    item.jenis,
        nominal:  item.nominal,
        kategori: item.kategori,
      });
      // Setelah tambah, refresh seluruh data agar running saldo akurat
      await fetchKas();
      setShowModal(false);
      showToast("✅ Transaksi berhasil disimpan!");
    } catch {
      showToast("⚠️ Gagal menyimpan transaksi");
    }
  };

  // ── EDIT ──
  const handleUpdate = async (updated) => {
    try {
      // FIX: gunakan PUT (bukan PATCH) sesuai backend router
      // FIX: field names sesuai backend (tgl/ket)
      await api.put(`/kas/${updated.id}`, {
        tgl:      updated.tgl,
        ket:      updated.ket,
        jenis:    updated.jenis,
        nominal:  updated.nominal,
        kategori: updated.kategori,
      });
      // Refresh untuk recalc running saldo
      await fetchKas();
      setEditItem(null);
      showToast("✏️ Data berhasil diupdate!");
    } catch {
      showToast("⚠️ Gagal mengupdate data");
    }
  };

  // ── HAPUS ──
  const handleDelete = async () => {
    try {
      await api.delete(`/kas/${deleteItem.id}`);
      await fetchKas();
      setDeleteItem(null);
      showToast("🗑️ Data berhasil dihapus!");
    } catch {
      showToast("⚠️ Gagal menghapus data");
    }
  };

  // ── EXPORT CSV ──
  const handleExport = () => {
    const header = ["#", "Tanggal", "Keterangan", "Kategori", "Jenis", "Nominal", "Saldo"];
    const rows   = filteredData.map((item, i) => [
      i + 1, item.tgl, item.ket, item.kategori, item.jenis, item.nominal, item.saldo,
    ]);
    const csv    = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob   = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement("a");
    link.href    = url;
    link.download = "buku_kas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* ── TOPBAR ── */}
      <div className="bk-topbar">
        <div>
          <div className="pg-eye">
            <Wallet size={14} />
            KEUANGAN KIOS</div>
          <div className="pg-title">Buku <em>Kas</em></div>
          <div className="pg-sub">Catat pemasukan &amp; pengeluaran · Stand {stand} · {namaUsaha}</div>
        </div>

        <div className="bk-topbar-right">
          <button
            className={`bk-filter-btn ${filter === "semua" ? "active" : ""}`}
            onClick={() => setFilter("semua")}
          >
            Semua
          </button>
          <button
            className={`bk-filter-btn ${filter === "masuk" ? "active-masuk" : ""}`}
            onClick={() => setFilter("masuk")}
          >
            <ArrowDownCircle size={14} />
            Masuk
          </button>
          <button
            className={`bk-filter-btn ${filter === "keluar" ? "active-keluar" : ""}`}
            onClick={() => setFilter("keluar")}
          >
            <ArrowUpCircle size={14} />
            Keluar
          </button>

          <button className="bk-btn-add" onClick={() => setShowModal(true)}>
            ＋ Tambah Transaksi
          </button>
        </div>
      </div>

      {/* ── SUMMARY ── */}
      <div className="bk-summary">
        <div className="bk-sum-card saldo">
          <div className="bk-sum-label">
            <Flame size={14} />
            SALDO SAAT INI
          </div>
          <div className="bk-sum-val">
            {loading ? "—" : `Rp ${fmt(saldo)}`}
          </div>
          <div className="bk-sum-sub">Diperbarui otomatis</div>
        </div>
        <div className="bk-sum-card masuk">
          <div className="bk-sum-label"><Receipt size={14} />TOTAL PEMASUKAN</div>
          <div className="bk-sum-val">{loading ? "—" : `Rp ${fmt(totalMasuk)}`}</div>
          <div className="bk-sum-sub">{cntMasuk} transaksi masuk</div>
        </div>
        <div className="bk-sum-card keluar">
          <div className="bk-sum-label">
            <Banknote size={14} />
            TOTAL PENGELUARAN
          </div>
          <div className="bk-sum-val">{loading ? "—" : `Rp ${fmt(totalKeluar)}`}</div>
          <div className="bk-sum-sub">{cntKeluar} transaksi keluar</div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bk-card">
        <div className="bk-card-head">
          <div className="bk-card-head-left">
            <h3><FileText size={16} />Daftar Transaksi Kas</h3>
            <p>{namaUsaha} · Stand {stand}</p>
          </div>
          <button className="bk-btn-export" onClick={handleExport}>
            <Download size={14} />
            Export
          </button>
        </div>

        {loading ? (
          <p style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Memuat data...</p>
        ) : (
          <KasTable
            data={filteredData}
            formatRupiah={fmt}
            onEdit={(item)   => setEditItem(item)}
            onDelete={(item) => setDeleteItem(item)}
          />
        )}
      </div>

      {/* ── MODALS ── */}
      <TambahKasModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAdd}
      />

      <EditKasModal
        show={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleUpdate}
      />

      <ConfirmDeleteKasModal
        show={!!deleteItem}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />

      {/* ── TOAST ── */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
