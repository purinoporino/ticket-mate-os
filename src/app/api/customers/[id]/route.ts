import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, phone, line_id, notes } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const rows = await sql`
    UPDATE customers SET name=${name}, phone=${phone||null}, line_id=${line_id||null},
    notes=${notes||null}, updated_at=NOW() WHERE id=${id} RETURNING *`
  return NextResponse.json(rows[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM customers WHERE id=${id}`
  return NextResponse.json({ ok: true })
}
