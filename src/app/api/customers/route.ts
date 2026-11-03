import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`SELECT * FROM customers ORDER BY created_at DESC`
  return NextResponse.json({ customers: rows })
}

export async function POST(req: NextRequest) {
  const { name, phone, line_id, notes } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const rows = await sql`
    INSERT INTO customers (name, phone, line_id, notes)
    VALUES (${name}, ${phone || null}, ${line_id || null}, ${notes || null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
