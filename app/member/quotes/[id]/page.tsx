"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/Lib/supabase";

type Quote = {
  id: string;
  contact_name: string;
  contact_info: string;
  insurance_type: string;
  details: string | null;
  status: string;
  created_at: string;
};
type History = {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
};
type InsuranceOffer = {
  id: string;
  quote_id: string;
  company_name: string;
  plan_name: string;
  premium_amount: number;
  price_period: string;
  coverage_details: string;
  terms_and_conditions: string | null;
  valid_until: string;
  status: string;
  created_at: string;
};

type InsuranceOrder = {
  id: string;
  offer_id: string;
  status: string;
  payment_channel_description: string | null;
  payment_confirmed_at: string | null;
  policy_number: string | null;
  policy_issued_at: string | null;
  policy_document_url: string | null;
  created_at: string;
  updated_at: string;
};

const orderStatusNames: Record<string, string> = {
  awaiting_payment_channel: "รอจัดเตรียมช่องทางชำระเงิน",
  awaiting_payment_confirmation: "รอตรวจสอบการชำระเงิน",
  payment_confirmed: "ยืนยันการชำระเงินแล้ว",
  awaiting_policy: "รอบริษัทประกันออกกรมธรรม์",
  policy_issued: "บริษัทประกันออกกรมธรรม์แล้ว",
  cancelled: "ยกเลิกการดำเนินการ",
};
const orderSteps = [
  "awaiting_payment_channel",
  "awaiting_payment_confirmation",
  "payment_confirmed",
  "awaiting_policy",
  "policy_issued",
];

const statusNames: Record<string, string> = {
  pending: "รอดำเนินการ",
  reviewing: "กำลังตรวจสอบ",
  completed: "ดำเนินการเสร็จสิ้น",
  cancelled: "ยกเลิกคำขอ",
};
const offerStatusNames: Record<string, string> = {
  draft: "ฉบับร่าง",
  sent: "ส่งใบเสนอราคาแล้ว",
  accepted: "สนใจดำเนินการซื้อ",
  declined: "ไม่รับข้อเสนอ",
  expired: "ใบเสนอราคาหมดอายุ",
};
function formatDate(date: string) {
  return new Date(date).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}
function formatMoney(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
function getTodayThailand() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
};

export default function MemberQuoteDetailPage() {
  const params = useParams();
  const quoteId = typeof params?.id === "string" ? params.id : "";
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [offer, setOffer] = useState<InsuranceOffer | null>(null);
  const [order, setOrder] = useState<InsuranceOrder | null>(null);
  const [orderError, setOrderError] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [offerError, setOfferError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responding, setResponding] = useState(false);
  const [openingPolicy, setOpeningPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      setPolicyError("");
      setLoading(true);
      setErrorMessage("");
      setOfferError("");
      setOrderError("");
      setOrder(null);
      setQuote(null);
      setOffer(null);
      setHistory([]);
      if (!quoteId) {
        setErrorMessage("ไม่พบรหัสคำขอ");
        setLoading(false);
        return;
      }
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !auth.user) {
          window.location.replace("/login");
          return;
        }
        const { data: quoteData, error: quoteError } = await supabase
          .from("quote_requests")
          .select("id, contact_name, contact_info, insurance_type, details, status, created_at")
          .eq("id", quoteId)
          .eq("user_id", auth.user.id)
          .maybeSingle();
        if (!active) return;
        if (quoteError) {
          setErrorMessage("โหลดคำขอไม่สำเร็จ: " + quoteError.message);
          return;
        }
        if (!quoteData) {
          setErrorMessage("ไม่พบคำขอ หรือคุณไม่มีสิทธิ์ดูคำขอนี้");
          return;
        }
        setQuote(quoteData as Quote);
        const [historyResult, offerResult] = await Promise.all([
          supabase.from("quote_status_history")
            .select("id, old_status, new_status, changed_at")
            .eq("quote_id", quoteId)
            .order("changed_at", { ascending: true }),
          supabase.from("insurance_offers")
            .select("id, quote_id, company_name, plan_name, premium_amount, price_period, coverage_details, terms_and_conditions, valid_until, status, created_at")
            .eq("quote_id", quoteId)
            .in("status", ["sent", "accepted", "declined", "expired"])
            .maybeSingle(),
        ]);
        if (!active) return;
        if (historyResult.error) {
          setErrorMessage("โหลดประวัติสถานะไม่สำเร็จ: " + historyResult.error.message);
        } else {
          setHistory((historyResult.data ?? []) as History[]);
        }
        if (offerResult.error) {
          setOfferError("โหลดใบเสนอราคาไม่สำเร็จ: " + offerResult.error.message);
        } else {
          const loadedOffer = (offerResult.data as InsuranceOffer | null) ?? null;
          setOffer(loadedOffer);
          if (loadedOffer?.status === "accepted") {
            const { data: orderData, error: orderFetchError } = await supabase
              .from("insurance_orders")
              .select("id, offer_id, status, payment_channel_description, payment_confirmed_at, policy_number, policy_issued_at, policy_document_url, created_at, updated_at")
              .eq("offer_id", loadedOffer.id)
              .maybeSingle();
            if (!active) return;
            if (orderFetchError) {
              setOrderError("โหลดสถานะการซื้อไม่สำเร็จ: " + orderFetchError.message);
            } else {
              setOrder((orderData as InsuranceOrder | null) ?? null);
            }
          }
        }
      } catch {
        if (active) setErrorMessage("ไม่สามารถเชื่อมต่อข้อมูลได้ กรุณาลองใหม่");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    return () => { active = false; };
  }, [quoteId]);

  async function respondToOffer(response: "accepted" | "declined") {
    if (!offer || offer.status !== "sent" || responding ||
        offer.valid_until < getTodayThailand()) return;
    const prompt = response === "accepted"
      ? "ยืนยันว่าคุณสนใจดำเนินการซื้อประกันตามใบเสนอราคานี้? การยืนยันยังไม่ใช่การชำระเงินหรือเริ่มความคุ้มครอง"
      : "ยืนยันว่าไม่รับใบเสนอราคานี้?";
    if (!window.confirm(prompt)) return;
    setResponding(true);
    setResponseMessage("");
    try {
      const { error } = await supabase.rpc("respond_to_insurance_offer", {
        p_offer_id: offer.id,
        p_response: response,
      });
      if (error) {
        setResponseMessage("บันทึกคำตอบไม่สำเร็จ: " + error.message);
        return;
      }
      // อัปเดตหน้าจอเฉพาะเมื่อฐานข้อมูลตอบกลับว่าสำเร็จแล้ว
      setOffer((current) => current ? { ...current, status: response } : current);
      setResponseMessage(response === "accepted"
        ? "บันทึกความสนใจซื้อแล้ว กรุณารอเจ้าหน้าที่ติดต่อเพื่อดำเนินการขั้นต่อไป"
        : "บันทึกการไม่รับข้อเสนอแล้ว");
    } catch {
      setResponseMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่");
    } finally {
      setResponding(false);
    }
  }

  async function openPolicyDocument() {
    if (!order || order.status !== "policy_issued" || !order.policy_document_url || openingPolicy) return;
    setPolicyError("");
    setOpeningPolicy(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) {
        setPolicyError("กรุณาเข้าสู่ระบบอีกครั้ง");
        return;
      }
      // Storage RLS checks that this file belongs to the signed-in member.
      const { data, error } = await supabase.storage
        .from("insurance-policies")
        .download(order.policy_document_url);
      if (error || !data) {
        setPolicyError("ไม่สามารถเปิดกรมธรรม์ได้: " + (error?.message ?? "ไม่พบไฟล์"));
        return;
      }
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      // Open in a new tab when possible; otherwise download as a local PDF.
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "INSURE-ONE-policy.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      // Delay cleanup to allow the new tab or browser download to read the blob.
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setPolicyError("เกิดข้อผิดพลาดขณะเปิดเอกสาร กรุณาลองใหม่");
    } finally {
      setOpeningPolicy(false);
    }
  }

  if (loading) return <main style={{ padding: 40 }}>กำลังโหลดรายละเอียดคำขอ...</main>;
  const offerExpired = offer !== null && offer.valid_until < getTodayThailand();
  return (
    <main style={{ minHeight: "100vh", background: "#f3f7fc", padding: "32px 18px", color: "#102b50" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <Link href="/member" style={{ color: "#1764b3", textDecoration: "none", fontWeight: 600 }}>
          ← กลับหน้าสมาชิก
        </Link>
        <h1 style={{ marginTop: 26 }}>รายละเอียดคำขอใบเสนอราคา</h1>
        <p style={{ color: "#64748b", lineHeight: 1.7 }}>
          ตรวจสอบคำขอ ประวัติสถานะ และใบเสนอราคาที่ได้รับจาก INSURE ONE
        </p>
        {errorMessage && <div role="alert" style={{ padding: 16, background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, marginBottom: 20 }}>{errorMessage}</div>}
        {quote && <>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>ข้อมูลคำขอ</h2>
            <p><strong>เลขที่คำขอ:</strong> {quote.id}</p>
            <p><strong>ชื่อผู้ติดต่อ:</strong> {quote.contact_name}</p>
            <p><strong>ช่องทางติดต่อ:</strong> {quote.contact_info}</p>
            <p><strong>ประเภทประกัน:</strong> {quote.insurance_type}</p>
            <p><strong>วันที่ส่งคำขอ:</strong> {formatDate(quote.created_at)}</p>
            <p><strong>สถานะปัจจุบัน:</strong> {statusNames[quote.status] ?? quote.status}</p>
            {quote.details && <div style={{ marginTop: 18, background: "#f8fafc", padding: 16, borderRadius: 10, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              <strong>รายละเอียดเพิ่มเติม</strong><p>{quote.details}</p>
            </div>}
          </section>
          <section style={{ ...cardStyle, border: "1px solid #bfd7f5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0 }}>ใบเสนอราคาประกันภัย</h2>
              {offer && <span style={{ padding: "7px 12px", borderRadius: 20, background: offerExpired ? "#fff1f2" : "#eaf3ff", color: offerExpired ? "#b91c1c" : "#1764b3", fontSize: 13, fontWeight: 700 }}>
                {offerExpired && offer.status === "sent" ? "หมดอายุแล้ว" : offerStatusNames[offer.status] ?? offer.status}
              </span>}
            </div>
            {offerError && <p role="alert" style={{ color: "#b91c1c" }}>{offerError}</p>}
            {!offer && !offerError && <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, marginTop: 18, color: "#64748b" }}>
              ยังไม่มีใบเสนอราคาที่ส่งให้คุณ กรุณารอเจ้าหน้าที่ตรวจสอบและจัดทำข้อเสนอ
            </div>}
            {offer && <div style={{ marginTop: 20 }}>
              <p><strong>บริษัทประกัน:</strong> {offer.company_name}</p>
              <p><strong>แผนประกัน:</strong> {offer.plan_name}</p>
              <div style={{ background: "#eff6ff", borderRadius: 14, padding: 22, margin: "20px 0" }}>
                <div style={{ color: "#64748b", fontSize: 14 }}>เบี้ยประกันตามใบเสนอราคา</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#1556a2", marginTop: 6 }}>฿{formatMoney(offer.premium_amount)}</div>
                <div style={{ marginTop: 6, fontSize: 14 }}>รอบชำระ: {offer.price_period}</div>
              </div>
              <h3>รายละเอียดความคุ้มครอง</h3>
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{offer.coverage_details}</div>
              <h3>เงื่อนไขใบเสนอราคา</h3>
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                {offer.terms_and_conditions || "โปรดติดต่อเจ้าหน้าที่เพื่อสอบถามเงื่อนไขเพิ่มเติม"}
              </div>
              <p style={{ marginTop: 20 }}><strong>ใบเสนอราคามีผลถึง:</strong> {new Date(`${offer.valid_until}T12:00:00`).toLocaleDateString("th-TH", { dateStyle: "long", timeZone: "Asia/Bangkok" })}</p>
              {offerExpired && offer.status === "sent" && <p style={{ color: "#b91c1c", fontWeight: 600 }}>ใบเสนอราคานี้หมดอายุแล้ว กรุณาขอใบเสนอราคาใหม่</p>}
              {offer.status === "sent" && !offerExpired && <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 22, paddingTop: 20 }}>
                <h3 style={{ marginTop: 0 }}>ตอบรับใบเสนอราคา</h3>
                <p style={{ color: "#64748b", fontSize: 14 }}>เลือกได้หนึ่งครั้ง กรุณาตรวจสอบรายละเอียดก่อนยืนยัน</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" disabled={responding} onClick={() => void respondToOffer("accepted")}
                    style={{ padding: "13px 18px", background: "#1764b3", color: "white", border: 0, borderRadius: 10, cursor: responding ? "wait" : "pointer", fontWeight: 700 }}>
                    {responding ? "กำลังบันทึก..." : "สนใจดำเนินการซื้อ"}
                  </button>
                  <button type="button" disabled={responding} onClick={() => void respondToOffer("declined")}
                    style={{ padding: "13px 18px", background: "white", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 10, cursor: responding ? "wait" : "pointer", fontWeight: 700 }}>
                    ไม่รับข้อเสนอ
                  </button>
                </div>
              </div>}
              {offer.status === "accepted" && <p role="status" style={{ padding: 16, background: "#ecfdf5", color: "#166534", borderRadius: 10, marginTop: 20 }}>
                บันทึกความสนใจซื้อแล้ว เจ้าหน้าที่จะติดต่อเพื่อดำเนินการขั้นต่อไป ยังไม่มีการชำระเงินหรือเริ่มความคุ้มครอง
              </p>}
              {offer.status === "declined" && <p role="status" style={{ padding: 16, background: "#f8fafc", color: "#475569", borderRadius: 10, marginTop: 20 }}>คุณเลือกไม่รับข้อเสนอนี้แล้ว</p>}
              {responseMessage && <p role="status" aria-live="polite" style={{ color: responseMessage.startsWith("บันทึก") ? "#166534" : "#b91c1c", fontWeight: 600 }}>{responseMessage}</p>}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginTop: 22, color: "#64748b", fontSize: 13, lineHeight: 1.8 }}>
                ใบเสนอราคานี้เป็นข้อมูลสำหรับพิจารณา ยังไม่ใช่กรมธรรม์ และยังไม่ถือว่ามีความคุ้มครอง การซื้อและการชำระเงินต้องดำเนินการผ่านช่องทางที่ได้รับอนุญาต
              </div>
            </div>}
          </section>
          {offer?.status === "accepted" && (
            <section style={{ ...cardStyle, border: "1px solid #bfdbfe" }}>
              <h2 style={{ marginTop: 0 }}>ติดตามการชำระเงินและกรมธรรม์</h2>
              <p style={{ color: "#64748b", lineHeight: 1.7 }}>
                ติดตามความคืบหน้าหลังแสดงความสนใจซื้อประกันภัย
              </p>
              {orderError && <p role="alert" style={{ color: "#b91c1c" }}>{orderError}</p>}
              {!order && !orderError && (
                <div style={{ padding: 16, borderRadius: 10, background: "#f8fafc" }}>
                  เจ้าหน้าที่กำลังเตรียมรายการติดตามการซื้อ กรุณาตรวจสอบอีกครั้งภายหลัง
                </div>
              )}
              {order && (
                <>
                  <div style={{ padding: 16, borderRadius: 12, background: order.status === "cancelled" ? "#fff1f2" : "#eff6ff", marginBottom: 20 }}>
                    <strong>สถานะปัจจุบัน: {orderStatusNames[order.status] ?? order.status}</strong>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: 0 }}>
                      อัปเดตล่าสุด {formatDate(order.updated_at)}
                    </p>
                  </div>
                  {order.status !== "cancelled" ? (
                    <div style={{ borderLeft: "3px solid #1764b3", paddingLeft: 20, marginBottom: 20 }}>
                      {orderSteps.map((step, index) => {
                        const currentIndex = orderSteps.indexOf(order.status);
                        const done = currentIndex >= index;
                        return (
                          <div key={step} style={{ marginBottom: 18, color: done ? "#102b50" : "#94a3b8" }}>
                            <strong>{done ? "✓ " : "○ "}{orderStatusNames[step]}</strong>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p style={{ color: "#b91c1c" }}>รายการนี้ถูกยกเลิก กรุณาติดต่อเจ้าหน้าที่หากต้องการสอบถาม</p>}
                  {order.payment_channel_description && (
                    <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginBottom: 14 }}>
                      <strong>ข้อมูลช่องทางชำระเงินจากเจ้าหน้าที่</strong>
                      <p style={{ marginBottom: 0 }}>{order.payment_channel_description}</p>
                    </div>
                  )}
                  {order.payment_confirmed_at && (
                    <p><strong>วันที่ได้รับการยืนยันการชำระเงิน:</strong> {formatDate(order.payment_confirmed_at)}</p>
                  )}
                  {order.status === "policy_issued" && order.policy_number && (
                    <p><strong>เลขกรมธรรม์:</strong> {order.policy_number}</p>
                  )}
                  {order.status === "policy_issued" && order.policy_issued_at && (
                    <p><strong>วันที่ออกกรมธรรม์:</strong> {formatDate(order.policy_issued_at)}</p>
                  )}
                   {order.status === "policy_issued" && (
                     <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 12, marginBottom: 16 }}>
                       <strong>เอกสารกรมธรรม์ประกันภัย</strong>
                       {order.policy_document_url ? (
                         <div style={{ marginTop: 12 }}>
                           <button type="button" disabled={openingPolicy} onClick={() => void openPolicyDocument()}
                             style={{ background: "#1764b3", color: "white", border: 0, borderRadius: 9, padding: "12px 18px", fontWeight: 700, cursor: openingPolicy ? "wait" : "pointer" }}>
                             {openingPolicy ? "กำลังเปิดเอกสาร..." : "เปิดดูกรมธรรม์ PDF"}
                           </button>
                         </div>
                       ) : (
                         <p style={{ marginBottom: 0 }}>บริษัทประกันออกกรมธรรม์แล้ว แต่เจ้าหน้าที่ยังไม่ได้แนบไฟล์ PDF</p>
                       )}
                       {policyError && <p role="alert" style={{ color: "#b91c1c" }}>{policyError}</p>}
                     </div>
                   )}
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                    ข้อมูลนี้เป็นเพียงสถานะการดำเนินงาน ไม่ใช่หลักฐานการชำระเงินหรือการรับประกัน
                    โปรดชำระเงินผ่านช่องทางที่ได้รับอนุญาตและตรวจสอบกับเจ้าหน้าที่ก่อนทำรายการ
                    เอกสารกรมธรรม์ PDF จะเปิดให้ดูเมื่อบริษัทประกันออกกรมธรรม์และเจ้าหน้าที่แนบไฟล์เรียบร้อยแล้ว
                  </p>
                </>
              )}
            </section>
          )}
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>ประวัติสถานะคำขอ</h2>
            <div style={{ borderLeft: "3px solid #1764b3", paddingLeft: 22, marginTop: 24 }}>
              <div style={{ marginBottom: 28 }}><strong>ส่งคำขอใบเสนอราคา</strong><p style={{ color: "#64748b" }}>{formatDate(quote.created_at)}</p></div>
              {history.map((item) => <div key={item.id} style={{ marginBottom: 28 }}>
                <strong>{statusNames[item.new_status] ?? item.new_status}</strong>
                <p style={{ color: "#64748b" }}>{formatDate(item.changed_at)}</p>
                <p style={{ fontSize: 14 }}>เปลี่ยนจาก {statusNames[item.old_status ?? ""] ?? item.old_status ?? "ไม่ระบุ"}</p>
              </div>)}
            </div>
            {history.length === 0 && <p style={{ color: "#64748b" }}>ยังไม่มีประวัติการเปลี่ยนสถานะหลังเปิดใช้งานระบบติดตาม</p>}
          </section>
        </>}
      </div>
    </main>
  );
}
