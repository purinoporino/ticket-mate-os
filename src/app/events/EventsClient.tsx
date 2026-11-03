"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EMPTY_FORM = { name: '', venue: '', event_date: '', ticket_url: '', sale_start: '', notes: '' }

export default function EventsClient({ events }: { events: any[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: '#0d0d20',
    border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0',
    fontSize: 14, boxSizing: 'border-box' as const
  }

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setShowAdd(true) }
  function openEdit(ev: any) {
    setForm({
      name: ev.name || '', venue: ev.venue || '',
      event_date: ev.event_date ? ev.event_date.slice(0,16) : '',
      ticket_url: ev.ticket_url || '',
      sale_start: ev.sale_start ? ev.sale_start.slice(0,16) : '',
      notes: ev.notes || ''
    })
    setEditId(ev.id); setShowAdd(true)
  }
  function closeForm() { setShowAdd(false); setEditId(null); setForm(EMPTY_FORM) }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/events/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    } else {
      await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    }
    setSaving(false); closeForm(); router.refresh()
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    setDeleteId(null); router.refresh()
  }

  function fmt(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#1a1a2e', borderRadius:12, padding:28, maxWidth:360, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🗑️</div>
            <h3 style={{ color:'#e8e8f0', marginBottom:8 }}>ลบคอนเสิร์ตนี้?</h3>
            <p style={{ color:'#a0a0b8', fontSize:14, marginBottom:20 }}>ออเดอร์ที่อยู่ใน event นี้จะไม่ถูกลบ แต่จะไม่เชื่อมกับ event แล้ว</p>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={() => deleteEvent(deleteId)} style={{ padding:'9px 24px', background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>ลบ</button>
              <button onClick={() => setDeleteId(null)} style={{ padding:'9px 24px', background:'#1a1a3a', color:'#a0a0b8', border:'1px solid #2a2a4a', borderRadius:8, cursor:'pointer' }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#e8e8f0' }}>คอนเสิร์ต</h1>
          <p style={{ color:'#a0a0b8', marginTop:4 }}>{events.length} งาน</p>
        </div>
        <button onClick={openAdd} style={{ padding:'10px 20px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
          + เพิ่มคอนเสิร์ต
        </button>
      </div>

      {showAdd && (
        <form onSubmit={saveEvent} style={{ background:'#12122a', borderRadius:12, padding:24, marginBottom:24 }}>
          <h3 style={{ color:'#e8e8f0', marginBottom:16 }}>{editId ? '✏️ แก้ไขคอนเสิร์ต' : 'เพิ่มคอนเสิร์ตใหม่'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>ชื่อคอนเสิร์ต *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="ชื่อศิลปิน / งาน" required />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>สถานที่</label>
              <input style={inputStyle} value={form.venue} onChange={e => setForm({...form, venue:e.target.value})} placeholder="ชื่อสถานที่" />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>วันจัดงาน</label>
              <input style={inputStyle} type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date:e.target.value})} />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>วันเปิดขายบัตร</label>
              <input style={inputStyle} type="datetime-local" value={form.sale_start} onChange={e => setForm({...form, sale_start:e.target.value})} />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>URL หน้าซื้อบัตร</label>
              <input style={inputStyle} value={form.ticket_url} onChange={e => setForm({...form, ticket_url:e.target.value})} placeholder="https://..." />
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>หมายเหตุ</label>
              <input style={inputStyle} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="หมายเหตุเพิ่มเติม" />
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" disabled={saving} style={{ padding:'9px 20px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
              {saving ? 'กำลังบันทึก...' : editId ? '💾 บันทึกการแก้ไข' : '✅ เพิ่มคอนเสิร์ต'}
            </button>
            <button type="button" onClick={closeForm} style={{ padding:'9px 20px', background:'#1a1a3a', color:'#a0a0b8', border:'1px solid #2a2a4a', borderRadius:8, cursor:'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      )}

      <div style={{ display:'grid', gap:16 }}>
        {events.length === 0 && (
          <div style={{ background:'#12122a', borderRadius:12, padding:40, textAlign:'center', color:'#a0a0b8' }}>ยังไม่มีคอนเสิร์ต</div>
        )}
        {events.map(ev => (
          <div key={ev.id} style={{ background:'#12122a', borderRadius:12, padding:20, display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:17, fontWeight:700, color:'#e8e8f0', marginBottom:6 }}>{ev.name}</div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                {ev.venue && <span style={{ color:'#a0a0b8', fontSize:13 }}>📍 {ev.venue}</span>}
                {ev.event_date && <span style={{ color:'#a0a0b8', fontSize:13 }}>📅 {fmt(ev.event_date)}</span>}
                {ev.sale_start && <span style={{ color:'#f59e0b', fontSize:13 }}>🎟️ เปิดขาย {fmt(ev.sale_start)}</span>}
              </div>
              {ev.ticket_url && (
                <a href={ev.ticket_url} target="_blank" rel="noreferrer" style={{ color:'#a78bfa', fontSize:12, marginTop:6, display:'inline-block' }}>
                  🔗 {ev.ticket_url.slice(0,60)}{ev.ticket_url.length>60?'...':''}
                </a>
              )}
              {ev.notes && <div style={{ color:'#6b7280', fontSize:12, marginTop:4 }}>📝 {ev.notes}</div>}
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
              <span style={{ background:'#1e1b4b', color:'#818cf8', padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:600 }}>
                {ev.order_count} ออเดอร์
              </span>
              <button onClick={() => openEdit(ev)} style={{ padding:'6px 14px', background:'#1a3a2a', color:'#10b981', border:'1px solid #10b981', borderRadius:8, cursor:'pointer', fontSize:13 }}>
                ✏️ แก้ไข
              </button>
              <button onClick={() => setDeleteId(ev.id)} style={{ padding:'6px 14px', background:'#3a1a1a', color:'#ef4444', border:'1px solid #ef4444', borderRadius:8, cursor:'pointer', fontSize:13 }}>
                🗑️ ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
