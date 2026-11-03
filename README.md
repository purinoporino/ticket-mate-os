# 🎟️ Ticket Mate OS

ระบบ Admin Dashboard + Bot สำหรับช่วยจองบัตรคอนเสิร์ต

---

## สารบัญ

- [ภาพรวม](#ภาพรวม)
- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การติดตั้ง](#การติดตั้ง)
- [ตัวแปร Environment](#ตัวแปร-environment)
- [Database Schema](#database-schema)
- [หน้าต่างๆ](#หน้าต่างๆ)
- [API Routes](#api-routes)
- [Bot Worker](#bot-worker)
- [การ Deploy](#การ-deploy)
- [ข้อจำกัด (PDPA & ToS)](#ข้อจำกัด)

---

## ภาพรวม

Ticket Mate OS ช่วยทีมจัดการออเดอร์จองบัตร โดยมี:

1. **Admin Dashboard** (Next.js) — ดูออเดอร์ ลูกค้า คอนเสิร์ต รายได้
2. **Bot Worker** (Playwright) — เปิดเว็บซื้อบัตรอัตโนมัติ รอ Admin กด Confirm
3. **Neon PostgreSQL** — ฐานข้อมูลกลาง ทั้ง Dashboard และ Bot อ่าน/เขียนที่เดียวกัน

**Flow การทำงาน:**
```
pending → ready_for_booking → bot_working → awaiting_confirmation
       → (Admin กด Confirm) → confirmed → booking_successful
```

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Database | Neon PostgreSQL (ap-southeast-1) |
| Bot | Playwright + Chromium (headless) |
| Bot Runtime | Node.js + tsx |
| Bot Host | DigitalOcean Droplet (Ubuntu 24.04) |
| Web Deploy | Vercel |
| Process Manager | systemd |

---

## โครงสร้างโปรเจกต์

```
ticket-mate-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # หน้าหลัก — สถิติรวม
│   │   ├── orders/             # รายการออเดอร์ทั้งหมด
│   │   ├── events/             # คอนเสิร์ต/งาน
│   │   ├── customers/          # ลูกค้า
│   │   ├── workspace/          # Monitor bot realtime
│   │   ├── revenue/            # รายได้
│   │   └── api/
│   │       ├── events/         # POST สร้าง event
│   │       ├── customers/      # POST สร้าง customer
│   │       └── orders/[id]/
│   │           └── status/     # PATCH อัปเดตสถานะ
│   ├── components/
│   │   └── Sidebar.tsx         # เมนูด้านข้าง
│   ├── lib/
│   │   └── db.ts               # Neon DB helpers
│   └── bot/
│       ├── worker.ts           # Bot หลัก (Playwright)
│       ├── package.json        # dependencies แยกของ bot
│       └── .env                # env สำหรับ bot บน Droplet
├── next.config.ts
├── package.json
└── README.md
```

---

## การติดตั้ง

### Web Dashboard (Local Dev)

```bash
git clone <repo>
cd ticket-mate-os
npm install

# สร้างไฟล์ .env.local
cp .env.example .env.local
# แก้ DATABASE_URL ให้ถูกต้อง

npm run dev
# เปิด http://localhost:3000
```

### Bot Worker (บน Droplet)

```bash
# SSH เข้า Droplet
ssh root@206.189.152.41

# ติดตั้ง dependencies
cd /root/app/src/bot
npm install

# แก้ .env ให้มี DATABASE_URL_UNPOOLED
nano .env

# start service
systemctl start ticket-bot
systemctl status ticket-bot
```

---

## ตัวแปร Environment

### Web (Vercel / .env.local)

| ตัวแปร | คำอธิบาย | ตัวอย่าง |
|--------|----------|---------|
| `DATABASE_URL` | Neon pooled connection | `postgresql://...@...neon.tech/...?sslmode=require` |

### Bot (.env บน Droplet)

| ตัวแปร | คำอธิบาย | ค่า default |
|--------|----------|-------------|
| `DATABASE_URL_UNPOOLED` | Neon direct connection (ไม่ pool) | — |
| `DATABASE_URL` | fallback ถ้าไม่มี UNPOOLED | — |
| `POLL_INTERVAL_MS` | ความถี่ poll ออเดอร์ใหม่ (ms) | `5000` |
| `SCREENSHOT_DIR` | โฟลเดอร์เก็บ screenshot | `./screenshots` |

---

## Database Schema

### ตาราง `customers`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|---------|
| id | UUID | PK |
| name | TEXT | ชื่อลูกค้า |
| phone | TEXT | เบอร์โทร |
| email | TEXT | อีเมล (optional) |
| created_at | TIMESTAMPTZ | auto |

### ตาราง `events`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|---------|
| id | UUID | PK |
| name | TEXT | ชื่อคอนเสิร์ต |
| venue | TEXT | สถานที่ |
| event_date | TIMESTAMPTZ | วันจัดงาน |
| sale_start | TIMESTAMPTZ | วันเปิดขายบัตร |
| ticket_url | TEXT | URL หน้าซื้อบัตร |
| notes | TEXT | หมายเหตุ |
| created_at | TIMESTAMPTZ | auto |

### ตาราง `orders`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|---------|
| id | UUID | PK |
| order_number | TEXT | รหัส เช่น TM123456 |
| customer_id | UUID | FK → customers |
| event_id | UUID | FK → events |
| seat_zone | TEXT | โซนที่นั่ง |
| quantity | INT | จำนวนบัตร |
| price_per_ticket | NUMERIC | ราคาต่อใบ |
| total_price | NUMERIC | ราคารวม |
| status | TEXT | ดูด้านล่าง |
| bot_screenshot_url | TEXT | path รูป screenshot |
| bot_session_id | TEXT | ID ของ bot instance |
| special_instructions | TEXT | คำสั่งพิเศษ |
| created_at / updated_at | TIMESTAMPTZ | auto |

**สถานะออเดอร์ (status):**

| สถานะ | ความหมาย |
|-------|---------|
| `pending` | ออเดอร์ใหม่ รอจัดการ |
| `ready_for_booking` | พร้อมให้ Bot กด |
| `bot_working` | Bot กำลังทำงาน |
| `awaiting_confirmation` | Bot หยุด รอ Admin ยืนยัน |
| `confirmed` | Admin ยืนยันแล้ว Bot จะกดต่อ |
| `booking_successful` | จองสำเร็จ |
| `booking_failed` | ล้มเหลว |

### ตาราง `activity_logs`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|---------|
| id | UUID | PK |
| order_id | UUID | FK → orders |
| action | TEXT | ชื่อ action เช่น `bot_started` |
| details | JSONB | ข้อมูลเพิ่มเติม |
| created_at | TIMESTAMPTZ | auto |

---

## หน้าต่างๆ

| หน้า | URL | คำอธิบาย |
|------|-----|---------|
| Dashboard | `/dashboard` | สรุปสถิติ: pending, in-progress, สำเร็จวันนี้, รายได้วันนี้ |
| Orders | `/orders` | ตารางออเดอร์ทั้งหมด, เปลี่ยนสถานะ, ดู screenshot |
| Events | `/events` | การ์ดคอนเสิร์ต, เพิ่มงานใหม่ |
| Customers | `/customers` | รายชื่อลูกค้า, เพิ่มลูกค้า |
| Workspace | `/workspace` | Monitor bot realtime, activity log, auto-refresh 5s |
| Revenue | `/revenue` | รายได้วันนี้ / เดือนนี้ / ทั้งหมด, top events |

---

## API Routes

### `GET/POST /api/events`
- **GET** — ดึง events ทั้งหมด (พร้อม order_count)
- **POST** — สร้าง event ใหม่
  ```json
  { "name": "BNK48", "venue": "อิมแพค", "ticket_url": "https://...", "event_date": "2025-01-01T18:00" }
  ```

### `GET/POST /api/customers`
- **GET** — ดึงลูกค้าทั้งหมด
- **POST** — สร้างลูกค้าใหม่
  ```json
  { "name": "สมชาย", "phone": "0812345678", "email": "..." }
  ```

### `PATCH /api/orders/[id]/status`
- อัปเดตสถานะออเดอร์
  ```json
  { "status": "ready_for_booking" }
  ```

---

## Bot Worker

Bot อยู่ที่ `/root/app/src/bot/worker.ts` บน Droplet

### การทำงาน

1. **Poll** ทุก 5 วินาที หาออเดอร์ที่ status = `ready_for_booking`
2. **เปิด Chromium** headless, ไป `ticket_url` ของ event
3. **ถ่าย screenshot** แล้วเปลี่ยน status → `awaiting_confirmation`
4. **รอ Admin** กด Confirm ใน Dashboard (สูงสุด 10 นาที)
5. ถ้า Admin ยืนยัน → เปลี่ยน status → `booking_successful`
6. ถ้าหมดเวลา / Admin ยกเลิก → `booking_failed`

### systemd Service

ไฟล์: `/etc/systemd/system/ticket-bot.service`

```ini
[Unit]
Description=Ticket Mate Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/app
ExecStart=/usr/bin/tsx src/bot/worker.ts
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**คำสั่ง:**
```bash
systemctl status ticket-bot    # ดูสถานะ
systemctl restart ticket-bot   # restart
journalctl -u ticket-bot -f    # ดู log realtime
```

---

## การ Deploy

### Web → Vercel

```bash
# push code แล้ว Vercel deploy อัตโนมัติ
git add .
git commit -m "update"
git push origin main
```

**สิ่งที่ต้องมีใน Vercel:**
- `DATABASE_URL` — Neon pooled connection string
- ทุกหน้าที่ query DB ต้องมี `export const dynamic = 'force-dynamic'`

### Bot → Droplet

```bash
# บน local machine: push code
git push origin main

# บน Droplet: pull และ restart
ssh root@206.189.152.41
cd /root/app && git pull origin main
cd src/bot && npm install
systemctl restart ticket-bot
```

---

## ข้อจำกัด

### PDPA Compliance 🇹🇭
- **ห้าม** เก็บรหัสผ่าน, OTP, เลขบัตรประชาชน, เลขบัตรเครดิต ในฐานข้อมูลทุกกรณี
- ข้อมูลที่เก็บได้: ชื่อลูกค้า, เบอร์โทร, อีเมล, จำนวน/ราคาบัตร

### ToS Compliance
- Bot **ต้องหยุด** ก่อนกด Confirm การซื้อ
- **Admin ต้องกด Confirm** เองเสมอ (human-in-the-loop)
- Bot ไม่กรอกรหัสผ่านหรือข้อมูลบัตรเครดิตแทนผู้ใช้

---

*Ticket Mate OS — Built with Next.js + Playwright*
