import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  const rows = await sql`SELECT data FROM screenshots WHERE filename = ${filename}`
  if (!rows[0]) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const buf = Buffer.from(rows[0].data as string, 'base64')
  return new NextResponse(buf, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public,max-age=86400' } })
}
