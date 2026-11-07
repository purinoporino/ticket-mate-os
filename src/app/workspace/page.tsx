export const dynamic = 'force-dynamic'
import { unstable_noStore as noStore } from 'next/cache'
import { sql } from '@/lib/db'
import WorkspaceClient from './WorkspaceClient'

export default async function WorkspacePage() {
  noStore()
  const active = await sql`
    SELECT o.*, e.name as event_name, c.name as customer_name, e.ticket_url
    FROM orders o
    LEFT JOIN events e ON o.event_id = e.id
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.status IN ('pending','bot_working','awaiting_confirmation','ready_for_booking')
    ORDER BY o.updated_at DESC
    LIMIT 20
  `
  const logs = await sql`
    SELECT l.*, o.order_number
    FROM activity_logs l
    LEFT JOIN orders o ON l.order_id = o.id
    ORDER BY l.created_at DESC
    LIMIT 50
  `
  return <WorkspaceClient active={active as any[]} logs={logs as any[]} />
}
