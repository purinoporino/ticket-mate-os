import { unstable_noStore as noStore } from 'next/cache'
import { sql } from '@/lib/db'

export default async function WorkspacePage() {
  noStore()
  const active = await sql`
    SELECT o.*, e.name as event_name, c.name as customer_name, e.ticket_url
    FROM orders o
    LEFT JOIN events e ON o.event_id = e.id
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.status IN ('bot_working','awaiting_confirmation','ready_for_booking')
    ORDER BY o.updated_at DESC
    LIMIT 20
  `
  const logs = await sql`
    SELECT l.*, o.order_number
    FROM activity_logs l
    LEFT JOIN orders o ON l.order_id = o.id
    ORDER BY l.created_at DESC
    LIMIT 50
  `
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: 'setTimeout(()=>location.reload(),5000)' }} />
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>Booking Bot</h1>
      <p style={{ color: '#a0a0b8', marginBottom: 24 }}>งานที่บอทกำลังทำอยู่และ log ล่าสุด (รีเฟรชทุก 5 วิ)</p>

      {/* Active jobs */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>งานที่กำลังทำ ({active.length})</h2>
      {active.length === 0 ? (
        <div style={{ background: '#12122a', borderRadius: 12, padding: 32, textAlign: 'center', color: '#a0a0b8', marginBottom: 24 }}>
          ไม่มีงานที่กำลังทำ — บอทรอออเดอร์ใหม่อยู่
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
          {(active as any[]).map((o) => {
            const colors: Record<string,string> = { ready_for_booking:'#3b82f6', bot_working:'#f59e0b', awaiting_confirmation:'#ef4444' }
            const labels: Record<string,string> = { ready_for_booking:'รอกด', bot_working:'กำลังกด', awaiting_confirmation:'รอยืนยัน' }
            return (
              <div key={o.id} style={{ background: '#12122a', borderRadius: 12, padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#e8e8f0' }}>{o.order_number} — {o.event_name || '?'}</div>
                  <div style={{ color: '#a0a0b8', fontSize: 13, marginTop: 4 }}>{o.customer_name} · {o.quantity} ใบ</div>
                </div>
                <span style={{ background: colors[o.status]+'22', color: colors[o.status], padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                  {labels[o.status]}
                </span>
                {o.bot_screenshot_url && (
                  <a href={o.bot_screenshot_url} target="_blank" rel="noreferrer" style={{ color:'#60a5fa', fontSize:12 }}>📸 ดูรูป</a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Activity log */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>Activity Log</h2>
      <div style={{ background: '#0a0a18', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 12, maxHeight: 400, overflowY: 'auto' }}>
        {(logs as any[]).map(l => (
          <div key={l.id} style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid #12122a' }}>
            <span style={{ color: '#4a4a6a', flexShrink: 0 }}>{new Date(l.created_at).toLocaleTimeString('th-TH')}</span>
            <span style={{ color: '#a78bfa', flexShrink: 0 }}>{l.order_number}</span>
            <span style={{ color: '#10b981', flexShrink: 0 }}>{l.action}</span>
            <span style={{ color: '#6b7280', wordBreak: 'break-all' }}>{JSON.stringify(l.details)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
