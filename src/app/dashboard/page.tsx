export default function Dashboard() {
  const stats = [
    { label: 'ออเดอร์ใหม่', value: '3', icon: '🆕', color: '#7c3aed' },
    { label: 'กำลังดำเนินการ', value: '5', icon: '⚡', color: '#f59e0b' },
    { label: 'สำเร็จวันนี้', value: '8', icon: '✅', color: '#10b981' },
    { label: 'รายได้วันนี้', value: '฿2,400', icon: '💰', color: '#a855f7' },
  ]
  const orders = [
    { id: 'TM010', customer: 'ณัฐวุฒิ', concert: 'MILLI WORLD TOUR', seat: 'Zone A', tier: 'Priority', status: 'ใหม่', statusColor: '#7c3aed' },
    { id: 'TM009', customer: 'สุภาพร', concert: 'BODYSLAM FAREWELL', seat: 'Zone B', tier: 'Standard', status: 'กำลังกด', statusColor: '#f59e0b' },
    { id: 'TM008', customer: 'กัลยา', concert: 'PHUM VIPHURIT', seat: 'Zone A', tier: 'VIP', status: 'สำเร็จ', statusColor: '#10b981' },
    { id: 'TM007', customer: 'ธนกร', concert: 'BNK48 CONCERT', seat: 'Zone C', tier: 'Standard', status: 'สำเร็จ', statusColor: '#10b981' },
    { id: 'TM006', customer: 'พิมพ์', concert: 'MILLI WORLD TOUR', seat: 'VIP', tier: 'VIP', status: 'รอยืนยัน', statusColor: '#ef4444' },
  ]
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0' }}>Dashboard</h1>
        <p style={{ color: '#a0a0b8', marginTop: 4, fontSize: 14 }}>ภาพรวมระบบ Ticket Mate OS</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#252535' }}>
              {['รหัส','ลูกค้า','คอนเสิร์ต','ที่นั่ง','แพ็กเกจ','สถานะ'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#606078', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} style={{ borderTop: '1px solid #2a2a3a', background: i % 2 === 0 ? 'transparent' : '#1e1e2a' }}>
                <td style={{ padding: '14px 20px', color: '#a855f7', fontWeight: 600 }}>{o.id}</td>
                <td style={{ padding: '14px 20px', color: '#e8e8f0' }}>{o.customer}</td>
                <td style={{ padding: '14px 20px', color: '#a0a0b8' }}>{o.concert}</td>
                <td style={{ padding: '14px 20px', color: '#a0a0b8' }}>{o.seat}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#2d1b69', color: '#a855f7' }}>{o.tier}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: o.statusColor + '22', color: o.statusColor }}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
