import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT o.*, c.name as customer_name, e.name as event_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN events e ON o.event_id = e.id
    ORDER BY o.created_at DESC
    LIMIT 100
  `
  return NextResponse.json({ orders: rows })
}

export async function POST(req: NextRequest) {
  const { event_id, customer_id, quantity, seat_zone, price_per_ticket, special_instructions } = await req.json()
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 })
  const orderNum = 'TM' + String(Date.now()).slice(-6)
  const total = (quantity || 1) * (price_per_ticket || 0)
  const rows = await sql`
    INSERT INTO orders (order_number, customer_id, event_id, seat_zone, quantity, price_per_ticket, total_price, special_instructions)
    VALUES (${orderNum}, ${customer_id || null}, ${event_id}, ${seat_zone || null},
            ${quantity || 1}, ${price_per_ticket || null}, ${total || null}, ${special_instructions || null})
    RETURNING *
  `
  return NextResponse.json({ order: rows[0] })
}
