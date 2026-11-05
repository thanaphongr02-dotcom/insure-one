"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/Lib/supabase";

const insuranceTypes = [
  "ประกันชีวิต", "ประกันรถยนต์", "ประกันสุขภาพ", "ประกันอุบัติเหตุ",
  "ประกันบ้านและทรัพย์สิน", "ประกันเดินทาง", "ประกันการเกษตร",
  "ประกันธุรกิจ", "อื่น ๆ",
];

function QuoteRequestForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState(insuranceTypes[0]);
  const [details, setDetails] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const company = params.get("company")?.slice(0, 120) ?? "";
  const plan = params.get("plan")?.slice(0, 120) ?? "";
  const suggestedType = params.get("insurance_type");
  const motorDetails = params.get("motor_details")?.slice(0, 1500) ?? "";

  useEffect(() => {
    if (motorDetails) setDetails(previous => previous || motorDetails);
  }, [motorDetails]);

  useEffect(() => {
    if (suggestedType && insuranceTypes.includes(suggestedType)) setType(suggestedType);
  }, [suggestedType]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || !data.user) { router.replace(`/login?next=${encodeURIComponent(`/quote${window.location.search}`)}`); return; }
        setUserId(data.user.id);
        setName(typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : "");
        setContact(typeof data.user.user_metadata?.phone === "string" ? data.user.user_metadata.phone : "");
      } catch {
        if (active) setError("ไม่สามารถตรวจสอบบัญชีได้ กรุณาลองใหม่");
      } finally {
        if (active) setReady(true);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !userId) return;
    setError("");
    if (!name.trim() || !contact.trim() || !type || !acknowledged) {
      setError("กรุณากรอกข้อมูลและรับทราบการใช้ข้อมูลส่วนบุคคล");
      return;
    }
    if (name.trim().length > 150 || contact.trim().length > 200 || details.length > 1800) {
      setError("ข้อมูลยาวเกินกว่าที่ระบบรองรับ");
      return;
    }
    if (contact.trim().length < 5 || name.trim().length < 2) {
      setError("กรุณาระบุชื่อและช่องทางติดต่อที่ถูกต้อง");
      return;
    }
    setSubmitting(true);
    const selectedPlan = [company && `บริษัท: ${company}`, plan && `แผน: ${plan}`].filter(Boolean).join("\n");
    const combinedDetails = [selectedPlan, details.trim()].filter(Boolean).join("\n\n");
    try {
      const { data: currentAuth, error: currentAuthError } = await supabase.auth.getUser();
      if (currentAuthError || !currentAuth.user || currentAuth.user.id !== userId) {
        setError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง");
        return;
      }
      const { error: insertError } = await supabase.from("quote_requests").insert({
        user_id: userId,
        contact_name: name.trim(),
        contact_info: contact.trim(),
        insurance_type: type,
        details: combinedDetails.slice(0, 2000),
      });
      if (insertError) {
        setError("ไม่สามารถส่งคำขอได้ กรุณาลองใหม่หรือติดต่อเจ้าหน้าที่");
        return;
      }
      setSuccess(true);
    } catch {
      setError("การเชื่อมต่อขัดข้อง กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  const field = { display: "block" as const, width: "100%", padding: 12, marginTop: 6, border: "1px solid #b8c8da", borderRadius: 8, boxSizing: "border-box" as const };
  return <main style={{ minHeight: "100vh", background: "#f3f7fc", padding: "32px 16px", color: "#17324d" }}>
    <div style={{ maxWidth: 660, margin: "0 auto", background: "white", padding: 28, borderRadius: 16 }}>
      <Link href="/member">← กลับหน้าสมาชิก</Link>
      <h1>ขอใบเสนอราคาประกันภัย</h1>
      <p>ส่งความต้องการให้เจ้าหน้าที่ติดต่อกลับ การส่งคำขอไม่ใช่การซื้อหรือเริ่มความคุ้มครอง</p>
      {!ready ? <p role="status">กำลังตรวจสอบบัญชี...</p> : !userId ? <p><Link href="/login">เข้าสู่ระบบเพื่อส่งคำขอ</Link></p> : success ?
        <section role="status"><h2>ส่งคำขอเรียบร้อยแล้ว</h2><p>เจ้าหน้าที่จะตรวจสอบข้อมูลและติดต่อกลับ</p><Link href="/member">ดูรายการคำขอของฉัน</Link></section> :
        <form onSubmit={submit} style={{ display: "grid", gap: 18 }}>
          <label>ชื่อผู้ติดต่อ<input style={field} value={name} onChange={e => setName(e.target.value)} maxLength={150} required /></label>
          <label>เบอร์โทรหรือช่องทางติดต่อ<input style={field} value={contact} onChange={e => setContact(e.target.value)} maxLength={200} required /></label>
          <label>ประเภทประกัน<select style={field} value={type} onChange={e => setType(e.target.value)}>
            {insuranceTypes.map(item => <option key={item} value={item}>{item}</option>)}
          </select></label>
          {(company || plan) && <div style={{ padding: 12, background: "#edf5ff", borderRadius: 8 }}>
            <strong>แผนที่สนใจ</strong><div>{company || "ไม่ระบุบริษัท"} {plan ? `· ${plan}` : ""}</div>
            <small>เจ้าหน้าที่ต้องยืนยันรายละเอียด ราคา และสิทธิ์การจำหน่ายอีกครั้ง</small>
          </div>}
          <label>รายละเอียดเพิ่มเติม<textarea style={field} rows={5} value={details} onChange={e => setDetails(e.target.value)} maxLength={1800} placeholder="ระบุความต้องการและช่วงเวลาที่สะดวกให้ติดต่อกลับ (ไม่ต้องส่งข้อมูลสุขภาพหรือเลขบัตรประชาชน)" /></label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} required />
            <span>ฉันอ่าน <Link href="/privacy" target="_blank">ข้อมูลส่วนบุคคล</Link> แล้ว และรับทราบว่าจะใช้ข้อมูลที่ส่งเพื่อติดต่อกลับเกี่ยวกับคำขอนี้ (ไม่ใช่ความยินยอมรับการตลาด)</span>
          </label>
          {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{ padding: 14, background: "#1764b3", color: "white", border: 0, borderRadius: 8, cursor: "pointer" }}>
            {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอใบเสนอราคา"}
          </button>
        </form>}
    </div>
  </main>;
}

export default function QuoteRequestPage() {
  return <Suspense fallback={<main style={{ padding: 32 }}>กำลังโหลดแบบฟอร์ม...</main>}><QuoteRequestForm /></Suspense>;
}
