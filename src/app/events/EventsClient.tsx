"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EventsClient({ events }: { events: any[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', venue: '', event_date: '', ticket_url: '', sale_start: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function addEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ name: '', venue: '', event_date: '', ticket_url: '', sale_start: '', notes: '' })
    setShowAdd(false)
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: '#0d0d20',
    border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0',
    fontSize: 14, boxSizing: 'border-box' as const
  }

  function fmt(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0' }}>คอนเสิร์ต</h1>
          <p style={{ color: '#a0a0b8', marginTop: 4 }}>{events.length} งาน</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: '10px 20px', background: '#7c3aed', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
        }}>+ เพิ่มคอนเสิร์ต</button>
      </div>

      {showAdd && (
        <form onSubmit={addEvent} style={{ background: '#12122a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#e8e8f0', marginBottom: 16 }}>เพิ่มคอนเสิร์ตใหม่</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>ชื่อคอนเสิร์ต *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ชื่อศิลปิน / งาน" required />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>สถานที่</label>
              <input style={inputStyle} value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="ชื่อสถานที่" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>วันจัดงาน</label>
              <input style={inputStyle} type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>วันเปิดขายบัตร</label>
              <input style={inputStyle} type="datetime-local" value={form.sale_start} onChange={e => setForm({...form, sale_start: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>URL หน้าซื้อบัตร</label>
              <input style={inputStyle} value={form.ticket_url} onChange={e => setForm({...form, ticket_url: e.target.value})} placeholder="https://..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>หมายเหตุ</label>
              <input style={inputStyle} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="หมายเหตุเพิ่มเติม" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: '#1a1a3a', color: '#a0a0b8', border: '1px solid #2a2a4a', borderRadius: 8, cursor: 'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {events.length === 0 && (
          <div style={{ background: '#12122a', borderRadius: 12, padding: 40, textAlign: 'center', color: '#a0a0b8' }}>ยังไม่มีคอนเสิร์ต</div>
        )}
        {events.map(ev => (
          <div key={ev.id} style={{ background: '#12122a', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#e8e8f0', marginBottom: 6 }}>{ev.name}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {ev.venue && <span style={{ color: '#a0a0b8', fontSize: 13 }}>📍 {ev.venue}</span>}
                {ev.event_date && <span style={{ color: '#a0a0b8', fontSize: 13 }}>📅 {fmt(ev.event_date)}</span>}
                {ev.sale_start && <span style={{ color: '#f59e0b', fontSize: 13 }}>🎟️ เปิดขาย {fmt(ev.sale_start)}</span>}
              </div>
              {ev.ticket_url && (
                <a href={ev.ticket_url} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', fontSize: 12, marginTop: 6, display: 'inline-block' }}>
                  🔗 {ev.ticket_url.slice(0, 60)}{ev.ticket_url.length > 60 ? '...' : ''}
                </a>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ background: '#1e1b4b', color: '#818cf8', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                {ev.order_count} ออเดอร์
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
