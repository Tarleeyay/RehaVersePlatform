# RehaVerse — Vercel + Graphify Setup

คู่มือนี้เขียนสำหรับ **Windows + PowerShell** เพราะโปรเจกต์อยู่ที่
`C:\Users\natta\Documents\GitHub\RehaballPlatform`

---

## ส่วนที่ 1 — Vercel

### 1.1 วางไฟล์ config

คัดลอก `vercel.json` ลงในรากของโฟลเดอร์โปรเจกต์ (ระดับเดียวกับ `index.html`)

โครงสร้างที่ควรได้:

```
RehaballPlatform/
├── index.html
├── style.css
├── app.js
├── vercel.json          ← ใหม่
├── .claudeignore        ← ใหม่
└── .graphifyignore      ← ใหม่
```

### 1.2 เชื่อม GitHub กับ Vercel

1. ไปที่ **vercel.com** → Sign up ด้วยบัญชี GitHub
2. **Add New → Project** → เลือก repo `Rehaball` (หรือชื่อที่ใช้จริง)
3. ตั้งค่าตามนี้ **สำคัญมาก**

| ช่อง | ค่าที่ต้องใส่ |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `./` |
| Build Command | *(ปล่อยว่าง)* |
| Output Directory | *(ปล่อยว่าง)* |
| Install Command | *(ปล่อยว่าง)* |

4. กด **Deploy**

ถ้า Vercel พยายามจะ build อะไรสักอย่าง แปลว่ามันเดาผิด ให้กลับไปตั้ง Framework Preset
เป็น Other แล้ว redeploy

### 1.3 ผลลัพธ์

- ได้ URL แบบ `rehaball.vercel.app`
- ทุกครั้งที่ `git push` ขึ้น branch หลัก → deploy อัตโนมัติ
- push ขึ้น branch อื่น → ได้ **preview URL** แยก ทดสอบก่อน merge ได้

### 1.4 สามเรื่องที่ต้องรู้ก่อนย้าย

**localStorage จะไม่ตามมา** — แฟ้มเด็กที่บันทึกไว้บน `tarleeyay.github.io`
จะไม่ปรากฏบน `rehaball.vercel.app` เพราะ localStorage ผูกกับ origin
ถ้ามีเคสที่สร้างไว้แล้วอยากเก็บ ให้เปิด DevTools Console บนโดเมนเดิมแล้วรัน:

```js
copy(localStorage.getItem('rehaverse.profiles.v1'))
```

แล้วไปวางบนโดเมนใหม่ด้วย:

```js
localStorage.setItem('rehaverse.profiles.v1', `วางค่าที่คัดลอกมา`)
```

**GitHub Pages ยังทำงานต่อไป** — การ deploy Vercel ไม่ได้ปิด Pages
จะมีสองที่พร้อมกัน ควรเลือกใช้ที่เดียวตอนนำเสนอ กันสับสน

**Web Bluetooth ใช้ได้ทั้งสองที่** — ทั้ง Pages และ Vercel เป็น HTTPS
ถ้าจะต่อ ESP32 ในอนาคต ทำได้ทั้งคู่

---

## ส่วนที่ 2 — Graphify

### 2.1 Graphify คืออะไร

แปลงโค้ด + เอกสารในโปรเจกต์เป็น **knowledge graph** ที่ query ได้
แทนที่ AI assistant จะต้องอ่านไฟล์ทีละไฟล์ มันถามกราฟแทน

- โค้ดถูก parse ด้วย tree-sitter ในเครื่อง **ไม่ส่งออกไปไหน ไม่ใช้ API key**
- เอกสาร / PDF / รูป ใช้โมเดลของ Claude Code session
- ทุกเส้นเชื่อมมีป้ายว่า `EXTRACTED` (เจอตรง ๆ ในซอร์ส) หรือ `INFERRED` (ระบบอนุมาน)

### 2.2 ติดตั้ง

เปิด PowerShell:

```powershell
winget install astral-sh.uv
```

ปิดแล้วเปิด PowerShell ใหม่ จากนั้น:

```powershell
uv tool install graphifyy
graphify install
```

> **ระวังชื่อแพ็กเกจ** — บน PyPI ชื่อ `graphifyy` (ตัว y สองตัว)
> แต่คำสั่งที่เรียกใช้คือ `graphify` (y ตัวเดียว)
> แพ็กเกจชื่อ `graphify` เฉย ๆ บน PyPI **ไม่ใช่ตัวจริง**

ถ้าขึ้น `graphify: command not found`:

```powershell
uv tool update-shell
```

แล้วเปิด PowerShell ใหม่

### 2.3 สร้างกราฟครั้งแรก

เปิด Claude Code ที่โฟลเดอร์โปรเจกต์ แล้วพิมพ์:

```
/graphify .
```

> **ถ้าใช้ PowerShell ตรง ๆ** ให้พิมพ์ `graphify .` ไม่ต้องมี `/` นำหน้า
> เพราะ PowerShell อ่าน `/` เป็นตัวคั่นพาธ

ได้ผลลัพธ์ 3 ไฟล์ใน `graphify-out/`:

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `graph.html` | เปิดในเบราว์เซอร์ คลิกดูโหนดได้ |
| `GRAPH_REPORT.md` | สรุปแนวคิดหลัก + จุดเชื่อมที่ไม่คาดคิด |
| `graph.json` | กราฟเต็ม ใช้ query ต่อ |

### 2.4 ทำให้ Claude Code ใช้กราฟทุกครั้ง

```powershell
graphify claude install
```

คำสั่งนี้เขียน `CLAUDE.md` + ติดตั้ง hook ที่จะเตือน Claude Code ให้ query กราฟ
ก่อนจะไล่อ่านไฟล์ทีละไฟล์

---

## ส่วนที่ 3 — ใช้ Graphify หาความไม่ตรงกันในโปรเจกต์

**นี่คือส่วนที่ผมคิดว่าคุ้มที่สุดสำหรับโปรเจกต์นี้**

โค้ดมีแค่ 3 ไฟล์ กราฟของโค้ดล้วน ๆ จะบางมาก แต่ถ้าเอา **เอกสารเข้ามาด้วย**
มันจะกลายเป็นเครื่องมือตรวจว่า "สิ่งที่เขียนในเอกสาร" ตรงกับ "สิ่งที่โค้ดทำ" หรือไม่

ซึ่งตรงกับปัญหาที่เจอไปแล้ว — จำนวนเซนเซอร์เขียนไว้ 3 ตัวเลขในสามที่

### 3.1 จัดโครงสร้างให้เอกสารอยู่ใน repo

```
RehaballPlatform/
├── index.html
├── style.css
├── app.js
└── docs/
    ├── design.md          ← เอกสารออกแบบแพลตฟอร์ม
    ├── pitch-script.md    ← สคริปต์นำเสนอ
    └── hardware.md        ← สเปกฮาร์ดแวร์ (จำนวนเซนเซอร์ ฯลฯ)
```

### 3.2 รันแล้ว query

```
/graphify .
```

จากนั้นถามคำถามที่ตอบยากด้วยการ grep:

```
graphify query "จำนวนเซนเซอร์ FSR ปรากฏที่ไหนบ้าง"
graphify query "อะไรใช้ค่า F_work บ้าง"
graphify path "recommendMode" "screenEngagement"
graphify explain "updateEngine"
```

คำถามแรกคือคำถามที่ควรถามก่อนไปแข่ง — มันจะไล่ให้เห็นทุกจุดที่พูดถึงจำนวนเซนเซอร์
ทั้งในโค้ด (`H_max = log(12)`, heat map 12 ช่อง) และในเอกสาร (32 จุด)
แล้วคุณจะเห็นทั้งหมดในที่เดียวว่าต้องแก้กี่จุด

---

## ส่วนที่ 4 — Prompt สำหรับวางใน Claude Code

### Prompt 1 — เตรียม Vercel

```
อ่าน index.html, style.css, app.js ในโฟลเดอร์นี้

1. สร้าง vercel.json สำหรับ static site ที่ไม่มี build step
   ตั้ง Cache-Control เป็น must-revalidate สำหรับสามไฟล์นั้น
2. สร้าง .claudeignore ที่ ignore graphify-out/ และ graph.json
3. git add ไฟล์ใหม่ commit ว่า "chore: add vercel config"
   แล้ว push ขึ้น branch ปัจจุบัน

อย่าแตะโค้ดเดิม
```

### Prompt 2 — แก้จำนวนเซนเซอร์ให้ตรงกันทั้งโปรเจกต์

```
ตอนนี้จำนวนเซนเซอร์ FSR ในโปรเจกต์ไม่ตรงกัน ต้องแก้ให้เป็น 6 ทุกที่

ใน app.js:
1. ข้อความ "FSR 12 จุด @50 Hz" → "FSR 6 จุด @50 Hz"
2. ข้อความ "เซนเซอร์ 12 จุดรอบลูกบอล" → "เซนเซอร์ 6 จุดบริเวณที่นิ้วสัมผัส"
3. สูตร GDI: H_max = log(12) → log(6)
   (อยู่ในตัวแปร METHODS ช่อง f ของ GDI)
4. ฟังก์ชัน heat() วาดวงแหวน 12 ช่อง → เปลี่ยนเป็นผัง 6 จุดแบบกลุ่ม
   ไม่ใช่วงแหวนรอบวง เพราะเซนเซอร์อยู่ฝั่งเดียวไม่ได้ล้อมรอบลูก
5. คำว่า "การกระจายแรงรอบลูกบอล" → "การมีส่วนร่วมของจุดสัมผัส"

รันแล้วเปิดดูว่า heat map ยังแสดงผลถูกต้อง แล้ว commit
```

### Prompt 3 — แก้บั๊กข้อความ AI แนะนำโหมด

```
ใน app.js ฟังก์ชัน recommendMode() มีบั๊กสองอย่าง

1. ข้อความเหตุผลของ toy เขียนตายว่า "ช่วงสมาธิสั้น (X%)" ทั้งที่ X อาจเป็น 60%
   ซึ่งไม่สั้น — ให้เปลี่ยนข้อความตามค่าจริง
   ถ้า attentionSpan < 0.4 ใช้ "ช่วงสมาธิสั้น"
   ถ้า >= 0.4 ใช้ "ช่วงสมาธิพอใช้ได้"

2. ถ้าคะแนนอันดับ 1 กับอันดับ 2 ห่างกันน้อยกว่า 0.08
   ให้ขึ้นข้อความว่า "สองโหมดนี้เหมาะพอ ๆ กัน ให้ผู้ดูแลเลือก"
   แทนที่จะฟันธงโหมดเดียว

แก้แล้วทดสอบกับเคส CP-0142 ที่ตอนนี้ได้ 55% กับ 54%
```

---

## ลำดับที่แนะนำ

| ลำดับ | ทำอะไร | เวลาโดยประมาณ |
|---|---|---|
| 1 | ติดตั้ง uv + graphify | 5 นาที |
| 2 | `/graphify .` ครั้งแรก | 2 นาที |
| 3 | query หาจุดที่จำนวนเซนเซอร์ไม่ตรงกัน | 5 นาที |
| 4 | แก้ตามผลที่ได้ (Prompt 2, 3) | 20 นาที |
| 5 | วาง vercel.json แล้ว deploy | 10 นาที |

Vercel เป็นขั้นสุดท้ายโดยตั้งใจ — เพราะ GitHub Pages ใช้งานได้อยู่แล้ว
การแก้ให้ข้อมูลในระบบตรงกันสำคัญกว่าการย้ายที่ host
