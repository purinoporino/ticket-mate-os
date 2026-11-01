export const dynamic = 'force-dynamic'
import { unstable_noStore as noStore } from 'next/cache'
import { sql } from '@/lib/db'
import EventsClient from './EventsClient'

export default async function EventsPage() {
  noStore()
  const events = await sql`
    SELECT e.*, COUNT(o.id) as order_count
    FROM events e
    LEFT JOIN orders o ON o.event_id = e.id
    GROUP BY e.id
    ORDER BY e.created_at DESC
    LIMIT 100
  `
  return <EventsClient events={events as any[]} />
}
