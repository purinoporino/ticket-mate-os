# 🚀 Deployment Guide

## ภาพรวม Infrastructure

```
[Local Mac] ──git push──> [GitHub] ──auto deploy──> [Vercel]  (Web Dashboard)
                                                          │
                                                    [Neon DB] (PostgreSQL)
                                                          │
                              [DigitalOcean Droplet] ─────┘  (Bot Worker 24/7)
```

---

## Vercel (Web Dashboard)

### ครั้งแรก
1. ไป [vercel.com](https://vercel.com) → Import GitHub repo
2. เพิ่ม Environment Variable:
   - `DATABASE_URL` = Neon pooled connection string
3. Deploy

### Deploy ทุกครั้ง
```bash
git add .
git commit -m "message"
git push origin main
# Vercel deploy อัตโนมัติ ~30 วินาที
```

### ตรวจสอบ Build
- ไป Vercel Dashboard → Deployments → คลิก deploy ล่าสุด → View Logs
- ถ้า error ดูที่ "Build Logs" tab

### ปัญหาที่เจอบ่อย

| Error | วิธีแก้ |
|-------|---------|
| `Route segment config "dynamic" not compatible` | เอา `cacheComponents` ออกจาก `next.config.ts` |
| `params should be awaited` | เปลี่ยน `{ params }` เป็น `{ params }: { params: Promise<{id:string}> }` แล้ว `await params` |
| หน้า 404 ทุกหน้า | เพิ่ม `export const dynamic = 'force-dynamic'` บนหัวทุก page.tsx ที่ query DB |
| `not a member of this team` | `git config user.email "ttvn-alt@users.noreply.github.com"` |

---

## DigitalOcean Droplet (Bot)

**IP:** `206.189.152.41`  
**User:** `root`  
**Path:** `/root/app`

### SSH เข้า Droplet
```bash
ssh root@206.189.152.41
```

### ดูสถานะ Bot
```bash
systemctl status ticket-bot
journalctl -u ticket-bot -f        # log realtime
journalctl -u ticket-bot --since "1 hour ago"  # log ย้อนหลัง 1 ชม.
```

### Restart Bot
```bash
systemctl restart ticket-bot
```

### Update Code บน Droplet
```bash
cd /root/app
git pull origin main
cd src/bot && npm install          # ถ้ามี package ใหม่
systemctl restart ticket-bot
```

### ติดตั้ง Bot ครั้งแรก (reference)
```bash
# clone repo
git clone <repo_url> /root/app
cd /root/app/src/bot

# ติดตั้ง Node.js (ถ้ายังไม่มี)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ติดตั้ง tsx
npm install -g tsx

# ติดตั้ง dependencies
npm install

# สร้าง .env
cat > .env << 'EOF'
DATABASE_URL_UNPOOLED=postgresql://...@...neon.tech/...?sslmode=require
EOF

# สร้าง systemd service
cat > /etc/systemd/system/ticket-bot.service << 'EOF'
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
EOF

systemctl daemon-reload
systemctl enable ticket-bot
systemctl start ticket-bot
```

---

## Neon Database

**Region:** ap-southeast-1 (Singapore)  
**Dashboard:** [console.neon.tech](https://console.neon.tech)

### Connection Strings
- **Pooled** (สำหรับ Vercel/Serverless): ใช้ใน `DATABASE_URL`
- **Unpooled/Direct** (สำหรับ Bot บน Droplet): ใช้ใน `DATABASE_URL_UNPOOLED`

### Run SQL
ไปที่ Neon Console → SQL Editor แล้วรัน:

```sql
-- ดูออเดอร์ล่าสุด
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- ดู activity log
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20;

-- reset ออเดอร์ที่ค้างอยู่
UPDATE orders SET status = 'pending', bot_session_id = NULL 
WHERE status IN ('bot_working', 'awaiting_confirmation');
```

### Schema ครั้งแรก
```sql
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  venue TEXT,
  event_date TIMESTAMPTZ,
  sale_start TIMESTAMPTZ,
  ticket_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  event_id UUID REFERENCES events(id),
  seat_zone TEXT,
  quantity INT DEFAULT 1,
  price_per_ticket NUMERIC(10,2),
  total_price NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  bot_screenshot_url TEXT,
  bot_session_id TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

*อัปเดตล่าสุด: พฤศจิกายน 2026*
