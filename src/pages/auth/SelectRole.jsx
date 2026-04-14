// SelectRole.jsx — Pilih role saat daftar, redirect ke app yang benar
import { useNavigate } from "react-router-dom";

const MEMBER_URL = import.meta.env.VITE_MEMBER_URL || 'http://localhost:5175';

const cards = [
  {
    role: 'pekerja-kreatif',
    icon: '🎨',
    title: 'Kreator',
    desc: 'Seniman, pengrajin, musisi, fotografer, dan pegiat kebudayaan lainnya.',
    features: ['Profil & portofolio publik','Posting story & konten','Daftar & ikuti event','Masuk direktori pelaku kreatif'],
    // Goes to member app (different port/domain)
    action: () => { window.location.href = `${MEMBER_URL}/daftar`; },
    color: '#8a551c', bg: '#fdf8f2', border: '#f0d9af',
  },
  {
    role: 'umkm',
    icon: '🏪',
    title: 'Pelaku Usaha / UMKM',
    desc: 'Pengusaha kreatif yang ingin bergabung sebagai tenant di event Pekenbanyumas.',
    features: ['Dashboard manajemen usaha','Kelola stok & buku kas','Kasir + NFC','Revenue sharing transparan'],
    // Same app
    action: (navigate) => navigate('/daftar-umkm'),
    color: '#2f6f4e', bg: '#f8faf8', border: '#c3dece',
  },
];

export default function SelectRole() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', background:'#faf7f4',
      fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", padding:24,
    }}>
      <div style={{textAlign:'center', marginBottom:32}}>
        <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#c48930,#a97025)',
          display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',
          fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20,margin:'0 auto 16px'}}>P</div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:'#2a1a0e',margin:'0 0 8px'}}>
          Daftar ke Peken Banyumasan
        </h1>
        <p style={{color:'#9c7a5e',fontSize:14,margin:0}}>Pilih jenis akun yang sesuai</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,width:'100%',maxWidth:580}}>
        {cards.map(c => (
          <button key={c.role}
            onClick={() => typeof c.action === 'function' ? c.action(navigate) : null}
            style={{background:c.bg,border:`1.5px solid ${c.border}`,borderRadius:16,padding:'24px 20px',
              textAlign:'left',cursor:'pointer',transition:'all .2s',width:'100%',
              fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif"}}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='none'}
          >
            <div style={{fontSize:28,marginBottom:12}}>{c.icon}</div>
            <div style={{fontWeight:700,fontSize:16,color:c.color,marginBottom:6}}>{c.title}</div>
            <p style={{fontSize:13,color:'#6b4c30',lineHeight:1.6,marginBottom:14}}>{c.desc}</p>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:6}}>
              {c.features.map(f => (
                <li key={f} style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'#4a3728'}}>
                  <span style={{width:16,height:16,borderRadius:'50%',background:c.color,
                    display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',
                    fontSize:9,fontWeight:700,flexShrink:0}}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{marginTop:16,padding:'8px 14px',background:c.color,borderRadius:8,
              color:'#fff',fontSize:12,fontWeight:700,display:'inline-block'}}>
              Daftar sebagai {c.title} →
            </div>
          </button>
        ))}
      </div>

      <p style={{marginTop:24,color:'#9c7a5e',fontSize:13}}>
        Sudah punya akun?{' '}
        <span style={{color:'#c48930',fontWeight:600,cursor:'pointer'}} onClick={() => navigate('/login')}>Masuk</span>
      </p>
    </div>
  );
}
