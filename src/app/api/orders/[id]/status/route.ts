import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, OrderStatus } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()
    const result = await updateOrderStatus(params.id, status as OrderStatus)
    return NextResponse.json({ ok: true, order: result })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
