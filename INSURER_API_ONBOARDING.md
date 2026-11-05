# INSURE ONE — การเตรียมเชื่อมต่อ API บริษัทประกัน

สถานะ ณ 2026-11-05: **รอเอกสารทางการ** จาก Samsung Life Insurance (Thailand) และ Indara Insurance. การได้รับอนุญาตตามคำแจ้งของผู้ใช้งานยังไม่ใช่หลักฐานว่า API credentials, endpoints และสิทธิ์จำหน่ายผ่านเว็บไซต์ได้รับการตรวจสอบแล้ว

## ข้อมูลที่ขอแยกจากแต่ละบริษัท

1. ชื่อนิติบุคคลที่ถูกต้อง เลขทะเบียนบริษัท และผู้ประสานงานด้าน API/Partner
2. หนังสืออนุญาต/ข้อตกลงตัวแทนหรือคู่ค้า: ระบุประเภทผลิตภัณฑ์ ช่องทางออนไลน์ สิทธิ์เสนอราคา การรับเงิน การออกกรมธรรม์ และวันสิ้นสุดสิทธิ์
3. API Specification: OpenAPI/Swagger, Postman collection หรือ PDF, base URL ของ sandbox และ production, version, endpoint, HTTP methods, request/response schema, error codes
4. Authentication: OAuth2 client credentials หรือวิธีที่บริษัทกำหนด, token URL, scopes, key rotation, IP allowlist, mTLS หากจำเป็น (ส่งเฉพาะรายละเอียดวิธีการ ไม่ส่ง secret ในแชตหรือ Git)
5. ข้อมูลผลิตภัณฑ์: รหัสแผน, ชนิดประกัน, เงื่อนไขความคุ้มครอง, ระยะเวลา, ตัวอย่าง quote, ราคาและโปรโมชั่นที่อนุญาตให้เผยแพร่
6. ข้อกำหนด PDPA: ขอบเขตข้อมูลลูกค้า, consent, retention, logging, data processor agreement และ incident contact
7. Webhook specification: ลายเซ็น, replay prevention, idempotency, retry, reconciliation และสถานะกรมธรรม์
8. ขั้นตอน sandbox/UAT และหนังสืออนุมัติ production go-live

## แบบฟอร์มตรวจสอบสถานะ

| บริษัท | Docs | Sandbox | ขอบเขตสิทธิ์ยืนยัน | UAT | Production |
|---|---|---|---|---|---|
| Samsung Life Insurance (Thailand) | รอ | รอ | รอเอกสาร | ไม่เริ่ม | ปิด |
| Indara Insurance | รอ | รอ | รอเอกสาร | ไม่เริ่ม | ปิด |

**ห้ามเปิด** live quote, checkout, payment, policy issuance หรือเผยแพร่ราคาโดยอาศัยการคาดเดา endpoint/ราคา/สิทธิ์

## การนำข้อมูลเข้าระบบอย่างปลอดภัย

- ตรวจสอบไฟล์ API spec ที่ปกปิด secrets และข้อมูลลูกค้าจริงก่อน
- เก็บ secret เฉพาะใน Vercel server-side environment variables (ไม่มี NEXT_PUBLIC_ prefix), จำกัดสิทธิ์และใช้ sandbox ก่อน
- Implement server-side adapter ตาม `lib/insurance/carrier-adapter.ts` และตรวจสอบผลด้วย `validateCarrierQuote`
- ใช้ RLS บน Supabase; ไม่ให้ browser เรียก insurer API โดยตรง
- ทำ contract tests จากตัวอย่างทางการ, timeout/retry/rate limit, idempotency, audit log และการจัดการ consent
- ต้องผ่าน sandbox UAT และมีหลักฐานอนุมัติ production ก่อนลงทะเบียน adapter เป็น approved
- ก่อนอนุมัติยังใช้ `/quote` เพื่อรับคำขอจากลูกค้าได้เท่านั้น; `/api/insurance/carriers/quote` ต้อง fail closed

## ข้อความสำหรับส่งเจ้าหน้าที่

เรื่อง: ขอเอกสาร API Integration และ Sandbox สำหรับ INSURE ONE

เรียนฝ่าย Partner / IT Integration

ผมได้รับแจ้งสิทธิ์เชื่อมต่อระบบของบริษัทและต้องการดำเนินการผ่านเว็บไซต์ INSURE ONE (https://insure-one-seven.vercel.app/) รบกวนส่ง API Documentation, Sandbox URL, Authentication Guide, ตัวอย่าง Request/Response, ขอบเขตผลิตภัณฑ์และสิทธิ์ออนไลน์ที่อนุมัติ, ข้อกำหนด PDPA/ความปลอดภัย และขั้นตอน UAT/Production Approval พร้อมชื่อผู้ประสานงานด้านเทคนิค

กรุณาส่ง secrets ผ่านช่องทางจัดการข้อมูลลับของบริษัท ไม่ส่งในอีเมลทั่วไปหรือ GitHub

ขอบพระคุณครับ
