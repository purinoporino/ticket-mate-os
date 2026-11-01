'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const nav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/orders', icon: '🎫', label: 'ออเดอร์' },
  { href: '/events', icon: '🎵', label: 'คอนเสิร์ต' },
  { href: '/customers', icon: '👥', label: 'ลูกค้า' },
  { href: '/workspace', icon: '🤖', label: 'Booking Bot' },
  { href: '/revenue', icon: '💰', label: 'รายได้' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', padding: '24px 0', flexShrink: 0
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent2)' }}>🎫 Ticket Mate</div>
        <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 4 }}>OS v1.0</div>
      </div>
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {nav.map(n => (
          <Link key={n.href} href={n.href} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 8, marginBottom: 4, fontSize: 14,
            background: path === n.href ? 'var(--accent-bg)' : 'transparent',
            color: path === n.href ? 'var(--accent2)' : 'var(--fg2)',
            fontWeight: path === n.href ? 600 : 400,
            transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--fg3)' }}>
        Admin Panel
      </div>
    </aside>
  )
}
