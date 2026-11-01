export const dynamic = 'force-dynamic'
import { unstable_noStore as noStore } from 'next/cache'
import { getOrders } from '@/lib/db'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  noStore()
  const orders = await getOrders(100)
  return <OrdersClient orders={orders as any[]} />
}
