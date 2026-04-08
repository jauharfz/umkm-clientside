import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const STEPS = [
    { id: 1, label: "Data Usaha",  icon: "🏪" },
    { id: 2, label: "Dokumen",     icon: "📄" },
    { id: 3, label: "S & K",       icon: "📋" },
    { id: 4, label: "Pilih Kios",  icon: "🗺️" },
    { id: 5, label: "Konfirmasi",  icon: "✅" },
];

const KIOS_DATA = [
    { id: "A-01", zona: "A", harga: 500000, ukuran: "3×3m" },
    { id: "A-02", zona: "A", harga: 500000, ukuran: "3×3m" },
    { id: "A-03", zona: "A", harga: 500000, ukuran: "3×3m" },
    { id: "A-04", zona: "A", harga: 500000, ukuran: "3×3m" },
    { id: "A-05", zona: "A", harga: 500000, ukuran: "3×3m" },
    { id: "A-06", zona: "A", harga: 500000, ukuran: "3×3m" },
    { id: "B-01", zona: "B", harga: 600000, ukuran: "4×3m" },
    { id: "B-02", zona: "B", harga: 600000, ukuran: "4×3m" },
    { id: "B-03", zona: "B", harga: 600000, ukuran: "4×3m" },
    { id: "B-04", zona: "B", harga: 600000, ukuran: "4×3m" },
    { id: "C-01", zona: "C", harga: 450000, ukuran: "2×3m" },
    { id: "C-02", zona: "C", harga: 450000, ukuran: "2×3m" },
    { id: "C-03", zona: "C", harga: 450000, ukuran: "2×3m" },
];

const ZONA_INFO = {
    A: { label: "Zona Kuliner",   color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    B: { label: "Zona Fashion",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
    C: { label: "Zona Kerajinan", color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
};

// ── Email validation helpers ───────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateEmailFormat(email) {
    if (!email.trim()) return "Email wajib diisi";
    if (!EMAIL_REGEX.test(email.trim())) return "Format email tidak valid (contoh: nama@domain.com)";
    return "";
}

// ── Password strength ─────────────────────────────────────────────────────
function getPasswordStrength(password) {
    if (!password) return { level: 0, label: "", color: "#e5e7eb" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
        { level: 0, label: "", color: "#e5e7eb" },
        { level: 1, label: "Lemah", color: "#ef4444" },
        { level: 2, label: "Cukup", color: "#f59e0b" },
        { level: 3, label: "Kuat", color: "#10b981" },
        { level: 4, label: "Sangat Kuat", color: "#2f855a" },
    ];
    return map[score] || map[0];
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.reg-root{min-height:100vh;background:#f0ede6;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px 60px;font-family:'DM Sans',sans-serif;position:relative}
.reg-root::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle at 20% 20%,rgba(47,133,90,.06) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(217,119,6,.06) 0%,transparent 50%);pointer-events:none}
.reg-wrapper{width:100%;max-width:680px;animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.reg-brand{display:flex;align-items:center;gap:12px;margin-bottom:28px;cursor:pointer}
.reg-brand-mark{width:42px;height:42px;background:linear-gradient(135deg,#2f855a,#48bb78);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(47,133,90,.3);font-size:18px}
.reg-brand-name{font-family:'Lora',serif;font-size:18px;font-weight:700;color:#1a2e1f}
.reg-brand-sub{font-size:12px;color:#6b7280;margin-top:1px}
.stepper{display:flex;align-items:center;margin-bottom:20px}
.step-item{display:flex;flex-direction:column;align-items:center;flex:1;position:relative}
.step-item:not(:last-child)::after{content:'';position:absolute;top:18px;left:50%;width:100%;height:2px;background:#e5e7eb;z-index:0;transition:background .3s}
.step-item.done:not(:last-child)::after{background:#2f855a}
.step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;position:relative;z-index:1;transition:all .3s;border:2px solid #e5e7eb;background:white;color:#9ca3af}
.step-item.active .step-circle{border-color:#2f855a;background:#2f855a;color:white;box-shadow:0 0 0 4px rgba(47,133,90,.15)}
.step-item.done .step-circle{border-color:#2f855a;background:#2f855a;color:white}
.step-label{font-size:10px;font-weight:600;margin-top:6px;color:#9ca3af;letter-spacing:.03em;text-align:center}
.step-item.active .step-label,.step-item.done .step-label{color:#2f855a}
.progress-bar-wrap{height:3px;background:#e5e7eb;border-radius:99px;margin-bottom:28px;overflow:hidden}
.progress-bar-fill{height:100%;background:linear-gradient(90deg,#2f855a,#48bb78);border-radius:99px;transition:width .4s cubic-bezier(.22,1,.36,1)}
.reg-card{background:white;border-radius:24px;padding:40px 44px;box-shadow:0 0 0 1px rgba(0,0,0,.05),0 8px 32px rgba(0,0,0,.07);animation:slideIn .35s cubic-bezier(.22,1,.36,1) both}
@keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
@media(max-width:600px){.reg-card{padding:28px 20px}}
.step-chip{display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:12px}
.step-title{font-family:'Lora',serif;font-size:22px;font-weight:700;color:#1a2e1f;margin-bottom:4px}
.step-desc{font-size:13.5px;color:#6b7280;margin-bottom:28px}
.field{margin-bottom:20px}
.field-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:7px}
.field-label span{color:#ef4444;margin-left:2px}
.input-wrap{position:relative}
.reg-input,.reg-select,.reg-textarea{width:100%;padding:12px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;font-family:'DM Sans',sans-serif;background:#fafafa;color:#1a2e1f;transition:border-color .2s,background .2s,box-shadow .2s;outline:none;-webkit-appearance:none}
.reg-input::placeholder,.reg-textarea::placeholder{color:#b0b7c3}
.reg-input:focus,.reg-select:focus,.reg-textarea:focus{border-color:#2f855a;background:#fff;box-shadow:0 0 0 3px rgba(47,133,90,.1)}
.reg-input.err,.reg-select.err,.reg-textarea.err{border-color:#ef4444;background:#fff8f8}
.reg-input.ok{border-color:#10b981;background:#f0fdf4}
.reg-input.checking{border-color:#f59e0b;background:#fffbeb}
.reg-textarea{resize:vertical;min-height:90px}
.err-msg{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:12px;color:#ef4444;font-weight:500}
.ok-msg{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:12px;color:#059669;font-weight:500}
.info-msg{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:12px;color:#d97706;font-weight:500}
.pw-strength{margin-top:8px}
.pw-strength-bars{display:flex;gap:4px;margin-bottom:4px}
.pw-bar{height:3px;flex:1;border-radius:99px;background:#e5e7eb;transition:background .3s}
.pw-label{font-size:11px;font-weight:600}
.upload-zone{border:2px dashed #d1d5db;border-radius:14px;padding:24px;text-align:center;background:#fafafa;transition:border-color .2s,background .2s;cursor:pointer;display:block}
.upload-zone:hover{border-color:#2f855a;background:#f0fdf4}
.upload-zone.uploaded{border-color:#2f855a;background:#f0fdf4}
.upload-zone.err{border-color:#ef4444}
.upload-icon{font-size:32px;margin-bottom:8px}
.upload-title{font-size:13.5px;font-weight:600;color:#374151;margin-bottom:4px}
.upload-sub{font-size:12px;color:#9ca3af;margin-bottom:14px}
.upload-btn{display:inline-flex;align-items:center;gap:6px;background:#2f855a;color:white;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;padding:8px 20px;border-radius:99px;transition:background .2s;border:none}
.terms-box{border:1.5px solid #e5e7eb;border-radius:14px;padding:20px;max-height:180px;overflow-y:auto;background:#fafafa;font-size:13.5px;color:#4b5563;line-height:1.75;margin-bottom:20px}
.terms-box ul{padding-left:18px}
.terms-box li{margin-bottom:6px}
.checkbox-row{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:1.5px solid #e5e7eb;background:#fafafa;cursor:pointer;transition:border-color .2s,background .2s}
.checkbox-row.checked{border-color:#2f855a;background:#f0fdf4}
.checkbox-row.err{border-color:#ef4444}
.zona-section{margin-bottom:24px}
.zona-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;letter-spacing:.04em;margin-bottom:12px}
.zona-dot{width:8px;height:8px;border-radius:50%}
.kios-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}
.kios-card{border:2px solid #e5e7eb;border-radius:14px;padding:14px 10px;text-align:center;cursor:pointer;transition:all .2s;background:white;position:relative}
.kios-card:hover:not(.kios-full){border-color:#2f855a;transform:translateY(-2px);box-shadow:0 6px 16px rgba(47,133,90,.15)}
.kios-card.kios-full{background:#f9fafb;cursor:not-allowed;opacity:.55}
.kios-card.kios-selected{border-color:#2f855a;background:#f0fdf4;box-shadow:0 0 0 3px rgba(47,133,90,.15)}
.kios-id{font-family:'Lora',serif;font-size:18px;font-weight:700;color:#1a2e1f;margin-bottom:3px}
.kios-size{font-size:10px;color:#9ca3af;margin-bottom:5px}
.kios-price{font-size:11px;font-weight:600;color:#374151}
.kios-status{font-size:10px;margin-top:4px;font-weight:600}
.kios-status.available{color:#2f855a}
.kios-status.full{color:#9ca3af}
.kios-check{position:absolute;top:-8px;right:-8px;width:22px;height:22px;background:#2f855a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;box-shadow:0 2px 6px rgba(47,133,90,.4)}
.selected-banner{display:flex;align-items:center;gap:12px;background:linear-gradient(90deg,#f0fdf4,#dcfce7);border:1.5px solid #86efac;border-radius:14px;padding:14px 18px;margin-top:20px}
.confirm-section{border:1.5px solid #e9eaeb;border-radius:16px;overflow:hidden;margin-bottom:16px}
.confirm-header{display:flex;align-items:center;gap:10px;padding:12px 18px;background:#f9fafb;border-bottom:1px solid #e9eaeb}
.confirm-header-title{font-size:13px;font-weight:700;color:#374151;letter-spacing:.02em}
.confirm-body{padding:16px 18px}
.confirm-row{display:flex;gap:12px;font-size:13.5px;margin-bottom:8px;align-items:flex-start}
.confirm-row:last-child{margin-bottom:0}
.confirm-key{color:#9ca3af;font-weight:500;min-width:100px;flex-shrink:0}
.confirm-val{color:#1a2e1f;font-weight:600}
.nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:36px;gap:12px}
.btn-back{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border:1.5px solid #e5e7eb;border-radius:12px;background:white;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;color:#4b5563;cursor:pointer;transition:all .2s}
.btn-back:hover{border-color:#9ca3af;background:#f9fafb}
.btn-next{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:linear-gradient(135deg,#276749,#2f855a);color:white;border:none;border-radius:12px;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;box-shadow:0 4px 14px rgba(47,133,90,.35);margin-left:auto}
.btn-next:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(47,133,90,.4)}
.btn-next:disabled{opacity:.55;cursor:not-allowed;transform:none}
.btn-submit{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:linear-gradient(135deg,#15803d,#2f855a);color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;box-shadow:0 6px 20px rgba(47,133,90,.4);margin-left:auto}
.btn-submit:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(47,133,90,.45)}
.btn-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
.api-error{background:#fff1f0;border:1.5px solid #fca5a5;border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:13.5px;color:#b91c1c;font-weight:500}
`;

export default function Register() {
    const navigate  = useNavigate();
    const [step, setStep]             = useState(1);
    const [errors, setErrors]         = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError]     = useState("");

    // Email check state
    const [emailStatus, setEmailStatus] = useState("idle"); // idle | checking | available | taken | invalid
    const debounceTimer = useRef(null);

    const [occupiedStands, setOccupiedStands] = useState([]);
    const [kiosLoading, setKiosLoading]       = useState(false);

    const [formData, setFormData] = useState({
        email: "", password: "", konfirmasiPassword: "",
        namaPemilik: "",
        namaUsaha: "", alamat: "", kategori: "", deskripsi: "",
        ktp: null, nib: null,
        setuju: false, kios: null,
    });

    // ── Debounced email availability check ─────────────────────────────────
    const checkEmailAvailability = useCallback((email) => {
        const formatErr = validateEmailFormat(email);
        if (formatErr) {
            setEmailStatus("invalid");
            return;
        }
        setEmailStatus("checking");
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            try {
                const API = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
                const res = await fetch(`${API}/public/check-email?email=${encodeURIComponent(email.trim())}`);
                const data = await res.json();
                setEmailStatus(data.available ? "available" : "taken");
            } catch {
                setEmailStatus("idle"); // network error — silent, validate on submit
            }
        }, 600);
    }, []);

    // ── Kios fetch ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (step !== 4) return;
        setKiosLoading(true);
        const API = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
        fetch(`${API}/public/kios-tersedia`)
            .then(r => r.json())
            .then(res => setOccupiedStands(res.data || []))
            .catch(() => {})
            .finally(() => setKiosLoading(false));
    }, [step]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        const newValue = type === "checkbox" ? checked : type === "file" ? files[0] : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
        if (apiError) setApiError("");

        // Email-specific handling
        if (name === "email") {
            if (!value.trim()) {
                setEmailStatus("idle");
                clearTimeout(debounceTimer.current);
            } else {
                checkEmailAvailability(value);
            }
        }
    };

    const pwStrength = getPasswordStrength(formData.password);

    const validate = () => {
        const e = {};
        if (step === 1) {
            if (!formData.namaPemilik.trim()) e.namaPemilik = "Nama pemilik wajib diisi";
            if (!formData.namaUsaha.trim())   e.namaUsaha   = "Nama usaha wajib diisi";
            if (!formData.alamat.trim())      e.alamat      = "Alamat wajib diisi";
            if (!formData.kategori)           e.kategori    = "Pilih kategori usaha";

            const emailErr = validateEmailFormat(formData.email);
            if (emailErr) {
                e.email = emailErr;
            } else if (emailStatus === "taken") {
                e.email = "Email sudah terdaftar. Gunakan email lain atau login.";
            } else if (emailStatus === "checking") {
                e.email = "Sedang memeriksa email, tunggu sebentar...";
            }

            if (!formData.password)                          e.password = "Password wajib diisi";
            else if (formData.password.length < 6)           e.password = "Password minimal 6 karakter";
            if (formData.password !== formData.konfirmasiPassword)
                e.konfirmasiPassword = "Konfirmasi password tidak cocok";
        }
        if (step === 2) {
            if (!formData.ktp) e.ktp = "KTP wajib diupload";
            if (!formData.nib) e.nib = "NIB wajib diupload";
        }
        if (step === 3 && !formData.setuju) e.setuju = "Anda harus menyetujui syarat & ketentuan";
        if (step === 4 && !formData.kios)   e.kios   = "Silakan pilih kios terlebih dahulu";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validate()) setStep(p => p + 1); };
    const prevStep = () => setStep(p => p - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        setApiError("");
        try {
            const fd = new FormData();
            fd.append("nama_pemilik",  formData.namaPemilik);
            fd.append("nama_usaha",    formData.namaUsaha);
            fd.append("alamat",        formData.alamat);
            fd.append("kategori",      formData.kategori);
            fd.append("deskripsi",     formData.deskripsi || "");
            fd.append("email",         formData.email.trim().toLowerCase());
            fd.append("password",      formData.password);
            fd.append("kios_id",       formData.kios.id);
            fd.append("file_ktp",      formData.ktp);
            fd.append("file_nib",      formData.nib);
            fd.append("setuju",        String(formData.setuju));

            await api.postForm("/auth/register", fd);
            localStorage.setItem("reg_email", formData.email.trim().toLowerCase());
            navigate("/status");
        } catch (err) {
            setApiError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    const zonas = [...new Set(KIOS_DATA.map(k => k.zona))];

    // Helper: email field status indicator
    const emailInputClass = () => {
        if (errors.email) return "reg-input err";
        if (emailStatus === "available") return "reg-input ok";
        if (emailStatus === "checking")  return "reg-input checking";
        if (emailStatus === "taken")     return "reg-input err";
        return "reg-input";
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="reg-root">
                <div className="reg-wrapper">

                    {/* Brand */}
                    <div className="reg-brand" onClick={() => navigate("/")}>
                        <div className="reg-brand-mark">🎪</div>
                        <div>
                            <div className="reg-brand-name">Peken Banyumas 2026</div>
                            <div className="reg-brand-sub">Pendaftaran UMKM · 22–24 Maret 2026</div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="stepper">
                        {STEPS.map(s => (
                            <div key={s.id} className={`step-item ${step > s.id ? "done" : ""} ${step === s.id ? "active" : ""}`}>
                                <div className="step-circle">{step > s.id ? "✓" : s.id}</div>
                                <div className="step-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress */}
                    <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
                    </div>

                    {/* Card */}
                    <div className="reg-card" key={step}>
                        {apiError && <div className="api-error">⚠ {apiError}</div>}

                        {/* STEP 1 — Data Usaha & Akun */}
                        {step === 1 && (
                            <>
                                <div className="step-chip">🏪 Langkah 1 dari 5</div>
                                <h2 className="step-title">Data Usaha & Akun</h2>
                                <p className="step-desc">Isi data usaha dan buat akun untuk login ke dashboard</p>

                                <div className="field">
                                    <label className="field-label">Nama Pemilik <span>*</span></label>
                                    <input type="text" name="namaPemilik" value={formData.namaPemilik} onChange={handleChange}
                                           placeholder="Nama lengkap pemilik usaha" className={`reg-input${errors.namaPemilik ? " err" : ""}`} />
                                    {errors.namaPemilik && <div className="err-msg">⚠ {errors.namaPemilik}</div>}
                                </div>

                                <div className="field">
                                    <label className="field-label">Nama Usaha <span>*</span></label>
                                    <input type="text" name="namaUsaha" value={formData.namaUsaha} onChange={handleChange}
                                           placeholder="Contoh: Warung Makan Bu Sari" className={`reg-input${errors.namaUsaha ? " err" : ""}`} />
                                    {errors.namaUsaha && <div className="err-msg">⚠ {errors.namaUsaha}</div>}
                                </div>

                                <div className="field">
                                    <label className="field-label">Alamat Usaha <span>*</span></label>
                                    <input type="text" name="alamat" value={formData.alamat} onChange={handleChange}
                                           placeholder="Jl. Contoh No.1, Banyumas" className={`reg-input${errors.alamat ? " err" : ""}`} />
                                    {errors.alamat && <div className="err-msg">⚠ {errors.alamat}</div>}
                                </div>

                                <div className="field">
                                    <label className="field-label">Kategori Usaha <span>*</span></label>
                                    <select name="kategori" value={formData.kategori} onChange={handleChange}
                                            className={`reg-select${errors.kategori ? " err" : ""}`}>
                                        <option value="">-- Pilih Kategori --</option>
                                        <option value="Kuliner">🍱 Kuliner</option>
                                        <option value="Fashion">👗 Fashion</option>
                                        <option value="Kerajinan">🎨 Kerajinan</option>
                                        <option value="Lainnya">✨ Lainnya</option>
                                    </select>
                                    {errors.kategori && <div className="err-msg">⚠ {errors.kategori}</div>}
                                </div>

                                <div className="field">
                                    <label className="field-label">Deskripsi Usaha</label>
                                    <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange}
                                              placeholder="Ceritakan produk atau layanan yang kamu tawarkan..." className="reg-textarea" />
                                </div>

                                <div style={{ borderTop: "1.5px solid #f0f0f0", margin: "8px 0 20px", paddingTop: 20 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 16 }}>🔑 Data Akun (untuk login)</p>
                                </div>

                                {/* Email dengan real-time validation */}
                                <div className="field">
                                    <label className="field-label">Email <span>*</span></label>
                                    <div className="input-wrap">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                                               placeholder="email@contoh.com" className={emailInputClass()} />
                                    </div>
                                    {errors.email && <div className="err-msg">⚠ {errors.email}</div>}
                                    {!errors.email && emailStatus === "checking" && (
                                        <div className="info-msg">⏳ Memeriksa ketersediaan email...</div>
                                    )}
                                    {!errors.email && emailStatus === "available" && (
                                        <div className="ok-msg">✓ Email tersedia</div>
                                    )}
                                    {!errors.email && emailStatus === "taken" && (
                                        <div className="err-msg">
                                            ⚠ Email sudah terdaftar.{" "}
                                            <span onClick={() => navigate("/login")}
                                                  style={{ color: "#2f855a", cursor: "pointer", textDecoration: "underline" }}>
                                                Login di sini
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Password dengan strength indicator */}
                                <div className="field">
                                    <label className="field-label">Password <span>*</span></label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                                           placeholder="Minimal 6 karakter" className={`reg-input${errors.password ? " err" : ""}`} />
                                    {formData.password && (
                                        <div className="pw-strength">
                                            <div className="pw-strength-bars">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className="pw-bar"
                                                         style={{ background: i <= pwStrength.level ? pwStrength.color : "#e5e7eb" }} />
                                                ))}
                                            </div>
                                            {pwStrength.label && (
                                                <div className="pw-label" style={{ color: pwStrength.color }}>
                                                    Kekuatan: {pwStrength.label}
                                                    {pwStrength.level < 3 && <span style={{ color: "#9ca3af", fontWeight: 400 }}> — tambahkan huruf kapital, angka, atau simbol</span>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.password && <div className="err-msg">⚠ {errors.password}</div>}
                                </div>

                                <div className="field">
                                    <label className="field-label">Konfirmasi Password <span>*</span></label>
                                    <input type="password" name="konfirmasiPassword" value={formData.konfirmasiPassword} onChange={handleChange}
                                           placeholder="Ulangi password" className={`reg-input${errors.konfirmasiPassword ? " err" : ""}`} />
                                    {!errors.konfirmasiPassword && formData.konfirmasiPassword && formData.password === formData.konfirmasiPassword && (
                                        <div className="ok-msg">✓ Password cocok</div>
                                    )}
                                    {errors.konfirmasiPassword && <div className="err-msg">⚠ {errors.konfirmasiPassword}</div>}
                                </div>
                            </>
                        )}

                        {/* STEP 2 — Dokumen */}
                        {step === 2 && (
                            <>
                                <div className="step-chip">📄 Langkah 2 dari 5</div>
                                <h2 className="step-title">Upload Dokumen</h2>
                                <p className="step-desc">Dokumen diperlukan untuk verifikasi identitas dan legalitas usaha</p>
                                {[
                                    { key: "ktp", label: "KTP Pemilik", desc: "Kartu Tanda Penduduk", emoji: "🪪" },
                                    { key: "nib", label: "NIB",         desc: "Nomor Induk Berusaha",  emoji: "📑" },
                                ].map(({ key, label, desc, emoji }) => (
                                    <div className="field" key={key}>
                                        <label className="field-label">{label} <span>*</span></label>
                                        <label className={`upload-zone${errors[key] ? " err" : ""}${formData[key] ? " uploaded" : ""}`}>
                                            <input type="file" name={key} onChange={handleChange} style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" />
                                            {formData[key] ? (
                                                <>
                                                    <div className="upload-icon">✅</div>
                                                    <div className="upload-title" style={{ color: "#166534" }}>{formData[key].name}</div>
                                                    <div className="upload-sub">Klik untuk ganti file</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="upload-icon">{emoji}</div>
                                                    <div className="upload-title">Upload {label}</div>
                                                    <div className="upload-sub">{desc} · JPG, PNG, atau PDF · Maks. 5MB</div>
                                                    <span className="upload-btn">📎 Pilih File</span>
                                                </>
                                            )}
                                        </label>
                                        {errors[key] && <div className="err-msg">⚠ {errors[key]}</div>}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* STEP 3 — S&K */}
                        {step === 3 && (
                            <>
                                <div className="step-chip">📋 Langkah 3 dari 5</div>
                                <h2 className="step-title">Syarat & Ketentuan</h2>
                                <p className="step-desc">Baca dan setujui ketentuan sebelum melanjutkan pendaftaran</p>
                                <div className="terms-box">
                                    <p style={{ marginBottom: 12, fontWeight: 600, color: "#1a2e1f" }}>Ketentuan Pendaftaran UMKM — Peken Banyumas 2026</p>
                                    <ul>
                                        <li>Data usaha yang diberikan adalah benar, akurat, dan dapat dipertanggungjawabkan.</li>
                                        <li>Dokumen yang diunggah (KTP & NIB) akan diverifikasi oleh tim admin Peken Banyumas.</li>
                                        <li>Harga sewa kios dapat berubah sewaktu-waktu sesuai kebijakan pengelola.</li>
                                        <li>Pembayaran sewa kios dilakukan melalui admin resmi dan tidak melalui pihak ketiga.</li>
                                        <li>Peserta wajib menjaga kebersihan dan ketertiban area kios selama acara berlangsung.</li>
                                        <li>Peserta dilarang menjual produk yang tidak sesuai dengan kategori yang didaftarkan.</li>
                                        <li>Segala pelanggaran dapat mengakibatkan pembatalan pendaftaran tanpa pengembalian dana.</li>
                                        <li>Pengelola berhak melakukan inspeksi kios sewaktu-waktu selama periode acara.</li>
                                    </ul>
                                </div>
                                <label
                                    className={`checkbox-row${formData.setuju ? " checked" : ""}${errors.setuju ? " err" : ""}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, setuju: !prev.setuju }));
                                        if (errors.setuju) setErrors(prev => ({ ...prev, setuju: "" }));
                                    }}
                                >
                                    <input type="checkbox" checked={formData.setuju} onChange={() => {}}
                                           style={{ width: 18, height: 18, accentColor: "#2f855a", flexShrink: 0, marginTop: 1, cursor: "pointer" }} />
                                    <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500, lineHeight: 1.5, cursor: "pointer" }}>
                                        Saya telah membaca dan <strong>menyetujui seluruh syarat & ketentuan</strong> yang berlaku
                                    </span>
                                </label>
                                {errors.setuju && <div className="err-msg" style={{ marginTop: 8 }}>⚠ {errors.setuju}</div>}
                            </>
                        )}

                        {/* STEP 4 — Pilih Kios */}
                        {step === 4 && (
                            <>
                                <div className="step-chip">🗺️ Langkah 4 dari 5</div>
                                <h2 className="step-title">Pilih Kios</h2>
                                <p className="step-desc">Pilih lokasi kios yang tersedia. Harga ditampilkan per bulan.</p>
                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                                    {[
                                        { label: "Tersedia", border: "#2f855a", bg: "#f0fdf4" },
                                        { label: "Terisi",   border: "#e5e7eb", bg: "#f9fafb", opacity: 0.5 },
                                        { label: "Dipilih",  border: "#2f855a", bg: "#f0fdf4", shadow: "0 0 0 3px rgba(47,133,90,.2)" },
                                    ].map(({ label, border, bg, opacity, shadow }) => (
                                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4b5563" }}>
                                            <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `2px solid ${border}`, opacity, boxShadow: shadow }} />
                                            {label}
                                        </div>
                                    ))}
                                    {kiosLoading && <span style={{ fontSize: 12, color: "#9ca3af" }}>⏳ Memuat status kios...</span>}
                                </div>
                                {zonas.map(zona => {
                                    const info  = ZONA_INFO[zona];
                                    const kiosZ = KIOS_DATA.filter(k => k.zona === zona);
                                    return (
                                        <div className="zona-section" key={zona}>
                                            <span className="zona-badge" style={{ background: info.bg, color: info.color, border: `1px solid ${info.border}` }}>
                                                <span className="zona-dot" style={{ background: info.color }} />
                                                Zona {zona} — {info.label}
                                            </span>
                                            <div className="kios-grid">
                                                {kiosZ.map(kios => {
                                                    const isFull = occupiedStands.includes(kios.id);
                                                    const isSel  = formData.kios?.id === kios.id;
                                                    return (
                                                        <div key={kios.id}
                                                             className={`kios-card${isFull ? " kios-full" : ""}${isSel ? " kios-selected" : ""}`}
                                                             onClick={() => {
                                                                 if (isFull) return;
                                                                 setFormData(prev => ({ ...prev, kios }));
                                                                 if (errors.kios) setErrors(prev => ({ ...prev, kios: "" }));
                                                             }}>
                                                            {isSel && <div className="kios-check">✓</div>}
                                                            <div className="kios-id">{kios.id}</div>
                                                            <div className="kios-size">{kios.ukuran}</div>
                                                            <div className="kios-price">Rp {(kios.harga / 1000).toFixed(0)}rb</div>
                                                            <div className={`kios-status ${isFull ? "full" : "available"}`}>{isFull ? "Terisi" : "Tersedia"}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {errors.kios && <div className="err-msg">⚠ {errors.kios}</div>}
                                {formData.kios && (
                                    <div className="selected-banner">
                                        <span style={{ fontSize: 24 }}>🏠</span>
                                        <div>
                                            <div style={{ fontWeight: 700, color: "#166534", fontSize: 14 }}>Kios {formData.kios.id} dipilih</div>
                                            <div style={{ fontSize: 12, color: "#4b7a5e" }}>
                                                {ZONA_INFO[formData.kios.zona]?.label} · {formData.kios.ukuran} · Rp {formData.kios.harga.toLocaleString("id-ID")}/bulan
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* STEP 5 — Konfirmasi */}
                        {step === 5 && (
                            <>
                                <div className="step-chip">✅ Langkah 5 dari 5</div>
                                <h2 className="step-title">Konfirmasi Data</h2>
                                <p className="step-desc">Periksa kembali sebelum mengirimkan pendaftaran</p>
                                {[
                                    {
                                        icon: "👤", title: "DATA PEMILIK & USAHA",
                                        rows: [["Nama Pemilik", formData.namaPemilik], ["Nama Usaha", formData.namaUsaha], ["Alamat", formData.alamat], ["Kategori", formData.kategori], ["Deskripsi", formData.deskripsi || "—"]],
                                    },
                                    {
                                        icon: "🔑", title: "DATA AKUN",
                                        rows: [["Email", formData.email]],
                                    },
                                    {
                                        icon: "📄", title: "DOKUMEN",
                                        rows: [["KTP", formData.ktp?.name], ["NIB", formData.nib?.name]],
                                        green: true,
                                    },
                                    {
                                        icon: "🏠", title: "KIOS DIPILIH",
                                        rows: [
                                            ["ID Kios",  formData.kios?.id],
                                            ["Zona",     formData.kios ? ZONA_INFO[formData.kios.zona]?.label : "—"],
                                            ["Ukuran",   formData.kios?.ukuran],
                                            ["Harga",    formData.kios ? `Rp ${formData.kios.harga.toLocaleString("id-ID")}/bulan` : "—"],
                                        ],
                                    },
                                ].map(({ icon, title, rows, green }) => (
                                    <div className="confirm-section" key={title}>
                                        <div className="confirm-header">
                                            <span style={{ fontSize: 16 }}>{icon}</span>
                                            <span className="confirm-header-title">{title}</span>
                                        </div>
                                        <div className="confirm-body">
                                            {rows.map(([k, v]) => (
                                                <div className="confirm-row" key={k}>
                                                    <span className="confirm-key">{k}</span>
                                                    <span className="confirm-val" style={green ? { color: "#2f855a" } : {}}>{green ? `✓ ${v}` : v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e", display: "flex", gap: 10 }}>
                                    <span style={{ flexShrink: 0 }}>💡</span>
                                    <span>Pendaftaran akan diproses oleh admin. Pantau status di halaman <strong>Status Pendaftaran</strong>.</span>
                                </div>
                            </>
                        )}

                        {/* Navigation */}
                        <div className="nav-row">
                            {step > 1 && <button className="btn-back" onClick={prevStep}>← Kembali</button>}
                            {step < 5
                                ? <button className="btn-next"
                                          disabled={step === 1 && emailStatus === "checking"}
                                          onClick={nextStep}>
                                    Lanjut →
                                </button>
                                : <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? "⏳ Mendaftar..." : "✅ Kirim Pendaftaran"}
                                </button>
                            }
                        </div>
                    </div>

                    <p style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "#6b7280" }}>
                        Sudah punya akun?{" "}
                        <span onClick={() => navigate("/login")} style={{ color: "#2f855a", fontWeight: 600, cursor: "pointer" }}>
                            Masuk di sini
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
}