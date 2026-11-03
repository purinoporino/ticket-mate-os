import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { filename: string } }) {
  const rows = await query(`SELECT data FROM screenshots WHERE filename = $1`, [params.filename])
  if (!rows[0]) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const buf = Buffer.from(rows[0].data, 'base64')
  return new NextResponse(buf, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public,max-age=86400' } })
}
