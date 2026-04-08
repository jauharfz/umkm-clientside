/**
 * src/pages/VerifikasiMember.jsx
 * ──────────────────────────────
 * Halaman Verifikasi Member untuk kasir UMKM.
 *
 * FLOW:
 *   1. Kasir input NFC UID (via USB RFID Reader keyboard-emulator) ATAU Nomor HP
 *   2. Klik "Cek Member" → UMKM Frontend → UMKM Backend /api/member/lookup
 *   3. UMKM Backend → Gate Backend /api/members/lookup (dengan X-Member-Lookup-Key)
 *   4. Tampilkan status member + daftar promo aktif kios ini (semi-otomatis)
 *   5. Kasir centang promo yang digunakan → tampilkan ringkasan diskon
 *
 * SUPPORT NFC:
 *   - USB RFID Reader tipe keyboard-emulator: UID otomatis "diketik" ke input
 *     Ini yang paling umum (Plug & Play, tidak butuh driver/kode khusus).
 *   - Fallback: kasir input nomor HP secara manual
 *
 * CATATAN ENV:
 *   Tidak ada env var baru yang perlu ditambahkan di frontend.
 *   Secret key disimpan aman di UMKM Backend (GATE_LOOKUP_KEY).
 */

import { useState, useRef, useEffect } from "react";
import { CreditCard, Phone, Search, CheckCircle2, XCircle, Tag,
    Loader2, RotateCcw, AlertCircle, ShieldCheck } from "lucide-react";
import api from "../services/api";

// ── Helper format rupiah ──────────────────────────────────────────────────────
const fmtRupiah = (val) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

// ── Warna badge promo berdasarkan tipe ───────────────────────────────────────
const TIPE_COLOR = {
    Persentase:    { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
    Nominal:       { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
    BeliXGratisY:  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
    GratisOngkir:  { bg: "bg-sky-50",    border: "border-sky-200",    text: "text-sky-700"    },
    Lainnya:       { bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-600"   },
};

const promoColor = (tipe) => TIPE_COLOR[tipe] || TIPE_COLOR.Lainnya;

// ── Format label nilai promo ──────────────────────────────────────────────────
const fmtNilai = (tipe, nilai) => {
    if (tipe === "Persentase") return `${nilai}%`;
    if (tipe === "Nominal")    return fmtRupiah(parseInt(nilai, 10) || 0);
    return nilai;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function VerifikasiMember() {
    // ── Mode input: "uid" atau "no_hp" ───────────────────────────────────────
    const [mode, setMode] = useState("uid");

    // ── Input values ─────────────────────────────────────────────────────────
    const [uid, setUid]     = useState("");
    const [noHp, setNoHp]   = useState("");

    // ── Loading & result state ────────────────────────────────────────────────
    const [loading, setLoading]     = useState(false);
    const [member, setMember]       = useState(null);  // null = belum dicek
    const [notFound, setNotFound]   = useState(false);
    const [errMsg, setErrMsg]       = useState("");

    // ── Promo kios yang aktif ─────────────────────────────────────────────────
    const [promos, setPromos]       = useState([]);
    const [promoLoading, setPromoLoading] = useState(false);

    // ── Promo yang dipilih kasir ──────────────────────────────────────────────
    const [selected, setSelected]   = useState(new Set());

    // Ref untuk auto-focus input UID (supaya scan RFID langsung masuk)
    const uidRef = useRef(null);

    // Auto-focus UID input saat mode = uid
    useEffect(() => {
        if (mode === "uid" && uidRef.current) uidRef.current.focus();
    }, [mode]);

    // Fetch promo aktif kios saat komponen mount
    useEffect(() => {
        setPromoLoading(true);
        api.get("/promo")
            .then(res => {
                const aktif = (res.data || []).filter(p => p.status === "aktif");
                setPromos(aktif);
            })
            .catch(() => {})
            .finally(() => setPromoLoading(false));
    }, []);

    // ── Reset state ke kondisi awal ───────────────────────────────────────────
    const handleReset = () => {
        setUid("");
        setNoHp("");
        setMember(null);
        setNotFound(false);
        setErrMsg("");
        setSelected(new Set());
        setTimeout(() => {
            if (mode === "uid" && uidRef.current) uidRef.current.focus();
        }, 50);
    };

    // ── Submit: cek member ────────────────────────────────────────────────────
    const handleCek = async () => {
        const q = mode === "uid" ? uid.trim() : noHp.trim();
        if (!q) return;

        setLoading(true);
        setMember(null);
        setNotFound(false);
        setErrMsg("");
        setSelected(new Set());

        try {
            const params = mode === "uid" ? `uid=${encodeURIComponent(q)}` : `no_hp=${encodeURIComponent(q)}`;
            const res = await api.get(`/member/lookup?${params}`);
            setMember(res.data);
        } catch (err) {
            if (err.httpStatus === 404) {
                setNotFound(true);
            } else {
                setErrMsg(err.message || "Gagal menghubungi server. Coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Toggle pilih/batal promo ──────────────────────────────────────────────
    const togglePromo = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectedPromos = promos.filter(p => selected.has(p.id));

    // ── Keyboard shortcut: Enter → submit ─────────────────────────────────────
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleCek();
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="vm-page">
            <style>{`
                .vm-page { padding: 24px; max-width: 700px; font-family: sans-serif; }
                .vm-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
                .vm-card-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; background: #f9fafb;
                                  display: flex; align-items: center; gap: 10px; }
                .vm-card-header h3 { margin: 0; font-size: 15px; font-weight: 700; color: #1f2937; }
                .vm-card-header p  { margin: 2px 0 0; font-size: 12px; color: #9ca3af; }
                .vm-card-body  { padding: 20px; }
                .vm-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
                .vm-tab  { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
                           padding: 10px; border-radius: 10px; border: 1.5px solid #e5e7eb; font-size: 13px;
                           font-weight: 600; cursor: pointer; transition: all .15s; background: #fff; color: #6b7280; }
                .vm-tab.active { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
                .vm-input-row  { display: flex; gap: 10px; }
                .vm-input      { flex: 1; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px;
                                 font-size: 14px; outline: none; transition: border-color .15s; }
                .vm-input:focus { border-color: #16a34a; }
                .vm-btn-cek { display: flex; align-items: center; gap-6px; gap: 6px; background: #16a34a;
                              color: #fff; border: none; border-radius: 10px; padding: 10px 20px;
                              font-size: 14px; font-weight: 700; cursor: pointer; transition: background .15s;
                              white-space: nowrap; }
                .vm-btn-cek:hover:not(:disabled) { background: #15803d; }
                .vm-btn-cek:disabled { background: #86efac; cursor: not-allowed; }
                .vm-hint { font-size: 11px; color: #9ca3af; margin-top: 8px; }
                /* Result */
                .vm-result-aktif   { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-top: 16px; }
                .vm-result-nonaktif{ background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 16px; margin-top: 16px; }
                .vm-result-notfound{ background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 16px; margin-top: 16px; }
                .vm-result-err     { background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 16px; margin-top: 16px; }
                .vm-member-name    { font-size: 18px; font-weight: 800; color: #166534; margin: 0 0 4px; }
                .vm-member-sub     { font-size: 12px; color: #6b7280; }
                .vm-badge-aktif    { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7;
                                     color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px;
                                     border-radius: 999px; border: 1px solid #bbf7d0; margin-top: 6px; }
                .vm-badge-nonaktif { display: inline-flex; align-items: center; gap: 4px; background: #fee2e2;
                                     color: #991b1b; font-size: 11px; font-weight: 700; padding: 3px 10px;
                                     border-radius: 999px; border: 1px solid #fecaca; margin-top: 6px; }
                /* Promo list */
                .vm-promo-list { display: flex; flex-direction: column; gap: 8px; }
                .vm-promo-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px;
                                 border: 1.5px solid #e5e7eb; border-radius: 10px; cursor: pointer;
                                 transition: all .15s; background: #fff; }
                .vm-promo-item.selected { border-color: #16a34a; background: #f0fdf4; }
                .vm-promo-item:hover:not(.selected) { border-color: #d1d5db; background: #f9fafb; }
                .vm-promo-nilai { font-size: 20px; font-weight: 800; color: #1f2937; min-width: 56px; text-align: center; }
                .vm-promo-info  { flex: 1; min-width: 0; }
                .vm-promo-nama  { font-size: 13px; font-weight: 600; color: #374151; }
                .vm-promo-tipe  { font-size: 11px; color: #9ca3af; margin-top: 2px; }
                .vm-check       { width: 20px; height: 20px; border-radius: 999px; border: 2px solid #d1d5db;
                                  display: flex; align-items: center; justify-content: center; transition: all .15s; }
                .vm-check.checked { background: #16a34a; border-color: #16a34a; }
                /* Summary */
                .vm-summary { background: #1f2937; color: #fff; border-radius: 12px; padding: 16px 20px; margin-top: 20px; }
                .vm-summary h4 { margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #9ca3af; letter-spacing: .05em; text-transform: uppercase; }
                .vm-summary-item { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0;
                                    border-bottom: 1px solid #374151; }
                .vm-summary-item:last-child { border-bottom: none; font-weight: 700; font-size: 15px; }
                .vm-btn-reset { display: flex; align-items: center; gap: 6px; background: #f3f4f6; border: none;
                                border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 600;
                                cursor: pointer; color: #374151; transition: background .15s; }
                .vm-btn-reset:hover { background: #e5e7eb; }
                @media (max-width: 500px) {
                    .vm-page { padding: 14px; }
                    .vm-member-name { font-size: 15px; }
                    .vm-promo-nilai { font-size: 16px; min-width: 44px; }
                }
            `}</style>

            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#dcfce7",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldCheck size={18} color="#16a34a" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1f2937" }}>
                        Verifikasi Member
                    </h1>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                    Cek apakah pembeli adalah member aktif Peken Banyumasan untuk mendapat promo & diskon
                </p>
            </div>

            {/* ── CARD: INPUT ─────────────────────────────────────────────────── */}
            <div className="vm-card">
                <div className="vm-card-header">
                    <Search size={16} color="#6b7280" />
                    <div>
                        <h3>Identifikasi Pembeli</h3>
                        <p>Scan kartu NFC atau input nomor HP member</p>
                    </div>
                </div>
                <div className="vm-card-body">
                    {/* Mode tabs */}
                    <div className="vm-tabs">
                        <button
                            className={`vm-tab ${mode === "uid" ? "active" : ""}`}
                            onClick={() => { setMode("uid"); handleReset(); }}
                        >
                            <CreditCard size={15} /> Kartu NFC
                        </button>
                        <button
                            className={`vm-tab ${mode === "no_hp" ? "active" : ""}`}
                            onClick={() => { setMode("no_hp"); handleReset(); }}
                        >
                            <Phone size={15} /> Nomor HP
                        </button>
                    </div>

                    {/* Input + tombol cek */}
                    <div className="vm-input-row">
                        {mode === "uid" ? (
                            <input
                                ref={uidRef}
                                className="vm-input"
                                type="text"
                                placeholder="Scan kartu NFC atau ketik UID…"
                                value={uid}
                                onChange={e => setUid(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                                spellCheck={false}
                            />
                        ) : (
                            <input
                                className="vm-input"
                                type="tel"
                                placeholder="Contoh: 08123456789"
                                value={noHp}
                                onChange={e => setNoHp(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                            />
                        )}
                        <button
                            className="vm-btn-cek"
                            onClick={handleCek}
                            disabled={loading || !(mode === "uid" ? uid.trim() : noHp.trim())}
                        >
                            {loading
                                ? <><Loader2 size={15} className="animate-spin" /> Memeriksa…</>
                                : <><Search size={15} /> Cek Member</>
                            }
                        </button>
                    </div>

                    <p className="vm-hint">
                        {mode === "uid"
                            ? "💡 Hubungkan USB RFID Reader → tap kartu → UID otomatis terisi & langsung dicek"
                            : "💡 Minta pembeli menyebutkan nomor HP yang didaftarkan saat mendaftar member"
                        }
                    </p>

                    {/* Reset */}
                    {(member || notFound || errMsg) && (
                        <div style={{ marginTop: 12 }}>
                            <button className="vm-btn-reset" onClick={handleReset}>
                                <RotateCcw size={13} /> Cek Member Lain
                            </button>
                        </div>
                    )}

                    {/* ── Hasil verifikasi ─────────────────────────────── */}
                    {member && member.is_aktif && (
                        <div className="vm-result-aktif">
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <p className="vm-member-name">{member.nama}</p>
                                    <p className="vm-member-sub">
                                        HP: {member.no_hp_masked} &nbsp;·&nbsp;
                                        Dicek via: {member.lookup_by === "uid" ? "Kartu NFC" : "Nomor HP"}
                                    </p>
                                    <span className="vm-badge-aktif">
                                        <CheckCircle2 size={10} /> MEMBER AKTIF — Berhak Dapat Diskon
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {member && !member.is_aktif && (
                        <div className="vm-result-nonaktif">
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#92400e", fontSize: 15 }}>
                                        {member.nama}
                                    </p>
                                    <p className="vm-member-sub">HP: {member.no_hp_masked}</p>
                                    <span className="vm-badge-nonaktif">
                                        <XCircle size={10} /> MEMBER TIDAK AKTIF — Tidak Mendapat Diskon
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {notFound && (
                        <div className="vm-result-notfound">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <XCircle size={22} color="#dc2626" />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: "#991b1b", fontSize: 14 }}>
                                        Member tidak ditemukan
                                    </p>
                                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
                                        {mode === "uid"
                                            ? "UID kartu ini belum terdaftar. Coba lookup dengan nomor HP."
                                            : "Nomor HP ini belum terdaftar sebagai member."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errMsg && !notFound && (
                        <div className="vm-result-err">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <AlertCircle size={22} color="#d97706" />
                                <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>{errMsg}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CARD: PROMO KIOS (tampil setelah member aktif ditemukan) ──────── */}
            {member && member.is_aktif && (
                <div className="vm-card">
                    <div className="vm-card-header">
                        <Tag size={16} color="#6b7280" />
                        <div>
                            <h3>Pilih Promo yang Berlaku</h3>
                            <p>Centang promo yang ingin diterapkan untuk transaksi ini</p>
                        </div>
                    </div>
                    <div className="vm-card-body">
                        {promoLoading ? (
                            <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: 13 }}>
                                <Loader2 size={18} className="animate-spin" style={{ display: "inline" }} /> Memuat promo…
                            </div>
                        ) : promos.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "16px 0" }}>
                                <Tag size={32} color="#d1d5db" style={{ margin: "0 auto 8px", display: "block" }} />
                                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
                                    Kios Anda belum memiliki promo aktif.
                                </p>
                                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#d1d5db" }}>
                                    Tambahkan promo di menu Promo &amp; Diskon.
                                </p>
                            </div>
                        ) : (
                            <div className="vm-promo-list">
                                {promos.map(p => {
                                    const color = promoColor(p.tipe);
                                    const isSelected = selected.has(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            className={`vm-promo-item ${isSelected ? "selected" : ""}`}
                                            onClick={() => togglePromo(p.id)}
                                        >
                                            <div
                                                className={`vm-promo-nilai ${color.bg} ${color.text}`}
                                                style={{ borderRadius: 8, padding: "6px 0" }}
                                            >
                                                {fmtNilai(p.tipe, p.nilai)}
                                            </div>
                                            <div className="vm-promo-info">
                                                <div className="vm-promo-nama">{p.nama}</div>
                                                <div className="vm-promo-tipe">
                                                    <span
                                                        className={`${color.bg} ${color.text} ${color.border}`}
                                                        style={{ display: "inline-block", border: "1px solid", borderRadius: 4,
                                                            padding: "1px 6px", fontSize: 10, fontWeight: 600 }}
                                                    >
                                                        {p.tipe}
                                                    </span>
                                                    &nbsp; Berlaku s/d {p.akhir}
                                                </div>
                                            </div>
                                            <div className={`vm-check ${isSelected ? "checked" : ""}`}>
                                                {isSelected && <CheckCircle2 size={14} color="#fff" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── RINGKASAN DISKON YANG DIPILIH ─────────────────────────────────── */}
            {selectedPromos.length > 0 && (
                <div className="vm-summary">
                    <h4>Ringkasan Diskon Transaksi</h4>
                    {selectedPromos.map(p => (
                        <div key={p.id} className="vm-summary-item">
                            <span>{p.nama}</span>
                            <span style={{ color: "#4ade80", fontWeight: 700 }}>
                                {fmtNilai(p.tipe, p.nilai)}
                            </span>
                        </div>
                    ))}
                    <div className="vm-summary-item" style={{ marginTop: 8 }}>
                        <span>Jumlah promo diterapkan</span>
                        <span style={{ color: "#4ade80" }}>{selectedPromos.length} promo</span>
                    </div>
                    <p style={{ margin: "12px 0 0", fontSize: 11, color: "#9ca3af" }}>
                        ✅ Informasikan diskon di atas kepada kasir/sistem kasir secara manual.
                    </p>
                </div>
            )}
        </div>
    );
}