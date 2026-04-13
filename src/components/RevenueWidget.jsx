// RevenueWidget.jsx — Widget Revenue Sharing untuk Dashboard UMKM
// Disisipkan di atas Dashboard, data dummy untuk demo
import { TrendingUp, Percent, ArrowUpRight } from 'lucide-react';

const fmtRp = v => 'Rp ' + (v||0).toLocaleString('id-ID');

const DUMMY = {
  posisi: 'Zona A - Lapak 3',
  komisi_persen: 15,
  total_penjualan_bulan: 4500000,
  komisi_bulan: 675000,
  diterima_bulan: 3825000,
  total_penjualan_all: 12800000,
};

export default function RevenueWidget() {
  const d = DUMMY;
  const pct = Math.round(d.komisi_bulan / (d.total_penjualan_bulan||1) * 100);
  return (
    <div style={{
      background:'linear-gradient(135deg,#1a3a2a 0%,#2f6f4e 100%)',
      borderRadius:16, padding:'20px 20px 16px', color:'#fff',
      marginBottom:20, position:'relative', overflow:'hidden',
    }}>
      {/* BG decoration */}
      <div style={{position:'absolute',right:-20,top:-20,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
      <div style={{position:'absolute',right:30,bottom:-30,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,position:'relative'}}>
        <div>
          <p style={{fontSize:11,opacity:.7,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:4}}>
            Revenue Sharing · Bulan Ini
          </p>
          <p style={{fontSize:11,opacity:.5}}>📍 {d.posisi}</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.12)',borderRadius:8,padding:'6px 10px',display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700}}>
          <Percent size={12}/> {d.komisi_persen}% komisi
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,position:'relative'}}>
        {[
          ['Total Penjualan', fmtRp(d.total_penjualan_bulan), '#86efac'],
          ['Komisi ('+d.komisi_persen+'%)', fmtRp(d.komisi_bulan), '#fca5a5'],
          ['Kamu Terima', fmtRp(d.diterima_bulan), '#93c5fd'],
        ].map(([l, v, c]) => (
          <div key={l} style={{background:'rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 12px'}}>
            <p style={{fontSize:10,opacity:.6,marginBottom:4}}>{l}</p>
            <p style={{fontSize:13,fontWeight:700,color:c,lineHeight:1.2}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{marginTop:14,position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,opacity:.5,marginBottom:4}}>
          <span>Distribusi bulan ini</span>
          <span>Diterima {100-d.komisi_persen}% · Komisi {d.komisi_persen}%</span>
        </div>
        <div style={{height:4,background:'rgba(255,255,255,0.15)',borderRadius:99,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${100-d.komisi_persen}%`,background:'#86efac',borderRadius:99}}/>
        </div>
      </div>
    </div>
  );
}
