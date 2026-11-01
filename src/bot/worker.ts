/**
 * Ticket Mate OS — Booking Bot Worker
 * Flow: pending → ready_for_booking → bot_working → awaiting_confirmation
 *       → (admin confirms) → confirmed → booking_successful
 * PDPA: Never stores passwords, OTP, ID numbers, or credit card data.
 * Human-in-loop: Bot stops before final payment. Admin must click Confirm.
 */
import { chromium, Browser, BrowserContext } from 'playwright'
import pg from 'pg'
import * as fs from 'fs'
import * as path from 'path'

const { Pool } = pg
const DB_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '5000')
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || './screenshots'
const BOT_ID = `bot-${process.env.RENDER_INSTANCE_ID || Date.now()}`
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
const sessions = new Map<string, { browser: Browser; ctx: BrowserContext }>()

async function query(sql: string, params: unknown[] = []) {
  const client = await pool.connect()
  try { return (await client.query(sql, params)).rows }
  finally { client.release() }
}

async function setStatus(orderId: string, status: string, extra: Record<string, unknown> = {}) {
  const fields = Object.keys(extra)
  let q = `UPDATE orders SET status = $1, updated_at = NOW()`
  const params: unknown[] = [status]
  fields.forEach((f, i) => { q += `, ${f} = $${i + 2}`; params.push(extra[f]) })
  q += ` WHERE id = $${params.length + 1}`
  params.push(orderId)
  await query(q, params)
}

async function log(orderId: string, action: string, details: Record<string, unknown> = {}) {
  await query(`INSERT INTO activity_logs (order_id, action, details) VALUES ($1, $2, $3)`,
    [orderId, action, JSON.stringify(details)])
}

function saveScreenshot(orderId: string, buffer: Buffer): string {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  const filename = `${orderId}-${Date.now()}.png`
  fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), buffer)
  return `/screenshots/${filename}`
}

async function processOrder(order: Record<string, unknown>) {
  const orderId = order.id as string
  const ticketUrl = order.ticket_url as string | null
  console.log(`[Bot] Processing order ${order.order_number}`)
  if (!ticketUrl) {
    await setStatus(orderId, 'booking_failed')
    await log(orderId, 'error', { message: 'No ticket URL for this event' })
    return
  }
  await setStatus(orderId, 'bot_working', { bot_session_id: BOT_ID })
  await log(orderId, 'bot_started', { bot_id: BOT_ID, url: ticketUrl })
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    })
    sessions.set(orderId, { browser, ctx })
    const page = await ctx.newPage()
    await page.goto(ticketUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    const screenshot1 = await page.screenshot({ fullPage: false })
    const screenshotUrl = saveScreenshot(orderId, screenshot1)
    await setStatus(orderId, 'awaiting_confirmation', { bot_screenshot_url: screenshotUrl })
    await log(orderId, 'screenshot_taken', { url: screenshotUrl })
    console.log(`[Bot] Order ${order.order_number}: Awaiting admin confirmation...`)
    // Poll for admin confirmation (max 10 min)
    const start = Date.now()
    let confirmed = false
    while (Date.now() - start < 600000) {
      await new Promise(r => setTimeout(r, 3000))
      const rows = await query(`SELECT status FROM orders WHERE id = $1`, [orderId])
      const st = rows[0]?.status
      if (st === 'confirmed') { confirmed = true; break }
      if (st === 'booking_failed' || st === 'pending') {
        await log(orderId, 'cancelled_by_admin', {})
        await browser.close(); sessions.delete(orderId); return
      }
    }
    if (!confirmed) {
      await setStatus(orderId, 'booking_failed')
      await log(orderId, 'timeout', { message: 'Admin did not confirm within 10 minutes' })
      await browser.close(); sessions.delete(orderId); return
    }
    await log(orderId, 'admin_confirmed', {})
    // ── Add site-specific booking click logic here ──
    // e.g.: await page.click('#confirm-purchase-button')
    // NEVER enter credit cards or personal IDs (PDPA compliance)
    const screenshot2 = await page.screenshot({ fullPage: false })
    const finalUrl = saveScreenshot(orderId, screenshot2)
    await setStatus(orderId, 'booking_successful', { bot_screenshot_url: finalUrl })
    await log(orderId, 'booking_completed', { final_screenshot: finalUrl })
    console.log(`[Bot] Order ${order.order_number}: SUCCESS`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[Bot] Error:`, message)
    await setStatus(orderId, 'booking_failed')
    await log(orderId, 'error', { message })
  } finally {
    if (browser) { await browser.close().catch(() => {}); sessions.delete(orderId) }
  }
}

async function pollLoop() {
  console.log(`[Bot] ${BOT_ID} started. Polling every ${POLL_INTERVAL}ms`)
  while (true) {
    try {
      const rows = await query(`
        SELECT o.*, e.ticket_url, e.name as event_name, c.name as customer_name
        FROM orders o
        LEFT JOIN events e ON o.event_id = e.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.status = 'ready_for_booking'
          AND (o.bot_session_id IS NULL OR o.bot_session_id = $1)
        ORDER BY o.created_at ASC LIMIT 1
      `, [BOT_ID])
      if (rows.length > 0 && !sessions.has(rows[0].id)) {
        processOrder(rows[0]).catch(console.error)
      }
    } catch (err) { console.error('[Bot] Poll error:', err) }
    await new Promise(r => setTimeout(r, POLL_INTERVAL))
  }
}

process.on('SIGTERM', async () => {
  console.log('[Bot] Shutting down...')
  for (const [, s] of sessions) await s.browser.close().catch(() => {})
  await pool.end(); process.exit(0)
})

pollLoop().catch(console.error)
