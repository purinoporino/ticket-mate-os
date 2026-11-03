# 🤖 Bot Worker Guide

คู่มือการใช้งาน Bot จองบัตร

---

## วิธีใช้งาน (ทีละขั้น)

### 1. เพิ่มลูกค้า
ไปหน้า **Customers** → กด "เพิ่มลูกค้า" → กรอกชื่อ + เบอร์โทร

### 2. เพิ่มคอนเสิร์ต
ไปหน้า **Events** → กด "เพิ่มคอนเสิร์ต" → กรอก:
- ชื่อคอนเสิร์ต
- สถานที่
- URL หน้าซื้อบัตร ← **สำคัญมาก** Bot จะเปิดหน้านี้

### 3. สร้างออเดอร์
ไปหน้า **Orders** → เพิ่มออเดอร์ → เลือกลูกค้า + คอนเสิร์ต + จำนวน

### 4. ส่งให้ Bot
ออเดอร์ที่ต้องการให้ Bot กด → เปลี่ยน status เป็น **"รอกด"** (`ready_for_booking`)

### 5. รอ Bot ทำงาน
Bot จะ:
- เปิดหน้าเว็บซื้อบัตร
- ถ่าย screenshot
- เปลี่ยน status เป็น **"รอยืนยัน"** (`awaiting_confirmation`)

### 6. Admin ยืนยัน
ไปหน้า **Workspace** หรือ **Orders** → ดู screenshot ที่ Bot ถ่าย → กด **Confirm**

Bot จะทำงานต่อและบันทึกผลสรุป

---

## สถานะออเดอร์

```
[ใหม่] pending
   ↓ Admin กด "ส่งให้ Bot"
[รอกด] ready_for_booking
   ↓ Bot หยิบงาน
[กำลังกด] bot_working
   ↓ Bot เปิดเว็บ + ถ่าย screenshot
[รอยืนยัน] awaiting_confirmation  ← Admin ต้องกด Confirm ที่นี่
   ↓ Admin กด Confirm
[ยืนยันแล้ว] confirmed
   ↓ Bot ทำงานต่อ
[สำเร็จ] booking_successful ✅
```

ถ้าเกิดข้อผิดพลาด / Admin ยกเลิก → `booking_failed` ❌

---

## หน้า Workspace

หน้า `/workspace` แสดงผล realtime:
- ออเดอร์ที่ Bot กำลังทำงาน
- Activity log ล่าสุด
- Auto-refresh ทุก 5 วินาที

---

## ดู Log Bot

```bash
ssh root@206.189.152.41
journalctl -u ticket-bot -f
```

ตัวอย่าง log ปกติ:
```
[Bot] bot-1234567890 started. Polling every 5000ms
[Bot] Processing order TM123456
[Bot] Order TM123456: Awaiting admin confirmation...
[Bot] Order TM123456: SUCCESS
```

---

## แก้ปัญหา Bot

### Bot ไม่หยิบออเดอร์
```bash
# เช็คสถานะ service
systemctl status ticket-bot

# เช็คว่า status = 'ready_for_booking' จริงมั้ย
# ไปที่ Neon Console → SQL:
SELECT id, order_number, status FROM orders WHERE status = 'ready_for_booking';
```

### Bot ค้างอยู่ที่ bot_working
ออเดอร์อาจค้างจาก Bot crash ให้ reset:
```sql
-- Neon SQL Editor
UPDATE orders 
SET status = 'pending', bot_session_id = NULL 
WHERE status IN ('bot_working', 'awaiting_confirmation');
```

### Bot ไม่ start
```bash
# ดู error
journalctl -u ticket-bot --since "5 minutes ago"

# ลอง start manual
cd /root/app
/usr/bin/tsx src/bot/worker.ts
```

### เพิ่ม Logic การกด (สำหรับ Developer)

เปิดไฟล์ `/root/app/src/bot/worker.ts` หาส่วน:
```typescript
// ── Add site-specific booking click logic here ──
// e.g.: await page.click('#confirm-purchase-button')
// NEVER enter credit cards or personal IDs (PDPA compliance)
```

เพิ่ม Playwright actions ที่นี่ เช่น:
```typescript
// ThaiTicketMaster — เลือกที่นั่ง
await page.click('.seat-available')
await page.waitForTimeout(1000)
// ถ่าย screenshot ก่อนให้ Admin ยืนยัน
```

---

## ข้อห้าม (PDPA & ToS)

❌ **ห้ามเด็ดขาด:**
- กรอกรหัสผ่านแทนลูกค้า
- กรอก OTP แทนลูกค้า
- กรอกเลขบัตรเครดิต
- กรอกเลขบัตรประชาชน
- บันทึกข้อมูลเหล่านี้ในฐานข้อมูล

✅ **Bot ทำได้:**
- เปิดหน้าเว็บ
- เลือกที่นั่ง / โซน
- กรอกชื่อ / เบอร์โทร (ที่ได้รับอนุญาต)
- ถ่าย screenshot
- รอ Admin ยืนยันก่อนขั้นตอนสุดท้าย

---

*ถามเพิ่มเติมได้ที่ทีม Dev*
