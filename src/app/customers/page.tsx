import { unstable_noStore as noStore } from 'next/cache'
import { sql } from '@/lib/db'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  noStore()
  const customers = await sql`
    SELECT c.*, COUNT(o.id) as order_count
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT 100
  `
  return <CustomersClient customers={customers as any[]} />
}
