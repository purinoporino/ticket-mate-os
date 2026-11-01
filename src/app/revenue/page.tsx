export const dynamic = 'force-dynamic'
import { unstable_noStore as noStore } from 'next/cache'
import { sql } from '@/lib/db'

export default async function RevenuePage() {
  noStore()
  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status='booking_successful') as total_success,
      SUM(total_price) FILTER (WHERE status='booking_successful') as total_revenue,
      SUM(total_price) FILTER (WHERE status='booking_successful' AND DATE(created_at)=CURRENT_DATE) as today_revenue,
      SUM(total_price) FILTER (WHERE status='booking_successful' AND DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW())) as month_revenue,
      COUNT(*) FILTER (WHERE DATE(created_at)=CURRENT_DATE) as today_orders
    FROM orders
  ` as any[]

  const monthly = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
      COUNT(*) FILTER (WHERE status='booking_successful') as success,
      SUM(total_price) FILTER (WHERE status='booking_successful') as revenue
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `

  const topEvents = await sql`
    SELECT e.name, COUNT(o.id) as order_count, SUM(o.total_price) as revenue
    FROM orders o
    JOIN events e ON o.event_id = e.id
    WHERE o.status = 'booking_successful'
    GROUP BY e.id, e.name
    ORDER BY revenue DESC NULLS LAST
    LIMIT 5
  `

  function baht(n: any) {
    const num = Number(n) || 0
    return '฿' + num.toLocaleString('th-TH', { minimumFractionDigits: 0 })
  }

  const cards = [
    { label: 'รายได้วันนี้', value: baht(stats?.today_revenue), color: '#10b981' },
    { label: 'รายได้เดือนนี้', value: baht(stats?.month_revenue), color: '#a78bfa' },
    { label: 'รายได้รวม', value: baht(stats?.total_revenue), color: '#f59e0b' },
    { label: 'จองสำเร็จรวม', value: `${stats?.total_success || 0} ออเดอร์`, color: '#3b82f6' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0', marginBottom: 24 }}>รายได้</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#12122a', borderRadius: 12, padding: 20, borderLeft: `4px solid ${c.color}` }}>
            <div style={{ color: '#a0a0b8', fontSize: 13, marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Monthly breakdown */}
        <div style={{ background: '#12122a', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0', marginBottom: 16 }}>รายได้รายเดือน</h2>
          {(monthly as any[]).length === 0 ? (
            <p style={{ color: '#a0a0b8' }}>ยังไม่มีข้อมูล</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {(monthly as any[]).map(m => (
                <div key={m.month} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a3a' }}>
                  <span style={{ color: '#a0a0b8' }}>{m.month}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{baht(m.revenue)}</span>
                    <span style={{ color: '#4a4a6a', fontSize: 12, marginLeft: 8 }}>{m.success} ออเดอร์</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top events */}
        <div style={{ background: '#12122a', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0', marginBottom: 16 }}>คอนเสิร์ตรายได้สูงสุด</h2>
          {(topEvents as any[]).length === 0 ? (
            <p style={{ color: '#a0a0b8' }}>ยังไม่มีข้อมูล</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {(topEvents as any[]).map((ev, i) => (
                <div key={ev.name} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a3a' }}>
                  <span style={{ color: '#4a4a6a', fontWeight: 700, minWidth: 20 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e8e8f0', fontSize: 14 }}>{ev.name}</div>
                    <div style={{ color: '#4a4a6a', fontSize: 12 }}>{ev.order_count} ออเดอร์</div>
                  </div>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{baht(ev.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
