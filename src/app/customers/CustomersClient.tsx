"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomersClient({ customers }: { customers: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', line_id: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.line_id || '').toLowerCase().includes(search.toLowerCase())
  )

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    setForm({ name: '', phone: '', line_id: '', notes: '' })
    setShowAdd(false)
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: '#0d0d20',
    border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0',
    fontSize: 14, boxSizing: 'border-box' as const
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e8e8f0' }}>ลูกค้า</h1>
          <p style={{ color: '#a0a0b8', marginTop: 4 }}>{customers.length} คน</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: '10px 20px', background: '#7c3aed', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
        }}>+ เพิ่มลูกค้า</button>
      </div>

      {showAdd && (
        <form onSubmit={addCustomer} style={{ background: '#12122a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#e8e8f0', marginBottom: 16 }}>เพิ่มลูกค้าใหม่</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>ชื่อ *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ชื่อลูกค้า" required />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>โทรศัพท์</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08X-XXX-XXXX" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a0a0b8', fontSize: 12, marginBottom: 6 }}>LINE ID</label>
              <input style={inputStyle} value={form.line_id} onChange={e => setForm({...form, line_id: e.target.value})} placeholder="@lineid" />
            </div>
            <div>
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

      <div style={{ marginBottom: 16 }}>
        <input
          style={{ ...inputStyle, maxWidth: 400 }}
          placeholder="🔍 ค้นหาชื่อ / เบอร์ / LINE ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ background: '#12122a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a4a' }}>
              {['ชื่อ','โทรศัพท์','LINE ID','จำนวนออเดอร์','หมายเหตุ'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#a0a0b8', fontSize: 13, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#a0a0b8' }}>ยังไม่มีลูกค้า</td></tr>
            )}
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1a1a3a', background: i % 2 === 0 ? 'transparent' : '#0d0d20' }}>
                <td style={{ padding: '14px 16px', color: '#e8e8f0', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '14px 16px', color: '#a0a0b8' }}>{c.phone || '—'}</td>
                <td style={{ padding: '14px 16px', color: '#a78bfa' }}>{c.line_id || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#1e1b4b', color: '#818cf8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {c.order_count} ออเดอร์
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#a0a0b8', fontSize: 13 }}>{c.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
