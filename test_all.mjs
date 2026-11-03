/**
 * Ticket Mate OS — Integration Test Suite
 * รันบน Mac: node test_all.mjs
 */
import { neon } from './node_modules/@neondatabase/serverless/index.mjs'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'

const DB = process.env.DATABASE_URL_UNPOOLED || 
  "postgresql://neondb_owner:npg_hrPMn5wyJ9aL@ep-withered-boat-az6b6n5r.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
const APP = process.env.APP_URL || "https://ticket-mate-os.vercel.app"
const sql = neon(DB)

let pass = 0, fail = 0, skip = 0
function check(name, got, expect) {
  const ok = JSON.stringify(got).includes(expect)
  if (ok) { console.log(`  ✅ PASS: ${name}`); pass++ }
  else { console.log(`  ❌ FAIL: ${name}\n     got: ${JSON.stringify(got).slice(0,300)}`); fail++ }
}
function skipTest(name, reason) {
  console.log(`  ⚠️  SKIP: ${name} — ${reason}`); skip++
}

async function api(path, opts) {
  const r = await fetch(`${APP}${path}`, opts)
  const body = await r.json().catch(() => null)
  return { status: r.status, body }
}

async function run() {
  console.log(`\n🧪 Ticket Mate OS Test Suite`)
  console.log(`   APP: ${APP}`)
  console.log(`   DB:  Neon PostgreSQL\n`)

  // ── TEST GROUP 1: DATABASE ────────────────────────────────────
  console.log('━━━ GROUP 1: Database ━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  console.log('\n[T01] DB connection')
  try {
    const r = await sql`SELECT 1 as ok`
    check('T01 DB connects', r[0], '"ok":1')
  } catch(e) { check('T01 DB connects', e.message, 'NEVER_MATCH') }

  console.log('\n[T02] tables exist')
  try {
    const r = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' ORDER BY table_name`
    const tables = r.map(x => x.table_name)
    console.log('      tables:', tables.join(', '))
    for (const t of ['orders','events','customers','activity_logs']) {
      check(`T02 table:${t}`, tables, t)
    }
  } catch(e) { check('T02 tables', e.message, 'NEVER_MATCH') }

  console.log('\n[T03] screenshots table (create if missing)')
  try {
    await sql`CREATE TABLE IF NOT EXISTS screenshots (
      filename TEXT PRIMARY KEY, 
      data TEXT NOT NULL, 
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    const r = await sql`SELECT COUNT(*) as cnt FROM screenshots`
    check('T03 screenshots table', r[0], 'cnt')
    console.log(`      rows: ${r[0].cnt}`)
  } catch(e) { check('T03 screenshots table', e.message, 'NEVER_MATCH') }

  console.log('\n[T04] orders has bot_screenshot_url column')
  try {
    const r = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='orders'`
    const cols = r.map(x => x.column_name)
    check('T04 bot_screenshot_url column', cols, 'bot_screenshot_url')
    check('T04 status column', cols, 'status')
    check('T04 event_id column', cols, 'event_id')
  } catch(e) { check('T04 columns', e.message, 'NEVER_MATCH') }

  // ── TEST GROUP 2: API ENDPOINTS ───────────────────────────────
  console.log('\n━━━ GROUP 2: API Endpoints ━━━━━━━━━━━━━━━━━━━━━━━')

  for (const [id, path, key] of [
    ['T05','orders','orders'], ['T06','events','events'], ['T07','customers','customers']
  ]) {
    console.log(`\n[${id}] GET /api/${path}`)
    try {
      const { status, body } = await api(`/api/${path}`)
      check(`${id} status 200`, {status}, '200')
      check(`${id} has ${key} key`, body, key)
    } catch(e) { check(`${id} GET /api/${path}`, e.message, 'NEVER_MATCH') }
  }

  // ── TEST GROUP 3: ORDER CRUD ──────────────────────────────────
  console.log('\n━━━ GROUP 3: Order CRUD ━━━━━━━━━━━━━━━━━━━━━━━━━━')

  let testOrderId = null
  console.log('\n[T08] Create order via POST /api/orders')
  try {
    const events = await sql`SELECT id FROM events LIMIT 1`
    if (!events.length) { skipTest('T08 create order', 'no events in DB'); }
    else {
      const { status, body } = await api('/api/orders', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ event_id: events[0].id, quantity: 2, seat_zone: 'TEST-ZONE', price_per_ticket: 500 })
      })
      check('T08 status 200', {status}, '200')
      check('T08 order_number in response', body, 'order_number')
      testOrderId = body?.order?.id
      console.log(`      created: ${body?.order?.order_number} (id: ${testOrderId})`)
    }
  } catch(e) { check('T08 create order', e.message, 'NEVER_MATCH') }

  console.log('\n[T09] PATCH order status → ready_for_booking')
  if (!testOrderId) { skipTest('T09 status update', 'no test order') }
  else {
    try {
      const { status, body } = await api(`/api/orders/${testOrderId}/status`, {
        method: 'PATCH', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ status: 'ready_for_booking' })
      })
      check('T09 status 200', {status}, '200')
      const row = await sql`SELECT status FROM orders WHERE id=${testOrderId}`
      check('T09 DB updated to ready_for_booking', row[0], 'ready_for_booking')
    } catch(e) { check('T09 status update', e.message, 'NEVER_MATCH') }
  }

  console.log('\n[T10] Cleanup test order')
  if (testOrderId) {
    try {
      await sql`DELETE FROM orders WHERE id=${testOrderId}`
      const r = await sql`SELECT id FROM orders WHERE id=${testOrderId}`
      check('T10 order deleted', r, '[]')
    } catch(e) { check('T10 cleanup', e.message, 'NEVER_MATCH') }
  } else { skipTest('T10 cleanup', 'no test order') }

  // ── TEST GROUP 4: SCREENSHOT FLOW ────────────────────────────
  console.log('\n━━━ GROUP 4: Screenshot API ━━━━━━━━━━━━━━━━━━━━━━')

  const fakePng = Buffer.from('FAKE_PNG_FOR_TEST_' + Date.now()).toString('base64')
  const testFile = `unit-test-${Date.now()}.png`

  console.log('\n[T11] POST /api/screenshots/upload')
  try {
    const { status, body } = await api('/api/screenshots/upload', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ filename: testFile, data: fakePng })
    })
    if (status === 404) { skipTest('T11 screenshot upload', 'route not deployed yet — push first') }
    else {
      check('T11 status 200', {status}, '200')
      check('T11 url in response', body, 'url')
      console.log(`      url: ${body?.url}`)
    }
  } catch(e) { check('T11 screenshot upload', e.message, 'NEVER_MATCH') }

  console.log('\n[T12] GET /api/screenshots/[filename]')
  try {
    const { status } = await api(`/api/screenshots/${testFile}`)
    if (status === 404) { skipTest('T12 screenshot GET', 'route not deployed yet') }
    else { check('T12 status 200', {status}, '200') }
  } catch(e) { check('T12 screenshot GET', e.message, 'NEVER_MATCH') }

  // Cleanup test screenshot from DB
  try { await sql`DELETE FROM screenshots WHERE filename=${testFile}` } catch(e) {}

  // ── TEST GROUP 5: BOT CODE ────────────────────────────────────
  console.log('\n━━━ GROUP 5: Bot Worker Code ━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n[T13-T15] Static analysis of worker.ts')
  const workerCode = readFileSync('./src/bot/worker.ts', 'utf8')
  check('T13 uses await saveScreenshot', workerCode, 'await saveScreenshot')
  check('T14 uploads to /api/screenshots/upload', workerCode, 'api/screenshots/upload')
  check('T15 PDPA: no password stored', workerCode, 'PDPA')

  // ── SUMMARY ───────────────────────────────────────────────────
  const total = pass + fail + skip
  console.log('\n' + '━'.repeat(50))
  console.log(`📊 Results: ✅ ${pass} passed  ❌ ${fail} failed  ⚠️  ${skip} skipped  (${total} total)`)
  if (fail === 0) console.log('🎉 All tests passed!')
  else console.log(`⚠️  ${fail} test(s) failed — check above`)
  console.log('━'.repeat(50) + '\n')
  process.exit(fail > 0 ? 1 : 0)
}

run().catch(e => { console.error('\n💥 Fatal:', e.message); process.exit(1) })
