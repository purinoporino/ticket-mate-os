"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkspaceClient({ active, logs }: { active: any[], logs: any[] }) {
  const router = useRouter()
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null)
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

  const colors: Record<string,string> = { ready_for_booking:'#3b82f6', bot_working:'#f59e0b', awaiting_confirmation:'#ef4444' }
  const labels: Record<string,string> = { ready_for_booking:'รอกด', bot_working:'กำลังกด', awaiting_confirmation:'รอยืนยัน' }

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
              <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom: o.bot_screenshot_url ? 12 : 0 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#e8e8f0' }}>{o.order_number} — {o.event_name || '?'}</div>
                  <div style={{ color:'#a0a0b8', fontSize:13, marginTop:4 }}>{o.customer_name} · {o.quantity} ใบ</div>
                </div>
                <span style={{ background: colors[o.status]+'22', color: colors[o.status], padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                  {labels[o.status]}
                </span>
                {o.bot_screenshot_url && (
                  <button onClick={() => setScreenshot(o.bot_screenshot_url)} style={{ padding:'6px 14px', background:'#1e3a5f', color:'#60a5fa', border:'1px solid #3b82f6', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                    📸 ดูรูป
                  </button>
                )}
                {o.status === 'awaiting_confirmation' && (
                  <button onClick={() => setConfirmOrderId(o.id)} style={{ padding:'6px 14px', background:'#10b981', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                    ✅ กด ยืนยัน
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
