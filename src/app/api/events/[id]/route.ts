import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, venue, event_date, ticket_url, sale_start, notes } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const rows = await sql`
    UPDATE events SET name=${name}, venue=${venue||null}, event_date=${event_date||null},
    ticket_url=${ticket_url||null}, sale_start=${sale_start||null}, notes=${notes||null},
    updated_at=NOW() WHERE id=${id} RETURNING *`
  return NextResponse.json(rows[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM events WHERE id=${id}`
  return NextResponse.json({ ok: true })
}
