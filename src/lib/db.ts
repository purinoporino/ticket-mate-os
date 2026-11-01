import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export type OrderStatus =
  | 'pending'
  | 'ready_for_booking'
  | 'bot_working'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'booking_successful'
  | 'booking_failed'

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  event_id: string | null
  seat_zone: string | null
  quantity: number
  price_per_ticket: number | null
  total_price: number | null
  status: OrderStatus
  bot_screenshot_url: string | null
  bot_session_id: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export async function getOrders(limit = 50) {
  return sql`
    SELECT o.*, c.name as customer_name, e.name as event_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN events e ON o.event_id = e.id
    ORDER BY o.created_at DESC
    LIMIT ${limit}
  `
}

export async function getOrder(id: string) {
  const rows = await sql`
    SELECT o.*, c.name as customer_name, c.phone as customer_phone,
           e.name as event_name, e.venue, e.ticket_url
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN events e ON o.event_id = e.id
    WHERE o.id = ${id}
  `
  return rows[0] || null
}

export async function updateOrderStatus(id: string, status: OrderStatus, extra?: Record<string, unknown>) {
  if (extra?.bot_screenshot_url !== undefined) {
    return sql`UPDATE orders SET status = ${status}, bot_screenshot_url = ${extra.bot_screenshot_url as string}, updated_at = NOW() WHERE id = ${id} RETURNING *`
  }
  return sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id} RETURNING *`
}

export async function createOrder(data: {
  customer_id?: string
  event_id?: string
  seat_zone?: string
  quantity?: number
  price_per_ticket?: number
  special_instructions?: string
}) {
  const orderNum = 'TM' + String(Date.now()).slice(-6)
  const total = (data.quantity || 1) * (data.price_per_ticket || 0)
  const rows = await sql`
    INSERT INTO orders (order_number, customer_id, event_id, seat_zone, quantity, price_per_ticket, total_price, special_instructions)
    VALUES (${orderNum}, ${data.customer_id || null}, ${data.event_id || null}, ${data.seat_zone || null},
            ${data.quantity || 1}, ${data.price_per_ticket || null}, ${total || null}, ${data.special_instructions || null})
    RETURNING *
  `
  return rows[0]
}

export async function logActivity(order_id: string, action: string, details?: Record<string, unknown>) {
  return sql`
    INSERT INTO activity_logs (order_id, action, details)
    VALUES (${order_id}, ${action}, ${JSON.stringify(details || {})})
  `
}

export async function getDashboardStats() {
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status IN ('bot_working','awaiting_confirmation','ready_for_booking')) as in_progress,
      COUNT(*) FILTER (WHERE status = 'booking_successful' AND DATE(created_at) = CURRENT_DATE) as success_today,
      SUM(total_price) FILTER (WHERE status = 'booking_successful' AND DATE(created_at) = CURRENT_DATE) as revenue_today
    FROM orders
  `
  return rows[0]
}
