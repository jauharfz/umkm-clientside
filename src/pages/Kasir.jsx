/**
 * src/pages/Kasir.jsx
 * ─────────────────────────────────────────────
 * Halaman Kasir / POS (Point of Sale) UMKM.
 *
 * FITUR:
 *   • Pilih produk dari daftar stok → keranjang (multi-item, qty +/-)
 *   • Verifikasi member (NFC UID atau No HP) → inline, tidak di halaman terpisah
 *   • Promo otomatis muncul jika pembeli member aktif
 *   • Kalkulasi diskon: Persentase & Nominal dihitung otomatis
 *   • Metode pembayaran: Tunai (dengan kalkulasi kembalian) atau QRIS
 *   • Checkout → otomatis:
 *       1. POST /api/transaksi   — catat riwayat penjualan
 *       2. POST /api/kas         — catat pemasukan di buku kas
 *       3. PUT  /api/stok/{id}   — kurangi stok tiap item di keranjang
 *
 * CATATAN ARSITEKTUR:
 *   • Member lookup via /api/member/lookup (proxy ke Gate Backend)
 *   • Halaman ini menggantikan VerifikasiMember.jsx
 *   • Route lama /dashboard/verifikasi-member diubah ke /dashboard/kasir
 */

import { useState, useEffect, useRef } from "react";
import {
    ShoppingCart, Search, CreditCard, Smartphone,
    User, Tag, CheckCircle2, XCircle, Loader2,
    RotateCcw, AlertCircle, ShoppingBag, Zap
} from "lucide-react";
import api, { getUser, setUser } from "../services/api";
import "../assets/styles/kasir.css";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("id-ID").format(n ?? 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;
const todayISO = () => new Date().toISOString().split("T")[0];

// Hitung diskon dari promo yang dipilih terhadap subtotal
function hitungDiskon(promos, subtotal) {
    let total = 0;
    for (const p of promos) {
        if (p.tipe === "Persentase") {
            const pct = parseFloat(p.nilai) || 0;
            total += Math.round(subtotal * (pct / 100));
        } else if (p.tipe === "Nominal") {
            total += parseInt(p.nilai, 10) || 0;
        }
        // BeliXGratisY, GratisOngkir, Lainnya: ditampilkan, tidak dihitung otomatis
    }
    return Math.min(total, subtotal); // diskon tidak boleh melebihi subtotal
}

function badgeClass(tipe) {
    if (tipe === "Persentase") return "";
    if (tipe === "Nominal")    return "nominal";
    return "other";
}

function fmtNilaiPromo(tipe, nilai) {
    if (tipe === "Persentase") return `${nilai}%`;
    if (tipe === "Nominal")    return fmtRp(parseInt(nilai, 10) || 0);
    return nilai;
}

// ──────────────────────────────────────────────────────────────────────────

export default function Kasir() {
    const user      = getUser();
    const namaUsaha = user?.nama_usaha  || "Kios Saya";
    const stand     = user?.nomor_stand || "—";

    // Foto QRIS: load dari API agar selalu fresh (tidak hanya dari localStorage)
    const [qrisUrl, setQrisUrl] = useState(user?.qris_url || null);
    useEffect(() => {
        api.get("/profil")
            .then(res => {
                const url = res?.data?.qris_url || null;
                setQrisUrl(url);
                // Sinkronisasi ke localStorage agar sesi berikutnya langsung tersedia
                const cur = getUser();
                if (cur) setUser({ ...cur, qris_url: url });
            })
            .catch(() => {});
    }, []);

    // ── Daftar produk ──────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [loadingProd, setLoadingProd] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/stok")
            .then(res => setProducts(res.data || []))
            .catch(() => {})
            .finally(() => setLoadingProd(false));
    }, []);

    const filtered = products.filter(p =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.kategori?.toLowerCase().includes(search.toLowerCase())
    );

    // ── Keranjang ──────────────────────────────────────────────────────────
    const [cart, setCart] = useState([]); // [{ ...product, qty }]

    const addToCart = (product) => {
        if (product.stok <= 0) return;
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                // Batasi qty ≤ stok tersedia
                if (existing.qty >= product.stok) return prev;
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const changeQty = (id, delta) => {
        setCart(prev => prev
            .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
            .filter(i => i.qty > 0)
        );
    };

    const clearCart = () => {
        setCart([]);
        resetMember();
        setPayMethod("tunai");
        setUangDiterima("");
    };

    const subtotal = cart.reduce((s, i) => s + i.harga * i.qty, 0);
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);

    // ── Member lookup ──────────────────────────────────────────────────────
    const [memberMode, setMemberMode] = useState("uid"); // "uid" | "no_hp"
    const [inputVal, setInputVal]     = useState("");
    const [memberLoading, setMemberLoading] = useState(false);
    const [member, setMember]         = useState(null);  // data member jika ditemukan
    const [memberStatus, setMemberStatus] = useState("idle"); // "idle"|"found"|"not_found"|"umum"

    // Promo aktif kios (dari /api/promo)
    const [allPromos, setAllPromos]   = useState([]);
    useEffect(() => {
        api.get("/promo")
            .then(res => setAllPromos((res.data || []).filter(p => p.status === "aktif")))
            .catch(() => {});
    }, []);

    // Promo yang dipilih kasir (hanya saat member found)
    const [selectedPromos, setSelectedPromos] = useState([]);

    const uidRef = useRef(null);
    useEffect(() => {
        if (memberMode === "uid" && uidRef.current) uidRef.current.focus();
    }, [memberMode]);

    const resetMember = () => {
        setInputVal("");
        setMember(null);
        setMemberStatus("idle");
        setSelectedPromos([]);
    };

    const handleLookup = async () => {
        if (!inputVal.trim()) return;
        setMemberLoading(true);
        setMember(null);
        setMemberStatus("idle");
        setSelectedPromos([]);
        try {
            const params = memberMode === "uid"
                ? { uid: inputVal.trim() }
                : { no_hp: inputVal.trim() };
            const res = await api.get("/member/lookup", { params });
            setMember(res.data);
            setMemberStatus("found");
        } catch (err) {
            if (err.httpStatus === 404) {
                setMemberStatus("not_found");
            } else {
                setMemberStatus("not_found");
            }
        } finally {
            setMemberLoading(false);
        }
    };

    const setUmum = () => {
        resetMember();
        setMemberStatus("umum");
    };

    // Enter key di input member → lookup
    const handleMemberKeyDown = (e) => {
        if (e.key === "Enter") handleLookup();
    };

    const togglePromo = (promo) => {
        setSelectedPromos(prev =>
            prev.find(p => p.id === promo.id)
                ? prev.filter(p => p.id !== promo.id)
                : [...prev, promo]
        );
    };

    const diskonTotal = memberStatus === "found"
        ? hitungDiskon(selectedPromos, subtotal)
        : 0;

    const grandTotal = Math.max(0, subtotal - diskonTotal);

    // ── Pembayaran ─────────────────────────────────────────────────────────
    const [payMethod, setPayMethod]     = useState("tunai"); // "tunai" | "qris"
    const [uangDiterima, setUangDiterima] = useState("");

    const uangNum    = parseInt(uangDiterima.replace(/\D/g,""), 10) || 0;
    const kembalian  = Math.max(0, uangNum - grandTotal);
    const kurangBayar = payMethod === "tunai" && uangNum > 0 && uangNum < grandTotal;

    // ── Konfirmasi & Submit ────────────────────────────────────────────────
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [flashMsg, setFlashMsg]       = useState("");

    const canBayar =
        cart.length > 0 &&
        memberStatus !== "idle" &&
        (payMethod === "qris" || (payMethod === "tunai" && uangNum >= grandTotal));

    const showFlash = (msg) => {
        setFlashMsg(msg);
        setTimeout(() => setFlashMsg(""), 2800);
    };

    const handleCheckout = async () => {
        setSubmitting(true);
        try {
            // Deskripsi item sebagai string (standar field `item` di tabel transaksi)
            const itemStr = cart
                .map(i => `${i.nama} x${i.qty}`)
                .join(", ");

            const customerName =
                memberStatus === "found" && member?.nama
                    ? member.nama
                    : "Umum";

            const promoNote = selectedPromos.length > 0
                ? ` [Promo: ${selectedPromos.map(p => p.nama).join(", ")}]`
                : "";

            // 1. Catat transaksi
            await api.post("/transaksi", {
                customer: customerName,
                item:     itemStr,
                total:    grandTotal,
                status:   "Selesai",
            });

            // 2. Catat buku kas (pemasukan)
            const metodePay = payMethod === "tunai" ? "Tunai" : "QRIS";
            await api.post("/kas", {
                tgl:      todayISO(),
                ket:      `Penjualan${promoNote} — ${itemStr} (${metodePay})`,
                jenis:    "masuk",
                nominal:  grandTotal,
                kategori: "Penjualan",
            });

            // 3. Kurangi stok tiap item
            await Promise.all(
                cart.map(item =>
                    api.put(`/stok/${item.id}`, {
                        nama:      item.nama,
                        stok:      Math.max(0, item.stok - item.qty),
                        harga:     item.harga,
                        kategori:  item.kategori,
                        satuan:    item.satuan,
                        deskripsi: item.deskripsi,
                    })
                )
            );

            // Perbarui daftar produk lokal agar stok langsung update di UI
            setProducts(prev =>
                prev.map(p => {
                    const inCart = cart.find(c => c.id === p.id);
                    return inCart ? { ...p, stok: Math.max(0, p.stok - inCart.qty) } : p;
                })
            );

            // Reset
            clearCart();
            setShowConfirm(false);
            showFlash(`✅ Transaksi ${fmtRp(grandTotal)} berhasil dicatat!`);

        } catch (err) {
            alert(err.message || "Gagal memproses transaksi. Coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="ks-page">

            {/* TOPBAR */}
            <div className="ks-topbar">
                <div>
                    <div className="pg-eye"><ShoppingBag size={14} />KASIR KIOS</div>
                    <div className="pg-title">Kasir <em>POS</em></div>
                    <div className="pg-sub">Stand {stand} · {namaUsaha}</div>
                </div>
                <div className="ks-topbar-right">
                    {cart.length > 0 && (
                        <button className="ks-cart-clear" onClick={clearCart}>
                            Kosongkan Keranjang
                        </button>
                    )}
                </div>
            </div>

            {/* CONTENT: produk kiri + cart kanan */}
            <div className="ks-content">

                {/* ── PANEL PRODUK ── */}
                <div className="ks-products">
                    <div className="ks-search-bar">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {loadingProd ? (
                        <div className="ks-loading">Memuat produk...</div>
                    ) : filtered.length === 0 ? (
                        <div className="ks-empty-products">
                            {search ? `Tidak ada produk "${search}"` : "Belum ada produk. Tambah di Manajemen Stok."}
                        </div>
                    ) : (
                        <div className="ks-product-grid">
                            {filtered.map(p => {
                                const habis = p.stok <= 0;
                                const warn  = p.stok > 0 && p.stok <= 5;
                                const inCart = cart.find(c => c.id === p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`ks-product-card ${habis ? "disabled" : ""}`}
                                        onClick={() => addToCart(p)}
                                        title={habis ? "Stok habis" : `Tambah ${p.nama} ke keranjang`}
                                    >
                                        {/* Foto produk */}
                                        <div className="ks-product-thumb">
                                            {p.foto_url
                                                ? <img src={p.foto_url} alt={p.nama} className="ks-product-thumb-img" />
                                                : <span className="ks-product-thumb-icon">📦</span>
                                            }
                                        </div>
                                        <div className="ks-product-cat">{p.kategori || "Lainnya"}</div>
                                        <div className="ks-product-nama">{p.nama}</div>
                                        <div className="ks-product-harga">{fmtRp(p.harga)}</div>
                                        <div className={`ks-product-stok ${habis ? "habis" : warn ? "warn" : ""}`}>
                                            {habis ? "Stok habis" : warn ? `⚠ Sisa ${p.stok} ${p.satuan || ""}` : `Stok ${p.stok} ${p.satuan || ""}`}
                                        </div>
                                        {inCart && (
                                            <div className="ks-product-add-badge">{inCart.qty}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── PANEL KERANJANG ── */}
                <div className="ks-cart">

                    {/* Header */}
                    <div className="ks-cart-header">
                        <h3>
                            <ShoppingCart size={16} />
                            Keranjang
                            {totalItems > 0 && <span className="ks-cart-count">{totalItems}</span>}
                        </h3>
                        {cart.length > 0 && (
                            <button className="ks-cart-clear" onClick={clearCart}>Kosongkan</button>
                        )}
                    </div>

                    {/* Cart items */}
                    <div className="ks-cart-items">
                        {cart.length === 0 ? (
                            <div className="ks-cart-empty">
                                Belum ada produk.<br />Ketuk produk di sebelah kiri untuk menambahkan.
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="ks-cart-item">
                                    <div className="ks-cart-item-info">
                                        <div className="ks-cart-item-nama">{item.nama}</div>
                                        <div className="ks-cart-item-harga">{fmtRp(item.harga)} / {item.satuan || "pcs"}</div>
                                    </div>
                                    <div className="ks-qty-ctrl">
                                        <button
                                            className="ks-qty-btn minus"
                                            onClick={() => changeQty(item.id, -1)}
                                        >−</button>
                                        <span className="ks-qty-val">{item.qty}</span>
                                        <button
                                            className="ks-qty-btn"
                                            onClick={() => changeQty(item.id, +1)}
                                            disabled={item.qty >= item.stok}
                                        >+</button>
                                    </div>
                                    <div className="ks-cart-item-subtotal">{fmtRp(item.harga * item.qty)}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── MEMBER SECTION ── */}
                    <div className="ks-divider" />
                    <div className="ks-section">
                        <div className="ks-section-title">
                            <User size={12} /> Pembeli
                        </div>

                        {/* Mode toggle */}
                        {memberStatus === "idle" && (
                            <>
                                <div className="ks-member-mode">
                                    <button
                                        className={`ks-mode-btn ${memberMode === "uid" ? "active" : ""}`}
                                        onClick={() => { setMemberMode("uid"); setInputVal(""); }}
                                    >
                                        <Zap size={12} /> NFC / UID
                                    </button>
                                    <button
                                        className={`ks-mode-btn ${memberMode === "no_hp" ? "active" : ""}`}
                                        onClick={() => { setMemberMode("no_hp"); setInputVal(""); }}
                                    >
                                        <Smartphone size={12} /> No. HP
                                    </button>
                                </div>

                                <div className="ks-member-input-row">
                                    <input
                                        ref={memberMode === "uid" ? uidRef : null}
                                        className="ks-member-input"
                                        type={memberMode === "no_hp" ? "tel" : "text"}
                                        placeholder={memberMode === "uid" ? "Scan kartu NFC..." : "08xxxxxxxxxx"}
                                        value={inputVal}
                                        onChange={e => setInputVal(e.target.value)}
                                        onKeyDown={handleMemberKeyDown}
                                    />
                                    <button
                                        className="ks-btn-cek"
                                        onClick={handleLookup}
                                        disabled={memberLoading || !inputVal.trim()}
                                    >
                                        {memberLoading ? <Loader2 size={14} className="spin" /> : "Cek"}
                                    </button>
                                    <button className="ks-btn-reset-member" onClick={setUmum} title="Tandai sebagai pengunjung umum">
                                        Umum
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Hasil lookup */}
                        {memberStatus === "found" && member && (
                            <div>
                                <div className="ks-member-result found">
                                    <span className="ks-member-icon">🪪</span>
                                    <div>
                                        <div className="ks-member-name"><CheckCircle2 size={12} style={{color:"#16a34a",marginRight:4}} />{member.nama}</div>
                                        <div className="ks-member-sub">Member aktif · {member.no_hp || member.nfc_uid || ""}</div>
                                    </div>
                                    <button className="ks-btn-reset-member" onClick={resetMember} style={{marginLeft:"auto"}}>
                                        <RotateCcw size={12} />
                                    </button>
                                </div>

                                {/* Promo kios untuk member ini */}
                                {allPromos.length > 0 && (
                                    <div className="ks-promo-list">
                                        <div className="ks-section-title" style={{marginTop:10,marginBottom:6}}>
                                            <Tag size={11} /> Promo Berlaku
                                        </div>
                                        {allPromos.map(p => {
                                            const checked = !!selectedPromos.find(s => s.id === p.id);
                                            return (
                                                <label
                                                    key={p.id}
                                                    className={`ks-promo-item ${checked ? "checked" : ""}`}
                                                    onClick={() => togglePromo(p)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {}}
                                                    />
                                                    <span className="ks-promo-nama">{p.nama}</span>
                                                    <span className={`ks-promo-badge ${badgeClass(p.tipe)}`}>
                            {fmtNilaiPromo(p.tipe, p.nilai)}
                          </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {memberStatus === "not_found" && (
                            <div className="ks-member-result not-found">
                                <span className="ks-member-icon">❌</span>
                                <div>
                                    <div className="ks-member-name">Member tidak ditemukan</div>
                                    <div className="ks-member-sub">Lanjutkan sebagai pengunjung umum?</div>
                                </div>
                                <button className="ks-btn-reset-member" onClick={resetMember} style={{marginLeft:"auto"}}>
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                        )}

                        {memberStatus === "umum" && (
                            <div className="ks-member-result umum">
                                <span className="ks-member-icon">👤</span>
                                <div>
                                    <div className="ks-member-name">Pengunjung Umum</div>
                                    <div className="ks-member-sub">Tidak ada diskon member</div>
                                </div>
                                <button className="ks-btn-reset-member" onClick={resetMember} style={{marginLeft:"auto"}}>
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── RINGKASAN HARGA ── */}
                    <div className="ks-divider" />
                    <div className="ks-section">
                        <div className="ks-price-rows">
                            <div className="ks-price-row">
                                <span>Subtotal ({totalItems} item)</span>
                                <span>{fmtRp(subtotal)}</span>
                            </div>
                            {diskonTotal > 0 && (
                                <div className="ks-price-row diskon">
                                    <span>Diskon ({selectedPromos.map(p => p.nama).join(", ")})</span>
                                    <span>− {fmtRp(diskonTotal)}</span>
                                </div>
                            )}
                            <div className="ks-price-row total">
                                <span>Total</span>
                                <span>{fmtRp(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── PEMBAYARAN ── */}
                    <div className="ks-divider" />
                    <div className="ks-section">
                        <div className="ks-section-title">
                            <CreditCard size={12} /> Pembayaran
                        </div>

                        <div className="ks-payment-methods">
                            <button
                                className={`ks-pay-btn ${payMethod === "tunai" ? "active" : ""}`}
                                onClick={() => setPayMethod("tunai")}
                            >
                                💵 Tunai
                            </button>
                            <button
                                className={`ks-pay-btn ${payMethod === "qris" ? "active" : ""}`}
                                onClick={() => setPayMethod("qris")}
                            >
                                📱 QRIS
                            </button>
                        </div>

                        {payMethod === "tunai" && cart.length > 0 && (
                            <div className="ks-tunai-row">
                                <span className="ks-tunai-label">Uang Diterima (Rp)</span>
                                <input
                                    className="ks-tunai-input"
                                    type="number"
                                    placeholder={fmt(grandTotal)}
                                    value={uangDiterima}
                                    onChange={e => setUangDiterima(e.target.value)}
                                    min={grandTotal}
                                />
                                {uangNum >= grandTotal && uangNum > 0 && (
                                    <div className="ks-price-row kembalian" style={{marginTop:6}}>
                                        <span>Kembalian</span>
                                        <span>{fmtRp(kembalian)}</span>
                                    </div>
                                )}
                                {kurangBayar && (
                                    <div style={{color:"#dc2626",fontSize:12,marginTop:4,display:"flex",alignItems:"center",gap:4}}>
                                        <AlertCircle size={12} /> Uang kurang {fmtRp(grandTotal - uangNum)}
                                    </div>
                                )}
                            </div>
                        )}



                        <button
                            className="ks-btn-bayar"
                            disabled={!canBayar}
                            onClick={() => setShowConfirm(true)}
                        >
                            <ShoppingCart size={16} />
                            {!canBayar && cart.length === 0
                                ? "Pilih Produk Dulu"
                                : !canBayar && memberStatus === "idle"
                                    ? "Verifikasi Pembeli Dulu"
                                    : kurangBayar
                                        ? "Uang Tidak Cukup"
                                        : `Bayar ${fmtRp(grandTotal)}`
                            }
                        </button>
                    </div>

                </div>{/* end .ks-cart */}
            </div>{/* end .ks-content */}

            {/* ── CONFIRM MODAL ── */}
            {showConfirm && (
                <div className="ks-overlay" onClick={e => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
                    <div className="ks-modal">
                        <div className="ks-modal-title">🧾 Konfirmasi Transaksi</div>
                        <div className="ks-modal-sub">Pastikan data berikut sudah benar sebelum menyimpan.</div>

                        {/* Item list */}
                        <div className="ks-modal-items">
                            {cart.map(item => (
                                <div key={item.id} className="ks-modal-item">
                                    <span>{item.nama} ×{item.qty}</span>
                                    <span>{fmtRp(item.harga * item.qty)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="ks-modal-rows">
                            <div className="ks-modal-row">
                                <span>Pembeli</span>
                                <span>{memberStatus === "found" && member?.nama ? member.nama : "Pengunjung Umum"}</span>
                            </div>
                            <div className="ks-modal-row">
                                <span>Subtotal</span>
                                <span>{fmtRp(subtotal)}</span>
                            </div>
                            {diskonTotal > 0 && (
                                <div className="ks-modal-row" style={{color:"#16a34a"}}>
                                    <span>Diskon</span>
                                    <span>− {fmtRp(diskonTotal)}</span>
                                </div>
                            )}
                            <div className="ks-modal-row bold">
                                <span>Total Bayar</span>
                                <span>{fmtRp(grandTotal)}</span>
                            </div>
                            <div className="ks-modal-row">
                                <span>Metode</span>
                                <span>{payMethod === "tunai" ? `💵 Tunai${uangNum > 0 ? ` (Kembalian ${fmtRp(kembalian)})` : ""}` : "📱 QRIS"}</span>
                            </div>
                        </div>

                        {/* ── QRIS: tampil di modal agar bisa ditunjukkan ke pembeli ── */}
                        {payMethod === "qris" && (
                            <div className="ks-modal-qris">
                                {qrisUrl ? (
                                    <>
                                        <div className="ks-modal-qris-label">📱 Tunjukkan QR ini ke pembeli untuk dibayar</div>
                                        <div className="ks-modal-qris-total">{fmtRp(grandTotal)}</div>
                                        <img src={qrisUrl} alt="QRIS" className="ks-modal-qris-img" />
                                        <div className="ks-modal-qris-hint">Konfirmasi setelah pembeli selesai scan & bayar</div>
                                    </>
                                ) : (
                                    <div className="ks-modal-qris-empty">
                                        📷 Foto QRIS belum diupload.<br />
                                        <span>Pergi ke <strong>Pengaturan → Foto QRIS</strong> untuk menguploadnya.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="ks-modal-actions">
                            <button className="ks-btn-cancel-modal" onClick={() => setShowConfirm(false)} disabled={submitting}>
                                Batal
                            </button>
                            <button className="ks-btn-confirm-modal" onClick={handleCheckout} disabled={submitting}>
                                {submitting
                                    ? <><Loader2 size={14} className="spin" /> Menyimpan...</>
                                    : <><CheckCircle2 size={14} /> Selesaikan Transaksi</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUCCESS FLASH ── */}
            {flashMsg && (
                <div className="ks-success-flash">{flashMsg}</div>
            )}
        </div>
    );
}