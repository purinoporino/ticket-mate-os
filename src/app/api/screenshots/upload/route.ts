import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { filename, data } = await req.json()
  if (!filename || !data) return NextResponse.json({ error: 'missing' }, { status: 400 })

  await sql`INSERT INTO screenshots (filename, data) VALUES (${filename}, ${data}) ON CONFLICT (filename) DO UPDATE SET data = ${data}`

  const url = `/api/screenshots/${filename}`
  return NextResponse.json({ url })
}
