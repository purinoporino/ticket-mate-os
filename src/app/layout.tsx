import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const sarabun = Sarabun({ subsets: ['thai', 'latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = { title: 'Ticket Mate OS', description: 'Concert Ticket Booking System' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={sarabun.className} style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{children}</main>
      </body>
    </html>
  )
}
