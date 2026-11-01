export const dynamic = 'force-dynamic'
import { unstable_noStore as noStore } from 'next/cache'
import { getDashboardStats, getOrders } from '@/lib/db'

const STATUS_LABEL: Record<string, string> = {
  pending: 'ใหม่',
  ready_for_booking: 'รอกด',
  bot_working: 'กำลังกด',
  awaiting_confirmation: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  booking_successful: 'สำเร็จ',
  booking_failed: 'ล้มเหลว',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#7c3aed',
  ready_for_booking: '#3b82f6',
  bot_working: '#f59e0b',
  awaiting_confirmation: '#ef4444',
  confirmed: '#06b6d4',
  booking_successful: '#10b981',
  booking_failed: '#6b7280',
}

export default async function Dashboard() {
  noStore()
  const [stats, orders] = await Promise.all([
    getDashboardStats(),
    getOrders(10),
  ])

  const revenue = stats?.revenue_today
    ? '฿' + Number(stats.revenue_today).toLocaleString('th-TH')
    : '฿0'

  const statCards = [
    { label: 'ออเดอร์ใหม่', value: String(stats?.pending ?? 0), icon: '🆕', color: '#7c3aed' },
    { label: 'กำลังดำเนินการ', value: String(stats?.in_progress ?? 0), icon: '⚡', color: '#f59e0b' },
    { label: 'สำเร็จวันนี้', value: String(stats?.success_today ?? 0), icon: '✅', color: '#10b981' },
    { label: 'รายได้วันนี้', value: revenue, icon: '💰', color: '#a855f7' },
  ]

  return (
    <div>
      {/* Auto-refresh every 5 seconds */}
      <script dangerouslySetInnerHTML={{ __html: 'setTimeout(()=>location.reload(),5000)' }} />
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0' }}>Dashboard</h1>
        <p style={{ color: '#a0a0b8', marginTop: 4, fontSize: 14 }}>ภาพรวมระบบ Ticket Mate OS</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 12,
            padding: 20, display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{ fontSize: 32, background: s.color + '22', borderRadius: 10, padding: 10 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#a0a0b8' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #2a2a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0' }}>ออเดอร์ล่าสุด</h2>
          <a href="/orders" style={{ fontSize: 13, color: '#7c3aed' }}>ดูทั้งหมด →</a>
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#606078' }}>ยังไม่มีออเดอร์</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#252535' }}>
                {['รหัส','ลูกค้า','คอนเสิร์ต','โซน','สถานะ','เวลา'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#606078', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders as Record<string, unknown>[]).map((o, i) => {
                const status = o.status as string
                const color = STATUS_COLOR[status] ?? '#6b7280'
                const label = STATUS_LABEL[status] ?? status
                const createdAt = o.created_at ? new Date(o.created_at as string).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '-'
                return (
                  <tr key={o.id as string} style={{ borderTop: '1px solid #2a2a3a', background: i % 2 === 0 ? 'transparent' : '#1e1e2a' }}>
                    <td style={{ padding: '14px 20px', color: '#a855f7', fontWeight: 600 }}>{o.order_number as string}</td>
                    <td style={{ padding: '14px 20px', color: '#e8e8f0' }}>{(o.customer_name as string) ?? '-'}</td>
                    <td style={{ padding: '14px 20px', color: '#a0a0b8' }}>{(o.event_name as string) ?? '-'}</td>
                    <td style={{ padding: '14px 20px', color: '#a0a0b8' }}>{(o.seat_zone as string) ?? '-'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: color + '22', color }}>{label}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#606078', fontSize: 12 }}>{createdAt}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
