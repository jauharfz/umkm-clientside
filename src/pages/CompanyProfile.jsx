// CompanyProfile.jsx — Platform landing: premium cultural, portfolio-first, carousel
// Pure inline styles + embedded CSS. Font: Plus Jakarta Sans + Playfair Display (no Tailwind)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser } from '../services/api';

const MEMBER_URL = import.meta.env.VITE_MEMBER_URL || 'http://localhost:5175';

// ── PORTFOLIO — demo images from public CDN (replace with real uploads in prod)
const PORTFOLIO = [
  {
    id:'k1',
    judul:'Batik Sekar Jagad Kontemporer',
    sub:'Kriya',
    author:'Sari Dewi Rahayu',
    kota:'Banyumas',
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    // batik/fabric texture
    liked:34,
  },
  {
    id:'k2',
    judul:'Album Calung Banyumasan Vol. II',
    sub:'Musik',
    author:'Ahmad Fauzi',
    kota:'Purwokerto',
    img:'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
    // music/instruments
    liked:61,
  },
  {
    id:'k3',
    judul:'Dokumentasi Pasar Wage',
    sub:'Fotografi',
    author:'Rizky Pramesti',
    kota:'Banyumas',
    img:'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80',
    // market/people
    liked:45,
  },
  {
    id:'k4',
    judul:'Wayang Arjuna — Seri Ekspresif',
    sub:'Seni Rupa',
    author:'Laras Wulandari',
    kota:'Banyumas',
    img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    // shadow puppet / art
    liked:189,
  },
  {
    id:'k5',
    judul:'Meja Bambu Petung Epoxy',
    sub:'Desain Produk',
    author:'Dimas Arya',
    kota:'Purbalingga',
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    // furniture
    liked:53,
  },
  {
    id:'k6',
    judul:'Tenun Lurik Cilacap Vol. 3',
    sub:'Fashion',
    author:'Hendra Wijaya',
    kota:'Cilacap',
    img:'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80',
    // textile/weaving
    liked:38,
  },
  {
    id:'k7',
    judul:'Dokumenter: Wayang Kulit Terakhir',
    sub:'Film',
    author:'Budi Santoso',
    kota:'Banjarnegara',
    img:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    // cinema/film
    liked:77,
  },
  {
    id:'k8',
    judul:'Dawet Ayu: Kuliner Khas',
    sub:'Kuliner',
    author:'Nurul Hidayah',
    kota:'Cilacap',
    img:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
    // drinks/food
    liked:29,
  },
];

const EVENTS = [
  { id:'e1', nama:'Festival Budaya Banyumasan 2025', tgl:'17', bln:'Mei', jam:'08.00–22.00', lok:'Alun-Alun Purwokerto', peserta:34, kapasitas:200, tag:'Segera' },
  { id:'e2', nama:'Workshop Batik & Tenun Nusantara', tgl:'26', bln:'Apr', jam:'09.00–17.00', lok:'Gedung Kebudayaan Cilacap', peserta:18, kapasitas:30, tag:'Hampir Penuh' },
  { id:'e3', nama:'Pameran Kriya Ekraf Regional', tgl:'10', bln:'Jun', jam:'10.00–21.00', lok:'Mall Cilacap Raya', peserta:0, kapasitas:500, tag:'Buka' },
];

const SUB_COLOR = {
  'Kriya':'#92400e','Musik':'#1e40af','Fotografi':'#374151','Seni Rupa':'#9d174d',
  'Desain Produk':'#065f46','Film':'#4c1d95','Fashion':'#6b21a8','Kuliner':'#92400e',
};

const TAG_COLOR = {
  'Hampir Penuh':{ bg:'#fef3c7', color:'#d97706' },
  'Segera':      { bg:'#dcfce7', color:'#16a34a' },
  'Buka':        { bg:'#e0f2fe', color:'#0284c7' },
};

// ── Role Modal ────────────────────────────────────────────────────────────────
function RoleModal({ mode, onClose }) {
  const isLogin = mode === 'login';
  const roles = [
    { icon:'🎨', title:'Pekerja Kreatif', desc:'Seniman, pengrajin, musisi & pelaku budaya',
      color:'#8a551c', bg:'#fdf8f2', border:'#e5d8c9',
      action:() => window.location.href = isLogin ? `${MEMBER_URL}/login` : `${MEMBER_URL}/daftar` },
    { icon:'🏪', title:'Pelaku Usaha / UMKM', desc:'Pengusaha kreatif & tenant event',
      color:'#2f6f4e', bg:'#f0fdf4', border:'#bbf7d0',
      action:() => window.location.href = isLogin ? '/login' : '/daftar-umkm' },
  ];
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:300,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:24,
        width:'100%',maxWidth:420,boxShadow:'0 24px 80px rgba(0,0,0,.25)',overflow:'hidden'}}>
        <div style={{padding:'22px 22px 14px',borderBottom:'1px solid #f3f4f6'}}>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,fontWeight:700,
            color:'#1c2b1f',marginBottom:4}}>
            {isLogin ? 'Masuk ke Platform' : 'Bergabung Sekarang'}
          </p>
          <p style={{fontSize:13,color:'#9ca3af'}}>Pilih jenis akun untuk melanjutkan</p>
        </div>
        <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
          {roles.map(r => (
            <button key={r.title} onClick={r.action}
              style={{border:`1.5px solid ${r.border}`,borderRadius:14,padding:'13px 15px',
                cursor:'pointer',textAlign:'left',background:r.bg,width:'100%',
                fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",transition:'transform .15s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateX(4px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24,flexShrink:0}}>{r.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:14,color:r.color,marginBottom:2}}>{r.title}</p>
                  <p style={{fontSize:12,color:'#9ca3af',lineHeight:1.4}}>{r.desc}</p>
                </div>
                <span style={{color:r.color,fontSize:20,flexShrink:0,opacity:.6}}>›</span>
              </div>
            </button>
          ))}
        </div>
        <div style={{padding:'8px 20px 18px',textAlign:'center',fontSize:13,color:'#9ca3af'}}>
          {isLogin
            ? <>Belum punya akun?{' '}<button style={{color:'#2f6f4e',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}} onClick={()=>onClose('register')}>Daftar</button></>
            : <>Sudah punya akun?{' '}<button style={{color:'#2f6f4e',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}} onClick={()=>onClose('login')}>Masuk</button></>
          }
        </div>
      </div>
    </div>
  );
}

// ── Portfolio Carousel ────────────────────────────────────────────────────────
function PortfolioCarousel({ items, onLogin }) {
  const [active, setActive] = useState(0);
  const [liked, setLiked]   = useState(new Set());
  const timerRef = useRef(null);

  const go = (idx) => {
    setActive(((idx % items.length) + items.length) % items.length);
  };

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => setActive(a => (a+1) % items.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => { timerRef.current = setInterval(() => setActive(a => (a+1) % items.length), 4500); };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const cur = items[active];
  const prev = items[(active - 1 + items.length) % items.length];
  const next = items[(active + 1) % items.length];

  return (
    <div onMouseEnter={pause} onMouseLeave={resume}
      style={{position:'relative',width:'100%'}}>

      {/* Main featured card */}
      <div style={{position:'relative',borderRadius:20,overflow:'hidden',
        boxShadow:'0 20px 60px rgba(0,0,0,.2)',aspectRatio:'16/9',background:'#1a2e1f'}}>
        <img
          key={cur.id}
          src={cur.img} alt={cur.judul}
          style={{width:'100%',height:'100%',objectFit:'cover',display:'block',
            transition:'opacity .5s ease'}}
          onError={e => e.target.style.display='none'}
        />
        {/* Gradient overlay */}
        <div style={{position:'absolute',inset:0,background:
          'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 50%, rgba(0,0,0,.1) 100%)'}}/>

        {/* Info overlay */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px 22px'}}>
          <span style={{display:'inline-block',padding:'3px 10px',borderRadius:20,
            background:`${SUB_COLOR[cur.sub] || '#374151'}cc`,color:'#fff',
            fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',
            marginBottom:8}}>
            {cur.sub}
          </span>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(16px,3vw,22px)',
            fontWeight:700,color:'#fff',marginBottom:5,lineHeight:1.3,
            textShadow:'0 1px 4px rgba(0,0,0,.5)'}}>
            {cur.judul}
          </p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <p style={{fontSize:12,color:'rgba(255,255,255,.65)'}}>
              {cur.author} · {cur.kota}
            </p>
            <button onClick={e=>toggleLike(cur.id,e)}
              style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',
                borderRadius:20,padding:'5px 12px',color:'#fff',fontSize:12,fontWeight:600,
                cursor:'pointer',display:'flex',alignItems:'center',gap:5,
                fontFamily:"'Plus Jakarta Sans',sans-serif",backdropFilter:'blur(8px)'}}>
              {liked.has(cur.id) ? '❤️' : '🤍'} {cur.liked + (liked.has(cur.id)?1:0)}
            </button>
          </div>
        </div>

        {/* Nav arrows */}
        <button onClick={()=>go(active-1)}
          style={{position:'absolute',top:'50%',left:12,transform:'translateY(-50%)',
            width:38,height:38,borderRadius:'50%',background:'rgba(0,0,0,.4)',
            backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',
            color:'#fff',fontSize:18,cursor:'pointer',display:'flex',
            alignItems:'center',justifyContent:'center',lineHeight:1}}>‹</button>
        <button onClick={()=>go(active+1)}
          style={{position:'absolute',top:'50%',right:12,transform:'translateY(-50%)',
            width:38,height:38,borderRadius:'50%',background:'rgba(0,0,0,.4)',
            backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',
            color:'#fff',fontSize:18,cursor:'pointer',display:'flex',
            alignItems:'center',justifyContent:'center',lineHeight:1}}>›</button>
      </div>

      {/* Dot indicators */}
      <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:14}}>
        {items.map((_,i) => (
          <button key={i} onClick={()=>go(i)}
            style={{width: i===active?20:6,height:6,borderRadius:3,border:'none',
              background: i===active?'#2f6f4e':'#d1d9c9',cursor:'pointer',
              transition:'all .3s ease',padding:0}}/>
        ))}
      </div>

      {/* Thumbnail strip */}
      <div style={{display:'flex',gap:8,marginTop:12,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
        {items.map((item,i) => (
          <button key={item.id} onClick={()=>go(i)}
            style={{flexShrink:0,width:72,height:52,borderRadius:10,overflow:'hidden',
              border: i===active?'2.5px solid #2f6f4e':'2.5px solid transparent',
              cursor:'pointer',padding:0,transition:'border .2s',background:'#1a2e1f'}}>
            <img src={item.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
              onError={e=>e.target.style.display='none'}/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CompanyProfile() {
  const navigate       = useNavigate();
  const [modal, setModal] = useState(null);
  const [filterSub, setFilterSub] = useState('Semua');
  const isLoggedIn     = !!getToken();
  const user           = getUser();

  const closeModal = next => {
    if (next==='login' || next==='register') setModal(next);
    else setModal(null);
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

  const SUBSEKTORS = ['Semua','Kriya','Musik','Fotografi','Seni Rupa','Desain Produk','Film','Fashion','Kuliner'];
  const filteredPorto = filterSub==='Semua' ? PORTFOLIO : PORTFOLIO.filter(p=>p.sub===filterSub);

  const initial = (user?.nama_pemilik||user?.nama||'U').charAt(0).toUpperCase();

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
    body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#f5f2eb;color:#1c2b1f}
    .cp-navlink:hover{background:rgba(0,0,0,.06)!important}
    .cp-sub-chip:hover{border-color:#2f6f4e!important;color:#2f6f4e!important}
    .cp-sub-chip.active{background:#2f6f4e!important;border-color:#2f6f4e!important;color:#fff!important}
    .cp-pelaku-card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,.1)}
    .cp-ev-card:hover{box-shadow:0 8px 28px rgba(0,0,0,.12)}
    .cp-porto-thumb:hover .cp-porto-overlay{opacity:1!important}
    .cp-btn-pri:hover{background:#1e5c3a!important;transform:translateY(-1px);box-shadow:0 5px 18px rgba(47,111,78,.3)!important}
    .cp-btn-out:hover{background:#f0fdf4!important}
    .cp-cta-ghost:hover{background:rgba(255,255,255,.1)!important}
    @media(max-width:640px){
      .cp-hero-h1{font-size:32px!important}
      .cp-stats-wrap{flex-wrap:wrap!important}
      .cp-stats-wrap > div{border-right:none!important;border-bottom:1px solid rgba(0,0,0,.08);padding:16px 20px!important}
      .cp-hide-mobile{display:none!important}
    }
  `;

  const Btn = ({children, primary, style={}, ...props}) => (
    <button {...props}
      className={primary?'cp-btn-pri':'cp-btn-out'}
      style={{padding:'11px 24px',borderRadius:12,fontSize:14,fontWeight:700,
        cursor:'pointer',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
        transition:'all .15s',border:'none',
        ...(primary
          ? {background:'#2f6f4e',color:'#fff'}
          : {background:'transparent',color:'#2f6f4e',border:'2px solid #2f6f4e'}),
        ...style}}>
      {children}
    </button>
  );

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
      background:'#f5f2eb',color:'#1c2b1f',minHeight:'100vh'}}>
      <style>{CSS}</style>

      {/* ════ NAV ════ */}
      <nav style={{background:'rgba(245,242,235,.96)',backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(0,0,0,.07)',position:'sticky',top:0,zIndex:100,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 clamp(16px,4vw,40px)',height:60,gap:12}}>

        <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
          style={{display:'flex',alignItems:'center',gap:10,background:'none',border:'none',
            cursor:'pointer',flexShrink:0,padding:0}}>
          <div style={{width:34,height:34,background:'linear-gradient(135deg,#2f6f4e,#4a9b6e)',
            borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:16,boxShadow:'0 3px 10px rgba(47,111,78,.25)'}}>🌿</div>
          <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:17,fontWeight:700,
            color:'#1c2b1f',letterSpacing:'-.01em',whiteSpace:'nowrap'}}>
            Pekan Banyumasan
          </span>
        </button>

        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          {[['Karya','karya'],['Event','event'],['Komunitas','komunitas']].map(([l,id]) => (
            <button key={id} className="cp-navlink cp-hide-mobile"
              style={{padding:'7px 13px',borderRadius:8,fontSize:13,fontWeight:500,
                color:'#5a4a30',background:'none',border:'none',cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'background .15s'}}
              onClick={()=>scrollTo(id)}>{l}</button>
          ))}

          {isLoggedIn ? (
            <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:4}}>
              <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 12px 5px 6px',
                background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:20}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:'#2f6f4e',
                  color:'#fff',fontSize:11,fontWeight:700,display:'flex',
                  alignItems:'center',justifyContent:'center'}}>{initial}</div>
                <span style={{fontSize:13,fontWeight:600,color:'#166534'}}>
                  {user?.nama_usaha||'Dashboard'}
                </span>
              </div>
              <Btn primary style={{padding:'8px 16px',fontSize:13}} onClick={()=>navigate('/dashboard')}>
                Dashboard →
              </Btn>
            </div>
          ) : (
            <div style={{display:'flex',gap:8,marginLeft:4}}>
              <Btn style={{padding:'8px 16px',fontSize:13}} onClick={()=>setModal('login')}>Masuk</Btn>
              <Btn primary style={{padding:'8px 16px',fontSize:13}} onClick={()=>setModal('register')}>Daftar</Btn>
            </div>
          )}
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section style={{padding:'72px clamp(16px,4vw,40px) 64px',
        background:'linear-gradient(175deg,#e8e3d8 0%,#f5f2eb 55%,#edf5ef 100%)',
        position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-100,right:-100,width:400,height:400,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(47,111,78,.08),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-60,left:-60,width:280,height:280,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(196,137,48,.06),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',
          gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>

          {/* Left: Text */}
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'5px 14px',
              background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:20,fontSize:11,
              fontWeight:700,color:'#2e7d32',marginBottom:20,letterSpacing:'.06em',textTransform:'uppercase'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#4caf50'}}/>
              Platform Budaya Banyumas Raya
            </div>
            <h1 className="cp-hero-h1" style={{fontFamily:"'Playfair Display',Georgia,serif",
              fontSize:'clamp(34px,4.5vw,54px)',fontWeight:700,color:'#1c2b1f',
              marginBottom:18,lineHeight:1.1,letterSpacing:'-.03em'}}>
              Rumah Bagi<br/>
              <em style={{color:'#2f6f4e',fontStyle:'italic'}}>Para Pekerja Kreatif</em><br/>
              <span style={{fontSize:'75%',color:'#6b5c40'}}>Banyumas Raya</span>
            </h1>
            <p style={{fontSize:16,color:'#6b5c40',marginBottom:28,lineHeight:1.7,maxWidth:420}}>
              Platform digital untuk seniman, pengrajin, musisi, dan pelaku usaha kreatif dari eks-Karesidenan Banyumas.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Btn primary style={{padding:'12px 28px',fontSize:15}} onClick={()=>setModal('register')}>
                Bergabung Sekarang
              </Btn>
              <Btn style={{padding:'11px 24px',fontSize:15}} onClick={()=>scrollTo('karya')}>
                Lihat Karya →
              </Btn>
            </div>

            {/* Stats */}
            <div className="cp-stats-wrap" style={{display:'flex',marginTop:36,
              borderTop:'1px solid rgba(0,0,0,.08)',paddingTop:24,gap:0}}>
              {[['127','Pekerja Kreatif'],['34','UMKM Aktif'],['12','Event'],['17','Subsektor']].map(([n,l],i,arr) => (
                <div key={l} style={{paddingRight:20,
                  borderRight: i<arr.length-1 ? '1px solid rgba(0,0,0,.1)' : 'none',
                  marginRight:20, ...(i===arr.length-1?{paddingRight:0,marginRight:0}:{})}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,
                    color:'#2f6f4e',lineHeight:1,marginBottom:4}}>{n}</div>
                  <div style={{fontSize:11,color:'#9c7a5e',fontWeight:500}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Carousel */}
          <div>
            <PortfolioCarousel items={PORTFOLIO.slice(0,6)} onLogin={()=>setModal('login')}/>
          </div>
        </div>
      </section>

      {/* ════ KARYA GALLERY ════ */}
      <section id="karya" style={{padding:'64px clamp(16px,4vw,40px)',maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',
          marginBottom:20,flexWrap:'wrap',gap:12}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#2f6f4e',letterSpacing:'.1em',
              textTransform:'uppercase',marginBottom:8}}>— Portofolio</p>
            <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,
              fontWeight:700,color:'#1c2b1f',letterSpacing:'-.02em'}}>
              Karya Pekerja Kreatif
            </h2>
          </div>
          <button style={{fontSize:13,color:'#2f6f4e',fontWeight:600,background:'none',border:'none',
            cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",
            textDecoration:'underline',textUnderlineOffset:3}}
            onClick={()=>setModal('register')}>Lihat semua →</button>
        </div>

        {/* Filter chips */}
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:24}}>
          {SUBSEKTORS.map(s => (
            <button key={s} onClick={()=>setFilterSub(s)}
              className={`cp-sub-chip${filterSub===s?' active':''}`}
              style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,
                border:`1.5px solid ${filterSub===s?'#2f6f4e':'#d8d3ca'}`,cursor:'pointer',
                background:filterSub===s?'#2f6f4e':'#fff',
                color:filterSub===s?'#fff':'#6b5c40',transition:'all .15s',
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {s}
            </button>
          ))}
        </div>

        {/* Masonry grid — 3 columns */}
        <div style={{columns:'3 180px',columnGap:14}}>
          {filteredPorto.map((p, i) => (
            <div key={p.id}
              style={{breakInside:'avoid',marginBottom:14,borderRadius:16,overflow:'hidden',
                background:'#fff',border:'1px solid rgba(0,0,0,.07)',cursor:'pointer',
                boxShadow:'0 2px 10px rgba(0,0,0,.06)',position:'relative'}}
              onClick={()=>setModal('login')}>
              {/* Image with variable height for masonry effect */}
              <div className="cp-porto-thumb" style={{position:'relative',
                height: [180,140,200,160,150,170,130,155][i%8]}}>
                <img src={p.img} alt={p.judul}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                  onError={e=>{ e.target.style.display='none'; }}/>
                {/* Hover overlay */}
                <div className="cp-porto-overlay"
                  style={{position:'absolute',inset:0,background:'rgba(26,58,42,.6)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    opacity:0,transition:'opacity .2s'}}>
                  <span style={{color:'#fff',fontSize:24}}>👁</span>
                </div>
              </div>
              <div style={{padding:'11px 13px 13px'}}>
                <p style={{fontSize:12,fontWeight:700,color:'#1c2b1f',marginBottom:3,lineHeight:1.35}}>{p.judul}</p>
                <p style={{fontSize:11,color:'#9c7a5e',marginBottom:6}}>{p.author}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{display:'inline-block',padding:'2px 8px',
                    background:'rgba(47,111,78,.08)',borderRadius:20,
                    fontSize:9,fontWeight:700,color:'#2f6f4e',
                    textTransform:'uppercase',letterSpacing:'.05em',border:'1px solid rgba(47,111,78,.15)'}}>
                    {p.sub}
                  </span>
                  <span style={{fontSize:11,color:'#c0b8ac'}}>❤ {p.liked}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ EVENTS ════ */}
      <section id="event" style={{background:'#1a2e22',padding:'64px clamp(16px,4vw,40px)'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',
            marginBottom:28,flexWrap:'wrap',gap:12}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:'#86efac',letterSpacing:'.1em',
                textTransform:'uppercase',marginBottom:8}}>— Event</p>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,fontWeight:700,
                color:'#fff',letterSpacing:'-.02em'}}>Event Mendatang</h2>
            </div>
            <button style={{fontSize:13,color:'#86efac',fontWeight:600,background:'none',border:'none',
              cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",
              textDecoration:'underline',textUnderlineOffset:3}}
              onClick={()=>setModal('login')}>Daftar event →</button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {EVENTS.map(e => {
              const pct = Math.round(e.peserta/e.kapasitas*100);
              const tc  = TAG_COLOR[e.tag] || TAG_COLOR['Buka'];
              return (
                <div key={e.id} className="cp-ev-card"
                  style={{background:'rgba(255,255,255,.06)',borderRadius:20,overflow:'hidden',
                    border:'1px solid rgba(255,255,255,.1)',transition:'box-shadow .2s',
                    display:'flex',flexDirection:'column'}}>
                  {/* Header */}
                  <div style={{padding:'18px 18px 14px',flex:1,display:'flex',flexDirection:'column',gap:10}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                      <div style={{background:'rgba(255,255,255,.12)',borderRadius:10,
                        padding:'8px 12px',textAlign:'center',flexShrink:0}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:800,
                          color:'#fff',lineHeight:1}}>{e.tgl}</div>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.55)',marginTop:2,
                          fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{e.bln}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,padding:'3px 10px',
                        borderRadius:20,whiteSpace:'nowrap',flexShrink:0,...tc}}>{e.tag}</span>
                    </div>
                    <p style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,
                      color:'#fff',lineHeight:1.4,flex:1}}>{e.nama}</p>
                    <p style={{fontSize:11,color:'rgba(255,255,255,.45)',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>📍 {e.lok}</p>
                  </div>
                  {/* Footer */}
                  <div style={{padding:'12px 16px 16px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
                    <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:99,marginBottom:6}}>
                      <div style={{height:'100%',background:'#4ade80',borderRadius:99,width:`${pct}%`}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,
                      color:'rgba(255,255,255,.45)',marginBottom:12}}>
                      <span>{e.peserta} / {e.kapasitas}</span>
                      <span style={{fontWeight:700,color:'#86efac'}}>{pct}%</span>
                    </div>
                    <button
                      style={{width:'100%',padding:'9px',borderRadius:10,border:'1.5px solid rgba(255,255,255,.3)',
                        color:'rgba(255,255,255,.8)',background:'transparent',fontSize:12,fontWeight:700,
                        cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'background .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                      onClick={()=>setModal('login')}>Daftar Event</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════ KOMUNITAS ════ */}
      <section id="komunitas" style={{padding:'64px clamp(16px,4vw,40px)',maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',
          marginBottom:24,flexWrap:'wrap',gap:12}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:'#2f6f4e',letterSpacing:'.1em',
              textTransform:'uppercase',marginBottom:8}}>— Komunitas</p>
            <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:26,fontWeight:700,
              color:'#1c2b1f',letterSpacing:'-.02em'}}>Pelaku Kreatif</h2>
          </div>
          <button style={{fontSize:13,color:'#2f6f4e',fontWeight:600,background:'none',border:'none',
            cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",
            textDecoration:'underline',textUnderlineOffset:3}}
            onClick={()=>setModal('register')}>Direktori lengkap →</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
          {PORTFOLIO.slice(0,7).map(p => (
            <div key={p.id} className="cp-pelaku-card"
              style={{background:'#fff',borderRadius:16,border:'1px solid rgba(0,0,0,.06)',
                padding:'16px 12px',textAlign:'center',cursor:'pointer',
                boxShadow:'0 2px 8px rgba(0,0,0,.05)',transition:'all .2s'}}
              onClick={()=>setModal('login')}>
              <div style={{width:48,height:48,borderRadius:14,margin:'0 auto 10px',
                overflow:'hidden',border:`2px solid ${(SUB_COLOR[p.sub]||'#374151')}22`}}>
                <img src={p.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}
                  onError={e=>{e.target.style.display='none';}}/>
              </div>
              <p style={{fontSize:12,fontWeight:700,color:'#1c2b1f',marginBottom:2}}>{p.author.split(' ').slice(0,2).join(' ')}</p>
              <p style={{fontSize:10,color:'#9c7a5e'}}>{p.sub}</p>
            </div>
          ))}
          <div className="cp-pelaku-card"
            style={{background:'#fff',borderRadius:16,border:'1.5px dashed #c8d8c8',
              padding:'16px 12px',textAlign:'center',cursor:'pointer',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              minHeight:100,transition:'all .2s'}}
            onClick={()=>setModal('register')}>
            <div style={{width:36,height:36,borderRadius:12,background:'#f0fdf4',
              border:'1.5px solid #bbf7d0',display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:20,marginBottom:8}}>+</div>
            <p style={{fontSize:11,color:'#2f6f4e',fontWeight:700}}>Bergabung</p>
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section style={{margin:'0 clamp(16px,4vw,40px) 64px',maxWidth:900,
        marginLeft:'auto',marginRight:'auto'}}>
        <div style={{background:'linear-gradient(135deg,#1c2b1f,#2d3a28)',borderRadius:24,
          padding:'52px 40px',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,.15)'}}>
          <p style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.3)',
            letterSpacing:'.12em',textTransform:'uppercase',marginBottom:14}}>— Mulai sekarang</p>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:28,fontWeight:700,
            color:'#fff',marginBottom:12,letterSpacing:'-.03em',lineHeight:1.15}}>
            Bergabung di Ekosistem<br/>Kreatif Banyumas Raya
          </h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:28,
            lineHeight:1.7,maxWidth:480,margin:'0 auto 28px'}}>
            Daftarkan diri sebagai Pekerja Kreatif atau UMKM dan jadilah bagian dari gerakan pelestarian budaya digital Banyumas.
          </p>
          <div style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
            <Btn primary
              style={{padding:'13px 30px',fontSize:15,background:'#4a9b6e',
                boxShadow:'0 4px 16px rgba(74,155,110,.4)'}}
              onClick={()=>setModal('register')}>Bergabung Sekarang</Btn>
            <button className="cp-cta-ghost"
              style={{padding:'12px 26px',fontSize:14,fontWeight:600,
                border:'1.5px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.6)',
                borderRadius:12,background:'transparent',cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'background .15s'}}
              onClick={()=>setModal('login')}>Sudah punya akun</button>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{borderTop:'1px solid rgba(0,0,0,.08)',padding:'28px clamp(16px,4vw,40px)',
        textAlign:'center'}}>
        <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,
          color:'#4a3728',marginBottom:5}}>Pekan Banyumasan</p>
        <p style={{fontSize:12,color:'#9c7a5e',lineHeight:1.7}}>
          Platform Ekonomi Kreatif & Kebudayaan Banyumas Raya
        </p>
        <p style={{fontSize:12,color:'#c0b8ac',marginTop:12}}>
          © 2025 Pekan Banyumasan ·{' '}
          <button style={{color:'#2f6f4e',background:'none',border:'none',cursor:'pointer',
            fontSize:12,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}
            onClick={()=>setModal('login')}>Masuk</button>
        </p>
      </footer>

      {modal && <RoleModal mode={modal} onClose={closeModal}/>}
    </div>
  );
}
