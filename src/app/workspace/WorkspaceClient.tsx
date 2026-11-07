
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Generate a smart bookmarklet that runs in the user's real browser
function generateBookmarklet(order: any): string {
  const zone = order.seat_zone || 'B1'
  const qty = order.quantity || 1
  const showId = order.preferred_show_id || '81858' // default 14:00
  const bookingUrl = order.ticket_url?.includes('thaiticketmajor.com')
    ? `https://booking.thaiticketmajor.com/booking/3m/zones.php?query=622`
    : order.ticket_url || ''

  const script = `(function(){
  var CFG={showId:'${showId}',zone:'${zone}',qty:${qty},bookingUrl:'${bookingUrl}'};
  var p=location.href;
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function setVal(el,v){el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}));}
  function flash(msg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;top:16px;right:16px;z-index:99999;background:#7c3aed;color:#fff;padding:12px 20px;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 20px rgba(0,0,0,0.4)';document.body.appendChild(d);setTimeout(function(){d.remove()},3000);}
  async function run(){
    if(p.includes('zones.php')){
      flash('🤖 Ticket Mate: เลือกรอบ...');
      var rdId=document.querySelector('#rdId');
      if(rdId&&!rdId.value){setVal(rdId,CFG.showId);}
      await wait(1000);
      var areas=document.querySelectorAll('map area');
      var clicked=false;
      for(var i=0;i<areas.length;i++){
        var href=areas[i].getAttribute('href')||'';
        if(href.includes(CFG.zone)){
          flash('🤖 Ticket Mate: เลือก Zone '+CFG.zone+'...');
          if(typeof selectzone==='function'){selectzone(href,new MouseEvent('click'));}
          else{areas[i].click();}
          clicked=true;break;
        }
      }
      if(!clicked){flash('⚠️ ไม่พบ Zone '+CFG.zone+' — กรุณาเลือกเอง');}
    }else if(p.includes('fixed.php')||p.includes('seat')||p.includes('ticket')){
      flash('🤖 Ticket Mate: ตั้งจำนวน '+CFG.qty+' ใบ...');
      await wait(500);
      var qEls=[].slice.call(document.querySelectorAll('select[name*="qty"],select[id*="qty"],input[name*="qty"],input[id*="qty"],select[name*="amount"],#numberOfTickets,.qty-select'));
      if(qEls.length>0){setVal(qEls[0],String(CFG.qty));}
      await wait(800);
      var addBtn=document.querySelector('.btn-addcart,button.addtocart,[class*="add-cart"],[onclick*="addCart"],[onclick*="addtocart"],button[type="submit"]');
      if(addBtn){flash('🤖 Ticket Mate: Add to Cart...');addBtn.click();}
      else{flash('⚠️ กรุณากด Add to Cart ด้วยตัวเองแล้วคลิก script อีกครั้ง');}
    }else if(p.includes('payment')||p.includes('checkout')||p.includes('confirm')){
      flash('✋ Ticket Mate: หยุดที่หน้าชำระเงิน — กรอกข้อมูลและยืนยันด้วยตัวเองนะครับ');
      alert('💳 Order ${order.order_number}\\n\\nbot หยุดที่หน้านี้แล้วครับ\\nกรุณากรอกข้อมูลชำระเงินและยืนยันด้วยตัวเองนะครับ\\n\\n⚠️ ห้ามกรอก OTP หรือรหัสผ่านในระบบอัตโนมัติ');
    }else if(p.includes('thaiticketmajor.com')){
      flash('🤖 Ticket Mate: เปิดหน้าจอง...');
      location.href=CFG.bookingUrl;
    }else{
      alert('กรุณาเปิด thaiticketmajor.com ก่อนแล้วคลิก bookmarklet นี้นะครับ');
    }
  }
  run();
})();`

  return 'javascript:' + encodeURIComponent(script)
}

export default function WorkspaceClient({ active, logs }: { active: any[], logs: any[] }) {
  const router = useRouter()
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null)
  const [scriptOrder, setScriptOrder] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => router.refresh(), 5000)
    return () => clearTimeout(t)
  }, [active, logs])

  async function changeStatus(orderId: string, status: string) {
    setActing(true)
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    })
    setActing(false)
    setConfirmOrderId(null)
    router.refresh()
  }

  function copyBookmarklet(order: any) {
    const link = generateBookmarklet(order)
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const colors: Record<string,string> = { ready_for_booking:'#3b82f6', bot_working:'#f59e0b', awaiting_confirmation:'#ef4444' }
  const labels: Record<string,string> = { ready_for_booking:'รอกด', bot_working:'กำลังกด', awaiting_confirmation:'รอยืนยัน' }

  const zoneOptions = ['A1','A2','A3','B1','B2','B3','C1','C4']
  const showOptions = [{ val:'81858', label:'14:00' }, { val:'81859', label:'19:00' }]

  return (
    <div>
      {/* Screenshot modal */}
      {screenshot && (
        <div onClick={() => setScreenshot(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, cursor:'zoom-out' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth:'90vw', maxHeight:'90vh', position:'relative' }}>
            <img src={screenshot} alt="screenshot" style={{ maxWidth:'90vw', maxHeight:'85vh', borderRadius:12, display:'block' }} />
            <button onClick={() => setScreenshot(null)} style={{ position:'absolute', top:-12, right:-12, background:'#ef4444', color:'#fff', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', fontSize:16, fontWeight:700 }}>×</button>
          </div>
        </div>
      )}

      {/* Confirm purchase modal */}
      {confirmOrderId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#1a1a2e', borderRadius:12, padding:28, maxWidth:400, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🎫</div>
            <h3 style={{ color:'#e8e8f0', marginBottom:8 }}>ยืนยันการซื้อตั๋ว?</h3>
            <p style={{ color:'#fbbf24', fontSize:13, marginBottom:8 }}>⚠️ ตรวจสอบ screenshot ให้แน่ใจก่อนกดยืนยัน</p>
            <p style={{ color:'#a0a0b8', fontSize:13, marginBottom:20 }}>บอทจะกด "ยืนยันการซื้อ" ขั้นสุดท้าย</p>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button disabled={acting} onClick={() => changeStatus(confirmOrderId, 'confirmed')} style={{ padding:'10px 24px', background:'#10b981', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:15 }}>
                {acting ? '...' : '✅ ยืนยัน ซื้อเลย!'}
              </button>
              <button onClick={() => setConfirmOrderId(null)} style={{ padding:'10px 24px', background:'#1a1a3a', color:'#a0a0b8', border:'1px solid #2a2a4a', borderRadius:8, cursor:'pointer' }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Script Modal */}
      {scriptOrder && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}>
          <div style={{ background:'#13132a', borderRadius:16, padding:28, maxWidth:540, width:'95%', position:'relative' }}>
            <button onClick={() => setScriptOrder(null)} style={{ position:'absolute', top:12, right:12, background:'transparent', color:'#a0a0b8', border:'none', cursor:'pointer', fontSize:20 }}>×</button>
            <h3 style={{ color:'#a78bfa', marginBottom:4, fontSize:18 }}>🚀 Booking Assist Script</h3>
            <p style={{ color:'#a0a0b8', fontSize:13, marginBottom:16 }}>{scriptOrder.order_number} — {scriptOrder.event_name}</p>

            {/* Zone & show time config */}
            <div style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ flex:1 }}>
                <label style={{ color:'#6b7280', fontSize:12, display:'block', marginBottom:4 }}>Zone ที่ต้องการ</label>
                <select
                  value={scriptOrder.seat_zone || 'B1'}
                  onChange={e => setScriptOrder({...scriptOrder, seat_zone: e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', background:'#1a1a3a', color:'#e8e8f0', border:'1px solid #2a2a5a', borderRadius:8 }}
                >
                  {zoneOptions.map(z => <option key={z} value={z}>Zone {z}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ color:'#6b7280', fontSize:12, display:'block', marginBottom:4 }}>รอบการแสดง</label>
                <select
                  value={scriptOrder.preferred_show_id || '81858'}
                  onChange={e => setScriptOrder({...scriptOrder, preferred_show_id: e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', background:'#1a1a3a', color:'#e8e8f0', border:'1px solid #2a2a5a', borderRadius:8 }}
                >
                  {showOptions.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ width:70 }}>
                <label style={{ color:'#6b7280', fontSize:12, display:'block', marginBottom:4 }}>จำนวน</label>
                <input
                  type="number" min={1} max={6}
                  value={scriptOrder.quantity || 1}
                  onChange={e => setScriptOrder({...scriptOrder, quantity: parseInt(e.target.value)})}
                  style={{ width:'100%', padding:'8px 10px', background:'#1a1a3a', color:'#e8e8f0', border:'1px solid #2a2a5a', borderRadius:8 }}
                />
              </div>
            </div>

            {/* How to use */}
            <div style={{ background:'#0d1f35', borderRadius:10, padding:14, marginBottom:16 }}>
              <div style={{ color:'#60a5fa', fontWeight:700, fontSize:13, marginBottom:10 }}>วิธีใช้งาน</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  '1️⃣ กด "Copy Bookmarklet" แล้ว bookmark ใน Chrome (ตั้งชื่อ "TTM Bot")',
                  '2️⃣ เปิด Chrome → login ThaiTicketMajor ให้พร้อม',
                  '3️⃣ ตอน Sale เปิด → เปิดหน้า concert แล้วคลิก bookmark "TTM Bot"',
                  '4️⃣ Script จะ auto เลือกรอบ → zone → จำนวน ให้เอง',
                  '5️⃣ หน้า Payment → กรอกข้อมูลและกดยืนยันเองครับ 💳',
                ].map((s,i) => <div key={i} style={{ color:'#a0a0b8', fontSize:13 }}>{s}</div>)}
              </div>
            </div>

            {/* Bookmarklet link */}
            <div style={{ background:'#0a0a18', borderRadius:8, padding:10, marginBottom:14, fontFamily:'monospace', fontSize:11, color:'#4ade80', wordBreak:'break-all', maxHeight:80, overflowY:'auto' }}>
              {generateBookmarklet(scriptOrder).slice(0, 120)}...
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => copyBookmarklet(scriptOrder)}
                style={{ flex:1, padding:'11px', background: copied ? '#10b981' : '#7c3aed', color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:14 }}
              >
                {copied ? '✅ Copied!' : '📋 Copy Bookmarklet'}
              </button>
              <a
                href={generateBookmarklet(scriptOrder)}
                style={{ padding:'11px 18px', background:'#1a1a3a', color:'#a78bfa', border:'1px solid #3b3b6a', borderRadius:9, cursor:'pointer', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center' }}
                draggable
              >
                🔖 Drag to Bookmarks Bar
              </a>
            </div>
            <p style={{ color:'#4a4a6a', fontSize:11, marginTop:10, textAlign:'center' }}>
              ⚠️ Script หยุดก่อน payment เสมอ — ไม่มีการกรอก password หรือบัตรเครดิต
            </p>
          </div>
        </div>
      )}

      <h1 style={{ fontSize:26, fontWeight:700, color:'#e8e8f0', marginBottom:8 }}>Booking Bot</h1>
      <p style={{ color:'#a0a0b8', marginBottom:24 }}>งานที่บอทกำลังทำอยู่และ log ล่าสุด (รีเฟรชทุก 5 วิ)</p>

      <h2 style={{ fontSize:16, fontWeight:600, color:'#a78bfa', marginBottom:12 }}>งานที่กำลังทำ ({active.length})</h2>
      {active.length === 0 ? (
        <div style={{ background:'#12122a', borderRadius:12, padding:32, textAlign:'center', color:'#a0a0b8', marginBottom:24 }}>
          ไม่มีงานที่กำลังทำ — บอทรอออเดอร์ใหม่อยู่
        </div>
      ) : (
        <div style={{ display:'grid', gap:12, marginBottom:24 }}>
          {active.map(o => (
            <div key={o.id} style={{ background:'#12122a', borderRadius:12, padding:18 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontWeight:700, color:'#e8e8f0' }}>{o.order_number} — {o.event_name || '?'}</div>
                  <div style={{ color:'#a0a0b8', fontSize:13, marginTop:4 }}>{o.customer_name} · {o.quantity} ใบ{o.seat_zone ? ` · Zone ${o.seat_zone}` : ''}</div>
                </div>
                <span style={{ background: colors[o.status]+'22', color: colors[o.status], padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                  {labels[o.status]}
                </span>
                {/* Booking Script button */}
                {o.ticket_url && (
                  <button onClick={() => setScriptOrder({...o, preferred_show_id:'81858'})} style={{ padding:'6px 12px', background:'#1e1b4b', color:'#a78bfa', border:'1px solid #4c1d95', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                    🚀 Script จอง
                  </button>
                )}
                {o.bot_screenshot_url && (
                  <button onClick={() => setScreenshot(o.bot_screenshot_url)} style={{ padding:'6px 12px', background:'#1e3a5f', color:'#60a5fa', border:'1px solid #3b82f6', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                    📸 ดูรูป
                  </button>
                )}
                {o.status === 'awaiting_confirmation' && (
                  <button onClick={() => setConfirmOrderId(o.id)} style={{ padding:'6px 14px', background:'#10b981', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                    ✅ กดยืนยัน
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize:16, fontWeight:600, color:'#a78bfa', marginBottom:12 }}>Activity Log</h2>
      <div style={{ background:'#0a0a18', borderRadius:12, padding:16, fontFamily:'monospace', fontSize:12, maxHeight:400, overflowY:'auto' }}>
        {logs.map(l => (
          <div key={l.id} style={{ display:'flex', gap:12, padding:'5px 0', borderBottom:'1px solid #12122a' }}>
            <span style={{ color:'#4a4a6a', flexShrink:0 }}>{new Date(l.created_at).toLocaleTimeString('th-TH')}</span>
            <span style={{ color:'#a78bfa', flexShrink:0 }}>{l.order_number}</span>
            <span style={{ color:'#10b981', flexShrink:0 }}>{l.action}</span>
            <span style={{ color:'#6b7280', wordBreak:'break-all' }}>{JSON.stringify(l.details)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
