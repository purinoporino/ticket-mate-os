import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

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
