"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_LABEL: Record<string, string> = {
  pending: 'ใหม่', ready_for_booking: 'รอกด', bot_working: 'กำลังกด',
  awaiting_confirmation: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว',
  booking_successful: 'สำเร็จ', booking_failed: 'ล้มเหลว',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#7c3aed', ready_for_booking: '#3b82f6', bot_working: '#f59e0b',
  awaiting_confirmation: '#ef4444', confirmed: '#06b6d4',
  booking_successful: '#10b981', booking_failed: '#6b7280',
}

export default function OrdersClient({ orders }: { orders: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<{ url: string; orderNum: string } | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [form, setForm] = useState({ event_id: '', customer_id: '', quantity: '1', seat_zone: '', price_per_ticket: '', special_instructions: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (showAdd) {
      fetch('/api/events').then(r => r.json()).then(d => setEvents(d.events || []))
      fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers || []))
    }
  }, [showAdd])

  async function addOrder(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: form.event_id || null,
        customer_id: form.customer_id || null,
        quantity: parseInt(form.quantity) || 1,
        seat_zone: form.seat_zone || null,
        price_per_ticket: parseFloat(form.price_per_ticket) || null,
        special_instructions: form.special_instructions || null,
      })
    })
    const data = await res.json()
    setSaving(false)
    setShowAdd(false)
    setForm({ event_id: '', customer_id: '', quantity: '1', seat_zone: '', price_per_ticket: '', special_instructions: '' })
    if (data.order) {
      setToast(`✅ สร้าง ${data.order.order_number} แล้ว — กด "🤖 ส่งให้ Bot" เพื่อเริ่มจอง`)
      setTimeout(() => setToast(null), 6000)
    }
    router.refresh()
  }

  async function updateStatus(id: string, status: string) {
    setLoading(id + status)
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div>
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, background:'#10b981', color:'#fff', padding:'12px 20px', borderRadius:10, fontWeight:700, fontSize:14, boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}
      {screenshot && (
        <div onClick={() => setScreenshot(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1a1a2e', borderRadius: 12, padding: 24, maxWidth: 800, width: '90%'
          }}>
            <p style={{ color: '#a0a0b8', marginBottom: 12 }}>Screenshot — {screenshot.orderNum}</p>
            <img src={screenshot.url} style={{ width: '100%', borderRadius: 8 }} alt="screenshot" />
            <button onClick={() => setScreenshot(null)} style={{
              marginTop: 16, padding: '8px 24px', background: '#374151',
              color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer'
            }}>ปิด</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0' }}>ออเดอร์ทั้งหมด</h1>
          <p style={{ color: '#a0a0b8', marginTop: 4 }}>{orders.length} รายการ</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: '10px 20px', background: '#7c3aed', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
        }}>+ เพิ่มออเดอร์</button>
      </div>

      {showAdd && (
        <form onSubmit={addOrder} style={{ background: '#12122a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#e8e8f0', marginBottom: 16 }}>สร้างออเดอร์ใหม่</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>คอนเสิร์ต *</label>
              <select required value={form.event_id} onChange={e => setForm({...form, event_id: e.target.value})}
                style={{ width: '100%', padding: '9px 12px', background: '#0d0d20', border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0', fontSize: 14 }}>
                <option value="">-- เลือกคอนเสิร์ต --</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>ลูกค้า</label>
              <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}
                style={{ width: '100%', padding: '9px 12px', background: '#0d0d20', border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0', fontSize: 14 }}>
                <option value="">-- ไม่ระบุ --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>จำนวนบัตร</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                style={{ width: '100%', padding: '9px 12px', background: '#0d0d20', border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>โซน / ที่นั่ง</label>
              <input value={form.seat_zone} onChange={e => setForm({...form, seat_zone: e.target.value})} placeholder="เช่น A, B, VIP"
                style={{ width: '100%', padding: '9px 12px', background: '#0d0d20', border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>ราคา/ใบ (บาท)</label>
              <input type="number" value={form.price_per_ticket} onChange={e => setForm({...form, price_per_ticket: e.target.value})} placeholder="0"
                style={{ width: '100%', padding: '9px 12px', background: '#0d0d20', border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>หมายเหตุพิเศษ</label>
              <input value={form.special_instructions} onChange={e => setForm({...form, special_instructions: e.target.value})} placeholder="คำสั่งพิเศษสำหรับ bot"
                style={{ width: '100%', padding: '9px 12px', background: '#0d0d20', border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'กำลังบันทึก...' : '✅ สร้างออเดอร์'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: '#1a1a3a', color: '#a0a0b8', border: '1px solid #2a2a4a', borderRadius: 8, cursor: 'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      )}

      <div style={{ background: '#12122a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a4a' }}>
              {['รหัส','ลูกค้า','คอนเสิร์ต','จำนวน','สถานะ','จัดการ'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#a0a0b8', fontSize: 13, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#a0a0b8' }}>ยังไม่มีออเดอร์</td></tr>
            )}
            {orders.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #1a1a3a', background: i % 2 === 0 ? 'transparent' : '#0d0d20' }}>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>{o.order_number}</span>
                </td>
                <td style={{ padding: '14px 16px', color: '#e8e8f0' }}>{o.customer_name || '—'}</td>
                <td style={{ padding: '14px 16px', color: '#e8e8f0' }}>{o.event_name || '—'}</td>
                <td style={{ padding: '14px 16px', color: '#e8e8f0' }}>{o.quantity}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: STATUS_COLOR[o.status] + '22',
                    color: STATUS_COLOR[o.status],
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>{STATUS_LABEL[o.status] || o.status}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {o.status === 'pending' && (
                      <button
                        disabled={!!loading}
                        onClick={() => updateStatus(o.id, 'ready_for_booking')}
                        style={{ padding: '5px 12px', background: '#1e3a5f', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: 6, cursor: 'pointer', fontSize: 12, opacity: loading ? 0.6 : 1 }}>
                        {loading === o.id + 'ready_for_booking' ? '...' : '🤖 ส่งให้ Bot'}
                      </button>
                    )}
                    {o.bot_screenshot_url && (
                      <button onClick={() => setScreenshot({ url: o.bot_screenshot_url, orderNum: o.order_number })}
                        style={{ padding: '5px 12px', background: '#1e3a5f', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        📸 ดูรูป
                      </button>
                    )}
                    {o.status === 'awaiting_confirmation' && (
                      <button disabled={!!loading} onClick={() => updateStatus(o.id, 'confirmed')}
                        style={{ padding: '5px 12px', background: '#064e3b', color: '#10b981', border: '1px solid #10b981', borderRadius: 6, cursor: 'pointer', fontSize: 12, opacity: loading ? 0.6 : 1 }}>
                        {loading === o.id + 'confirmed' ? '...' : '✅ Confirm'}
                      </button>
                    )}
                    {['awaiting_confirmation', 'bot_working', 'ready_for_booking'].includes(o.status) && (
                      <button disabled={!!loading} onClick={() => updateStatus(o.id, 'booking_failed')}
                        style={{ padding: '5px 12px', background: '#450a0a', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', fontSize: 12, opacity: loading ? 0.6 : 1 }}>
                        {loading === o.id + 'booking_failed' ? '...' : '❌ ยกเลิก'}
                      </button>
                    )}
                    {o.status === 'booking_failed' && (
                      <button disabled={!!loading} onClick={() => updateStatus(o.id, 'ready_for_booking')}
                        style={{ padding: '5px 12px', background: '#1e1b4b', color: '#818cf8', border: '1px solid #6366f1', borderRadius: 6, cursor: 'pointer', fontSize: 12, opacity: loading ? 0.6 : 1 }}>
                        🔄 ลองใหม่
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
