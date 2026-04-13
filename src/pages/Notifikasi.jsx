import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, X, Calendar, Info, CheckCircle, MapPin, Users, Trash2 } from "lucide-react";
import "../assets/styles/notifikasi.css";
import { getNotifs, markRead, markAllRead } from "../lib/notifications";

const TYPE_META = {
  umkm_approved:       { color:"#2f6f4e", bg:"#f0fdf4", icon:"✅", label:"Akun" },
  umkm_event_approved: { color:"#0284c7", bg:"#eff6ff", icon:"📅", label:"Event" },
  umkm_event_assigned: { color:"#7c3aed", bg:"#f5f3ff", icon:"📍", label:"Event" },
  stok:                { color:"#f97316", bg:"#fff7ed", icon:"📦", label:"Stok" },
  transaksi:           { color:"#2f6f4e", bg:"#eef5ef", icon:"💳", label:"Transaksi" },
  promo:               { color:"#7c3aed", bg:"#f5f3ff", icon:"🏷️", label:"Promo" },
  info:                { color:"#0ea5e9", bg:"#f0f9ff", icon:"ℹ️",  label:"Info" },
};

const FILTERS = [
  { key:"semua", label:"Semua" },
  { key:"belum", label:"Belum Dibaca" },
  { key:"sudah", label:"Sudah Dibaca" },
];

const fmtTime = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d > 0) return `${d} hari lalu`;
  if (h > 0) return `${h} jam lalu`;
  if (m > 0) return `${m} menit lalu`;
  return "Baru saja";
};

export default function Notifikasi() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [selected, setSelected] = useState(null);

  const refresh = () => {
    const local = getNotifs('umkm');
    // Seed dummy if empty on first visit
    if (local.length === 0) {
      setList([
        { id:'nd1', type:'umkm_approved', icon:'✅', title:'Usaha Diverifikasi', message:'Selamat! Usaha kamu telah diverifikasi oleh admin. Dashboard sudah aktif.', read:true, created_at: new Date(Date.now()-86400000*2).toISOString() },
        { id:'nd2', type:'umkm_event_approved', icon:'📅', title:'Permintaan Event Disetujui', message:'Kamu disetujui untuk "Festival Budaya Banyumasan 2025" di posisi Zona A - Stand 3.', read:false, created_at: new Date(Date.now()-3600000).toISOString() },
      ]);
    } else {
      setList(local);
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener('pekan_notif_update', refresh);
    return () => window.removeEventListener('pekan_notif_update', refresh);
  }, []);

  const baca = (id) => { markRead('umkm', id); refresh(); };
  const bacaSemua = () => { markAllRead('umkm'); refresh(); };

  const unread = list.filter(n => !n.read).length;
  const filtered = list.filter(n => {
    if (filter === 'belum') return !n.read;
    if (filter === 'sudah') return n.read;
    return true;
  });

  const detail = selected ? list.find(n => n.id === selected) : null;

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-header">
        <div>
          <div className="notif-title-row">
            <h1 className="notif-heading">Notifikasi</h1>
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </div>
          <p className="notif-sub">Pembaruan status usaha dan event kamu</p>
        </div>
        {unread > 0 && (
          <button className="notif-read-all" onClick={bacaSemua}>
            <CheckCheck size={15}/> Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="notif-filters">
        {FILTERS.map(f => (
          <button key={f.key} className={`nf-btn ${filter===f.key?'active':''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="notif-empty">
          <Bell size={36}/>
          <p>{filter==='belum'?'Semua notifikasi sudah dibaca':'Belum ada notifikasi'}</p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.info;
            return (
              <div key={n.id}
                className={`notif-item ${!n.read ? 'unread' : ''}`}
                onClick={() => { baca(n.id); setSelected(n.id); }}
              >
                <div className="notif-avatar" style={{background:meta.bg, color:meta.color}}>
                  <span style={{fontSize:18}}>{n.icon || meta.icon}</span>
                </div>
                <div className="notif-content">
                  {n.title && <p className={`notif-item-title ${!n.read?'bold':''}`}>{n.title}</p>}
                  <p className={`notif-item-msg ${!n.read?'bold':''}`}>{n.message}</p>
                  <p className="notif-item-time">{fmtTime(n.created_at)}</p>
                </div>
                {!n.read && <div className="notif-dot"/>}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="notif-overlay" onClick={() => setSelected(null)}>
          <div className="notif-modal" onClick={e => e.stopPropagation()}>
            <div className="nm-header">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>{detail.icon || '🔔'}</span>
                <h3 className="nm-title">{detail.title || 'Notifikasi'}</h3>
              </div>
              <button className="nm-close" onClick={() => setSelected(null)}><X size={18}/></button>
            </div>
            <div style={{padding:'16px 20px 20px'}}>
              <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{detail.message}</p>
              <p style={{fontSize:12,color:'#9ca3af',marginTop:12}}>{fmtTime(detail.created_at)}</p>
              {detail.link && (
                <button onClick={() => { setSelected(null); navigate(detail.link); }}
                  style={{marginTop:16,padding:'8px 18px',background:'#2f6f4e',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  Lihat Detail →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
