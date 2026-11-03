import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT e.*, COUNT(o.id) as order_count
    FROM events e
    LEFT JOIN orders o ON o.event_id = e.id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `
  return NextResponse.json({ events: rows })
}

export async function POST(req: NextRequest) {
  const { name, venue, event_date, ticket_url, sale_start, notes } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const rows = await sql`
    INSERT INTO events (name, venue, event_date, ticket_url, sale_start, notes)
    VALUES (${name}, ${venue || null}, ${event_date || null}, ${ticket_url || null}, ${sale_start || null}, ${notes || null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
