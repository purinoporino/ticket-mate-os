"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EMPTY_FORM = { name: '', phone: '', line_id: '', notes: '' }

export default function CustomersClient({ customers }: { customers: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.line_id || '').toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: '#0d0d20',
    border: '1px solid #2a2a4a', borderRadius: 8, color: '#e8e8f0',
    fontSize: 14, boxSizing: 'border-box' as const
  }

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setShowAdd(true) }
  function openEdit(c: any) {
    setForm({ name: c.name||'', phone: c.phone||'', line_id: c.line_id||'', notes: c.notes||'' })
    setEditId(c.id); setShowAdd(true)
  }
  function closeForm() { setShowAdd(false); setEditId(null); setForm(EMPTY_FORM) }

  async function saveCustomer(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/customers/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    } else {
      await fetch('/api/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
    }
    setSaving(false); closeForm(); router.refresh()
  }

  async function deleteCustomer(id: string) {
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    setDeleteId(null); router.refresh()
  }

  return (
    <div>
      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#1a1a2e', borderRadius:12, padding:28, maxWidth:360, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🗑️</div>
            <h3 style={{ color:'#e8e8f0', marginBottom:8 }}>ลบลูกค้านี้?</h3>
            <p style={{ color:'#a0a0b8', fontSize:14, marginBottom:20 }}>ออเดอร์ของลูกค้าจะไม่ถูกลบ แต่จะไม่เชื่อมกับลูกค้าแล้ว</p>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={() => deleteCustomer(deleteId)} style={{ padding:'9px 24px', background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>ลบ</button>
              <button onClick={() => setDeleteId(null)} style={{ padding:'9px 24px', background:'#1a1a3a', color:'#a0a0b8', border:'1px solid #2a2a4a', borderRadius:8, cursor:'pointer' }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#e8e8f0' }}>ลูกค้า</h1>
          <p style={{ color:'#a0a0b8', marginTop:4 }}>{customers.length} คน</p>
        </div>
        <button onClick={openAdd} style={{ padding:'10px 20px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
          + เพิ่มลูกค้า
        </button>
      </div>

      {showAdd && (
        <form onSubmit={saveCustomer} style={{ background:'#12122a', borderRadius:12, padding:24, marginBottom:24 }}>
          <h3 style={{ color:'#e8e8f0', marginBottom:16 }}>{editId ? '✏️ แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>ชื่อ *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="ชื่อลูกค้า" required />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>โทรศัพท์</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="08X-XXX-XXXX" />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>LINE ID</label>
              <input style={inputStyle} value={form.line_id} onChange={e => setForm({...form, line_id:e.target.value})} placeholder="@lineid" />
            </div>
            <div>
              <label style={{ display:'block', color:'#a0a0b8', fontSize:12, marginBottom:6 }}>หมายเหตุ</label>
              <input style={inputStyle} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="หมายเหตุเพิ่มเติม" />
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button type="submit" disabled={saving} style={{ padding:'9px 20px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
              {saving ? 'กำลังบันทึก...' : editId ? '💾 บันทึกการแก้ไข' : '✅ เพิ่มลูกค้า'}
            </button>
            <button type="button" onClick={closeForm} style={{ padding:'9px 20px', background:'#1a1a3a', color:'#a0a0b8', border:'1px solid #2a2a4a', borderRadius:8, cursor:'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      )}

      <div style={{ marginBottom:16 }}>
        <input style={{ ...inputStyle, maxWidth:400 }} placeholder="🔍 ค้นหาชื่อ / เบอร์ / LINE ID..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background:'#12122a', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #2a2a4a' }}>
              {['ชื่อ','โทรศัพท์','LINE ID','ออเดอร์','หมายเหตุ','จัดการ'].map(h => (
                <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'#a0a0b8', fontSize:13, fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#a0a0b8' }}>ยังไม่มีลูกค้า</td></tr>
            )}
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom:'1px solid #1a1a3a', background: i%2===0?'transparent':'#0d0d20' }}>
                <td style={{ padding:'14px 16px', color:'#e8e8f0', fontWeight:600 }}>{c.name}</td>
                <td style={{ padding:'14px 16px', color:'#a0a0b8' }}>{c.phone || '—'}</td>
                <td style={{ padding:'14px 16px', color:'#a78bfa' }}>{c.line_id || '—'}</td>
                <td style={{ padding:'14px 16px' }}>
                  <span style={{ background:'#1e1b4b', color:'#818cf8', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>
                    {c.order_count} ออเดอร์
                  </span>
                </td>
                <td style={{ padding:'14px 16px', color:'#a0a0b8', fontSize:13 }}>{c.notes || '—'}</td>
                <td style={{ padding:'14px 16px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => openEdit(c)} style={{ padding:'5px 12px', background:'#1a3a2a', color:'#10b981', border:'1px solid #10b981', borderRadius:6, cursor:'pointer', fontSize:12 }}>
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => setDeleteId(c.id)} style={{ padding:'5px 12px', background:'#3a1a1a', color:'#ef4444', border:'1px solid #ef4444', borderRadius:6, cursor:'pointer', fontSize:12 }}>
                      🗑️ ลบ
                    </button>
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
