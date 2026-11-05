import Link from "next/link";
import { paymentMethods } from "@/lib/payments/methods";

export default function PaymentsPage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px", lineHeight: 1.7 }}>
      <Link href="/">← กลับหน้าแรก</Link>
      <h1>ช่องทางชำระเงิน INSURE ONE</h1>
      <p role="status" style={{ padding: 16, borderRadius: 10, background: "#fff7ed", color: "#9a3412" }}>
        ยังไม่เปิดรับชำระเงินออนไลน์ในเว็บไซต์นี้ กรุณาอย่าโอนเงินตามข้อมูลที่ไม่ได้รับการยืนยันจากบริษัทประกัน
      </p>
      <p>ระบบเตรียมรองรับหลายช่องทาง โดยการเปิดใช้จริงขึ้นอยู่กับผู้ให้บริการรับชำระเงินและการอนุมัติจากบริษัทประกัน</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {paymentMethods.map((method) => (
          <section key={method.id} style={{ border: "1px solid #cbd5e1", padding: 18, borderRadius: 12 }}>
            <h2 style={{ fontSize: 19, marginTop: 0 }}>{method.label}</h2>
            <p>{method.description}</p>
            <strong style={{ color: "#9a3412" }}>รอเปิดให้บริการ</strong>
          </section>
        ))}
      </div>
      <p>การตอบรับใบเสนอราคาไม่ถือว่าได้ชำระเงินแล้วหรือเริ่มความคุ้มครอง</p>
    </main>
  );
}
