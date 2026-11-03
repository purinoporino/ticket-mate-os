import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { filename, data } = await req.json()
  if (!filename || !data) return NextResponse.json({ error: 'missing' }, { status: 400 })

  // Store base64 in DB
  await query(
    `INSERT INTO screenshots (filename, data) VALUES ($1, $2) ON CONFLICT (filename) DO UPDATE SET data = $2`,
    [filename, data]
  )

  const url = `/api/screenshots/${filename}`
  return NextResponse.json({ url })
}
