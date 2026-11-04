"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/Lib/supabase";

type Offer = {
  id: string;
  quote_id: string;
  company_name: string;
  plan_name: string;
  premium_amount: number;
  status: string;
};
type Order = {
  id: string;
  offer_id: string;
  status: string;
  payment_channel_description: string | null;
  payment_reference: string | null;
  payment_confirmed_at: string | null;
  policy_number: string | null;
  policy_issued_at: string | null;
  policy_document_url: string | null;
  admin_notes: string | null;
};
type Draft = {
  status: string;
  payment_channel_description: string;
  payment_reference: string;
  policy_number: string;
  admin_notes: string;
};
const steps = [
  { value: "awaiting_payment_channel", label: "รอจัดเตรียมช่องทางชำระเงิน" },
  { value: "awaiting_payment_confirmation", label: "รอตรวจสอบการชำระเงิน" },
  { value: "payment_confirmed", label: "ยืนยันการชำระเงินแล้ว" },
  { value: "awaiting_policy", label: "รอบริษัทประกันออกกรมธรรม์" },
  { value: "policy_issued", label: "บริษัทประกันออกกรมธรรม์แล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];
const allowedNext: Record<string, string[]> = {
  awaiting_payment_channel: ["awaiting_payment_confirmation", "cancelled"],
  awaiting_payment_confirmation: ["payment_confirmed", "cancelled"],
  payment_confirmed: ["awaiting_policy"],
  awaiting_policy: ["policy_issued"],
  policy_issued: [],
  cancelled: [],
};

const label = (status: string) => steps.find((s) => s.value === status)?.label ?? status;
const emptyDraft = (): Draft => ({
  status: "awaiting_payment_channel",
  payment_channel_description: "",
  payment_reference: "",
  policy_number: "",
  admin_notes: "",
});
const fieldStyle: React.CSSProperties = {
  width: "100%", padding: 11, border: "1px solid #cbd5e1", borderRadius: 9,
  background: "white", color: "#102b50", boxSizing: "border-box",
};
const money = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(n);

export default function AdminOrdersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [policyFiles, setPolicyFiles] = useState<Record<string, File | null>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      window.location.replace("/login");
      return;
    }
    const { data: admin, error: adminError } = await supabase
      .from("admin_users").select("user_id")
      .eq("user_id", auth.user.id).maybeSingle();
    if (adminError || !admin) {
      setAuthorized(false);
      setError(adminError?.message ?? "บัญชีนี้ไม่มีสิทธิ์เข้าถึง Admin");
      setLoading(false);
      return;
    }
    setAuthorized(true);
    const [offerResult, orderResult] = await Promise.all([
      supabase.from("insurance_offers")
        .select("id,quote_id,company_name,plan_name,premium_amount,status")
        .eq("status", "accepted").order("created_at", { ascending: false }),
      supabase.from("insurance_orders")
        .select("id,offer_id,status,payment_channel_description,payment_reference,payment_confirmed_at,policy_number,policy_issued_at,policy_document_url,admin_notes")
        .order("created_at", { ascending: false }),
    ]);
    if (offerResult.error || orderResult.error) {
      setError(offerResult.error?.message ?? orderResult.error?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } else {
      setOffers((offerResult.data ?? []) as Offer[]);
      const fetched = (orderResult.data ?? []) as Order[];
      setOrders(fetched);
      const next: Record<string, Draft> = {};
      for (const o of fetched) {
        next[o.id] = {
          status: o.status,
          payment_channel_description: o.payment_channel_description ?? "",
          payment_reference: o.payment_reference ?? "",
          policy_number: o.policy_number ?? "",
          admin_notes: o.admin_notes ?? "",
        };
      }
      setDrafts(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createOrder(offerId: string) {
    if (busy || !authorized) return;
    setBusy(offerId); setMessage(""); setError("");
    const { error: insertError } = await supabase.from("insurance_orders").insert({
      offer_id: offerId, status: "awaiting_payment_channel",
    });
    if (insertError) setError(`สร้างรายการไม่สำเร็จ: ${insertError.message}`);
    else { setMessage("สร้างรายการติดตามเรียบร้อยแล้ว"); await load(); }
    setBusy(null);
  }

  function edit(id: string, key: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  }

  async function saveOrder(order: Order) {
    if (busy || !authorized) return;
    const d = drafts[order.id];
    if (!d) return;
    if (d.status !== order.status && !(allowedNext[order.status] ?? []).includes(d.status)) {
      setError("ไม่สามารถข้ามขั้นตอนหรือย้อนสถานะได้ กรุณาเลือกสถานะถัดไปตามลำดับ");
      return;
    }
    if (d.status === "payment_confirmed" || d.status === "awaiting_policy" || d.status === "policy_issued") {
      if (!d.payment_reference.trim()) {
        setError("ก่อนยืนยันการชำระเงิน ต้องมีเลขอ้างอิงจากผู้รับชำระที่ตรวจสอบแล้ว");
        return;
      }
      if (!order.payment_confirmed_at && !window.confirm("ยืนยันว่าตรวจสอบหลักฐานการชำระเงินจริงจากช่องทางที่ได้รับอนุญาตแล้ว?")) return;
    }
    if (d.status === "policy_issued") {
      if (!d.policy_number.trim()) {
        setError("ต้องระบุเลขกรมธรรม์ที่บริษัทประกันออกจริงก่อน");
        return;
      }
      if (!order.policy_issued_at && !window.confirm("ยืนยันว่าบริษัทประกันออกกรมธรรม์จริงแล้ว?")) return;
    }
    setBusy(order.id); setMessage(""); setError("");
    const payload: Record<string, string | null> = {
      status: d.status,
      payment_channel_description: d.payment_channel_description.trim() || null,
      payment_reference: d.payment_reference.trim() || null,
      policy_number: d.policy_number.trim() || null,
      admin_notes: d.admin_notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (!order.payment_confirmed_at && ["payment_confirmed", "awaiting_policy", "policy_issued"].includes(d.status)) {
      payload.payment_confirmed_at = new Date().toISOString();
    }
    if (!order.policy_issued_at && d.status === "policy_issued") {
      payload.policy_issued_at = new Date().toISOString();
    }
    const { data: savedOrder, error: updateError } = await supabase.from("insurance_orders")
      .update(payload).eq("id", order.id).eq("status", order.status).select("id").maybeSingle();
    if (updateError) {
      setError(updateError.message.includes("Invalid insurance order status transition")
        ? "ฐานข้อมูลปฏิเสธการข้ามสถานะ กรุณารีเฟรชและเลือกขั้นตอนถัดไป"
        : `บันทึกไม่สำเร็จ: ${updateError.message}`);
    } else if (!savedOrder) {
      setError("ข้อมูลคำสั่งซื้อเปลี่ยนไปแล้ว กรุณารีเฟรชหน้าแล้วลองใหม่");
    }
    else { setMessage("บันทึกสถานะเรียบร้อยแล้ว"); await load(); }
    setBusy(null);
  }

  async function uploadPolicy(order: Order) {
    if (busy || !authorized) return;
    const file = policyFiles[order.id];
    if (!file) { setError("กรุณาเลือกไฟล์ PDF ก่อน"); return; }
    if (order.status !== "policy_issued" || !order.policy_number) {
      setError("ต้องยืนยันว่าบริษัทประกันออกกรมธรรม์จริง และบันทึกเลขกรมธรรม์ก่อนอัปโหลด");
      return;
    }
    if (order.policy_document_url) {
      setError("รายการนี้มีเอกสารกรมธรรม์แล้ว หากต้องแก้ไขให้ตรวจสอบกับผู้ดูแลระบบก่อน");
      return;
    }
    if (file.size === 0 || file.size > 10 * 1024 * 1024 ||
        file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 10 MB");
      return;
    }
    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...signature) !== "%PDF-") {
      setError("ไฟล์ที่เลือกไม่ใช่เอกสาร PDF ที่ถูกต้อง");
      return;
    }
    if (!window.confirm("ยืนยันว่าไฟล์นี้เป็นกรมธรรม์ที่บริษัทประกันออกให้จริง และเป็นของลูกค้ารายนี้?")) return;

    setBusy(order.id); setError(""); setMessage("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
      const { data: admin, error: adminError } = await supabase.from("admin_users")
        .select("user_id").eq("user_id", auth.user.id).maybeSingle();
      if (adminError || !admin) throw new Error("ไม่มีสิทธิ์อัปโหลดเอกสาร");
      const { data: latest, error: latestError } = await supabase.from("insurance_orders")
        .select("id,status,policy_number,policy_document_url").eq("id", order.id).single();
      if (latestError || !latest || latest.status !== "policy_issued" ||
          !latest.policy_number || latest.policy_document_url) {
        throw new Error("สถานะรายการเปลี่ยนไปหรือมีเอกสารอยู่แล้ว กรุณารีเฟรชหน้า");
      }
      const path = `${order.id}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage.from("insurance-policies")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (uploadError) throw new Error(`อัปโหลดไม่สำเร็จ: ${uploadError.message}`);
      const { data: saved, error: updateError } = await supabase.from("insurance_orders")
        .update({ policy_document_url: path, updated_at: new Date().toISOString() })
        .eq("id", order.id).eq("status", "policy_issued")
        .is("policy_document_url", null).select("id").maybeSingle();
      if (updateError || !saved) {
        throw new Error("อัปโหลดไฟล์แล้ว แต่บันทึกตำแหน่งไฟล์ไม่สำเร็จ กรุณาแจ้งผู้ดูแลระบบ อย่าอัปโหลดซ้ำ: " + (updateError?.message ?? "ข้อมูลเปลี่ยนไป"));
      }
      setPolicyFiles((prev) => ({ ...prev, [order.id]: null }));
      await load();
      setMessage("อัปโหลดและผูกกรมธรรม์กับรายการเรียบร้อยแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <main style={{ padding: 32 }}>กำลังโหลดรายการซื้อประกัน...</main>;
  if (!authorized) return <main style={{ padding: 32 }}><h1>ไม่สามารถเข้าถึงหน้านี้</h1><p>{error}</p><Link href="/member">กลับหน้าสมาชิก</Link></main>;

  return (
    <main style={{ minHeight: "100vh", background: "#f3f7fc", color: "#102b50", padding: "32px 18px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#1764b3" }}>← กลับ Admin Dashboard</Link>
        <h1 style={{ marginBottom: 8 }}>จัดการคำสั่งซื้อและกรมธรรม์</h1>
        <p style={{ color: "#64748b", lineHeight: 1.7 }}>แสดงใบเสนอราคาที่ลูกค้าตอบรับแล้ว และติดตามขั้นตอนหลังการตอบรับ โดยไม่มีระบบรับชำระเงินในหน้านี้</p>
        {message && <p role="status" style={{ color: "#15803d", background: "#dcfce7", padding: 12, borderRadius: 8 }}>{message}</p>}
        {error && <p role="alert" style={{ color: "#b91c1c", background: "#fee2e2", padding: 12, borderRadius: 8 }}>{error}</p>}
        {offers.length === 0 && <section style={{ background: "white", padding: 24, borderRadius: 14 }}>ยังไม่มีใบเสนอราคาที่ลูกค้าตอบรับ</section>}
        <div style={{ display: "grid", gap: 18 }}>
          {offers.map((offer) => {
            const order = orders.find((o) => o.offer_id === offer.id);
            const d = order ? drafts[order.id] : undefined;
            return (
              <section key={offer.id} style={{ background: "white", border: "1px solid #d8e3ef", borderRadius: 16, padding: 22 }}>
                <h2 style={{ marginTop: 0, fontSize: 20 }}>{offer.company_name}</h2>
                <p><strong>แผน:</strong> {offer.plan_name}</p>
                <p><strong>เบี้ยตามใบเสนอราคา:</strong> {money(offer.premium_amount)}</p>
                <p style={{ fontSize: 12, color: "#64748b", overflowWrap: "anywhere" }}>รหัสคำขอ: {offer.quote_id}</p>
                {!order ? (
                  <button disabled={busy !== null} onClick={() => void createOrder(offer.id)} style={{ padding: "12px 18px", border: 0, borderRadius: 9, background: "#1764b3", color: "white", cursor: "pointer" }}>
                    {busy === offer.id ? "กำลังสร้าง..." : "+ สร้างรายการติดตามการซื้อ"}
                  </button>
                ) : d ? (
                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 18, display: "grid", gap: 14 }}>
                    <strong>สถานะปัจจุบัน: {label(order.status)}</strong>
                    <label>เปลี่ยนสถานะ
                      <select value={d.status} onChange={(e) => edit(order.id, "status", e.target.value)} style={{ ...fieldStyle, marginTop: 6 }}>
                        {steps.filter((s) => s.value === order.status || (allowedNext[order.status] ?? []).includes(s.value))
                           .map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </label>
                    <label>รายละเอียดช่องทางชำระเงินที่ได้รับอนุญาต
                      <textarea rows={2} value={d.payment_channel_description} onChange={(e) => edit(order.id, "payment_channel_description", e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} placeholder="เช่น ขั้นตอนชำระผ่านช่องทางทางการของบริษัทประกัน (ไม่ใส่บัญชีส่วนตัว)" />
                    </label>
                    <label>เลขอ้างอิงการชำระเงินที่ตรวจสอบแล้ว
                      <input value={d.payment_reference} onChange={(e) => edit(order.id, "payment_reference", e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} />
                    </label>
                    <label>เลขกรมธรรม์ที่บริษัทประกันออกให้จริง
                      <input value={d.policy_number} onChange={(e) => edit(order.id, "policy_number", e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} />
                    </label>
                    <label>หมายเหตุสำหรับเจ้าหน้าที่
                      <textarea rows={3} value={d.admin_notes} onChange={(e) => edit(order.id, "admin_notes", e.target.value)} style={{ ...fieldStyle, marginTop: 6 }} />
                    </label>
                    <button disabled={busy !== null} onClick={() => void saveOrder(order)} style={{ justifySelf: "start", padding: "12px 22px", border: 0, borderRadius: 9, background: "#1764b3", color: "white", cursor: "pointer" }}>
                      {busy === order.id ? "กำลังบันทึก..." : "บันทึกข้อมูลและสถานะ"}
                    </button>
                                         <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, display: "grid", gap: 10 }}>
                       <strong>เอกสารกรมธรรม์ PDF (Private Storage)</strong>
                       {order.policy_document_url ? (
                         <p style={{ color: "#15803d", margin: 0 }}>มีไฟล์กรมธรรม์ผูกกับรายการแล้ว — สมาชิกจะเปิดดูได้เมื่อเข้าสู่ระบบ</p>
                       ) : order.status === "policy_issued" && order.policy_number ? (
                         <>
                           <label>เลือกไฟล์กรมธรรม์ PDF ที่บริษัทประกันออกให้จริง
                             <input type="file" accept=".pdf,application/pdf"
                               onChange={(e) => setPolicyFiles((prev) => ({ ...prev, [order.id]: e.target.files?.[0] ?? null }))}
                               style={{ ...fieldStyle, marginTop: 6 }} />
                           </label>
                           <button disabled={busy !== null || !policyFiles[order.id]}
                             onClick={() => void uploadPolicy(order)}
                             style={{ justifySelf: "start", padding: "12px 20px", border: 0, borderRadius: 9, background: "#1764b3", color: "white", cursor: "pointer" }}>
                             {busy === order.id ? "กำลังอัปโหลด..." : "อัปโหลดกรมธรรม์ PDF"}
                           </button>
                         </>
                       ) : (
                         <small style={{ color: "#64748b" }}>อัปโหลดได้หลังบันทึกสถานะออกกรมธรรม์แล้วและเลขกรมธรรม์จริงเท่านั้น</small>
                       )}
                     </div>
{order.payment_confirmed_at && <small>ยืนยันการชำระเมื่อ: {new Date(order.payment_confirmed_at).toLocaleString("th-TH")}</small>}
                    {order.policy_issued_at && <small>ออกกรมธรรม์เมื่อ: {new Date(order.policy_issued_at).toLocaleString("th-TH")}</small>}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
        <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>ระบบติดตามภายในเท่านั้น การตอบรับใบเสนอราคาหรือเปลี่ยนสถานะไม่ได้ทำให้เกิดความคุ้มครองโดยอัตโนมัติ</p>
      </div>
    </main>
  );
}
