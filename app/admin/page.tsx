"use client";

import { useEffect, useState } from "react";
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
type Offer = {
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
};
type OfferForm = {
  company_name: string;
  plan_name: string;
  premium_amount: string;
  price_period: string;
  coverage_details: string;
  terms_and_conditions: string;
  valid_until: string;
};
const statusOptions = [
  { value: "pending", label: "รอตรวจสอบ" },
  { value: "reviewing", label: "กำลังตรวจสอบ" },
  { value: "completed", label: "ดำเนินการเสร็จสิ้น" },
  { value: "cancelled", label: "ยกเลิก" },
];
const statusColors: Record<string, string> = {
  pending: "#b45309", reviewing: "#2563eb", completed: "#15803d", cancelled: "#b91c1c",
};
function getQuoteDetails(details: string | null) {
  const value = details ?? "";
  const company = value.match(/^บริษัทประกันที่สนใจ:\s*(.*)$/m)?.[1]?.trim() ?? "";
  const plan = value.match(/^แผนประกันที่สนใจ:\s*(.*)$/m)?.[1]?.trim() ?? "";
  const extra = value.match(/^รายละเอียดเพิ่มเติม:\s*([\s\S]*)$/m)?.[1]?.trim() ?? (!company && !plan ? value.trim() : "");
  return { company, plan, extra };
}
function blankForm(quote: Quote): OfferForm {
  const info = getQuoteDetails(quote.details);
  return {
    company_name: info.company,
    plan_name: info.plan,
    premium_amount: "",
    price_period: "รายปี",
    coverage_details: "",
    terms_and_conditions: "",
    valid_until: "",
  };
}
const inputStyle: React.CSSProperties = {
  width: "100%", padding: 11, border: "1px solid #cbd5e1", borderRadius: 9,
  boxSizing: "border-box", fontSize: 14, background: "white", color: "#102b50", marginTop: 6,
};
const fieldStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600 };

export default function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer>>({});
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferForm | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !auth.user) { window.location.replace("/login"); return; }
        setCurrentUserId(auth.user.id);
        const { data: admin, error: adminError } = await supabase.from("admin_users")
          .select("user_id").eq("user_id", auth.user.id).maybeSingle();
        if (!active) return;
        if (adminError || !admin) { setMessage(adminError?.message ?? "บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้า Admin"); return; }
        setAuthorized(true);
        const [quoteResult, offerResult] = await Promise.all([
          supabase.from("quote_requests")
            .select("id, contact_name, contact_info, insurance_type, details, status, created_at")
            .order("created_at", { ascending: false }),
          supabase.from("insurance_offers")
            .select("id, quote_id, company_name, plan_name, premium_amount, price_period, coverage_details, terms_and_conditions, valid_until, status"),
        ]);
        if (!active) return;
        if (quoteResult.error) { setMessage("โหลดคำขอไม่สำเร็จ: " + quoteResult.error.message); return; }
        if (offerResult.error) { setMessage("โหลดใบเสนอราคาไม่สำเร็จ: " + offerResult.error.message); }
        setQuotes((quoteResult.data ?? []) as Quote[]);
        const byQuote: Record<string, Offer> = {};
        for (const offer of (offerResult.data ?? []) as Offer[]) byQuote[offer.quote_id] = offer;
        setOffers(byQuote);
      } catch { if (active) setMessage("ไม่สามารถเชื่อมต่อ Supabase ได้"); }
      finally { if (active) setLoading(false); }
    }
    void loadData();
    return () => { active = false; };
  }, []);

  async function updateStatus(id: string, status: string) {
    if (!authorized || savingId || !statusOptions.some(x => x.value === status)) return;
    setSavingId(id); setMessage("");
    try {
      const { data, error } = await supabase.from("quote_requests").update({ status })
        .eq("id", id).select("id, status").single();
      if (error) throw error;
      setQuotes(old => old.map(q => q.id === data.id ? { ...q, status: data.status } : q));
      setMessage("บันทึกสถานะคำขอเรียบร้อยแล้ว");
    } catch (error) {
      setMessage("เปลี่ยนสถานะไม่สำเร็จ: " + (error instanceof Error ? error.message : "โปรดลองใหม่"));
    } finally { setSavingId(null); }
  }

  function openOffer(quote: Quote) {
    const offer = offers[quote.id];
    setEditingId(quote.id);
    setForm(offer ? {
      company_name: offer.company_name, plan_name: offer.plan_name,
      premium_amount: String(offer.premium_amount), price_period: offer.price_period,
      coverage_details: offer.coverage_details,
      terms_and_conditions: offer.terms_and_conditions ?? "", valid_until: offer.valid_until,
    } : blankForm(quote));
    setMessage("");
  }
  function changeField(key: keyof OfferForm, value: string) {
    setForm(previous => previous ? { ...previous, [key]: value } : previous);
  }

  async function saveOffer(quoteId: string, publish: boolean) {
    if (!authorized || savingId || !form || !currentUserId) return;
    const amount = Number(form.premium_amount);
    if (!form.company_name.trim() || !form.plan_name.trim() || !form.price_period.trim() ||
        !form.coverage_details.trim() || !form.valid_until || !form.premium_amount.trim() ||
        !Number.isFinite(amount) || amount <= 0) {
      setMessage("กรุณากรอกบริษัท แผนประกัน เบี้ยประกัน รอบชำระ ความคุ้มครอง และวันหมดอายุให้ครบ");
      return;
    }
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
    if (form.valid_until < today) { setMessage("วันหมดอายุใบเสนอราคาต้องไม่เป็นวันที่ผ่านมาแล้ว"); return; }
    if (publish && !window.confirm("ยืนยันว่าราคาและเงื่อนไขนี้ได้รับการตรวจสอบแล้ว และต้องการส่งให้สมาชิกเห็น?")) return;
    const existing = offers[quoteId];
    if (existing && ["accepted", "declined", "expired"].includes(existing.status)) {
      setMessage("ใบเสนอราคาที่ตอบรับ ปฏิเสธ หรือหมดอายุแล้วไม่ควรแก้ไข โปรดสร้างขั้นตอนออกข้อเสนอใหม่ในภายหลัง");
      return;
    }
    setSavingId(quoteId); setMessage("");
    const payload = {
      company_name: form.company_name.trim(), plan_name: form.plan_name.trim(),
      premium_amount: amount, price_period: form.price_period.trim(),
      coverage_details: form.coverage_details.trim(),
      terms_and_conditions: form.terms_and_conditions.trim() || null,
      valid_until: form.valid_until, status: publish ? "sent" : "draft",
    };
    try {
      const result = existing
        ? await supabase.from("insurance_offers").update(payload).eq("id", existing.id)
            .select("id, quote_id, company_name, plan_name, premium_amount, price_period, coverage_details, terms_and_conditions, valid_until, status").single()
        : await supabase.from("insurance_offers").insert({ ...payload, quote_id: quoteId, created_by: currentUserId })
            .select("id, quote_id, company_name, plan_name, premium_amount, price_period, coverage_details, terms_and_conditions, valid_until, status").single();
      if (result.error) throw result.error;
      setOffers(previous => ({ ...previous, [quoteId]: result.data as Offer }));
      setEditingId(null); setForm(null);
      setMessage(publish ? "ส่งใบเสนอราคาเรียบร้อยแล้ว (สมาชิกจะเห็นเมื่อเพิ่มหน้าแสดงข้อเสนอ)" : "บันทึกฉบับร่างเรียบร้อยแล้ว");
    } catch (error) {
      setMessage("บันทึกใบเสนอราคาไม่สำเร็จ: " + (error instanceof Error ? error.message : "โปรดลองใหม่"));
    } finally { setSavingId(null); }
  }

  const counts = {
    pending: quotes.filter(q => q.status === "pending").length,
    reviewing: quotes.filter(q => q.status === "reviewing").length,
    completed: quotes.filter(q => q.status === "completed").length,
    cancelled: quotes.filter(q => q.status === "cancelled").length,
  };
  const filtered = quotes.filter(q => {
    const info = getQuoteDetails(q.details);
    return (statusFilter === "all" || q.status === statusFilter) &&
      [q.contact_name, q.contact_info, q.insurance_type, q.details ?? "", info.company, info.plan]
        .join(" ").toLowerCase().includes(search.trim().toLowerCase());
  });
  if (loading) return <main style={{ padding: 32 }}>กำลังโหลดข้อมูลแอดมิน...</main>;
  if (!authorized) return <main style={{ padding: 32 }}><h1>ไม่สามารถเข้าถึงหน้า Admin</h1><p>{message}</p><Link href="/member">กลับหน้าสมาชิก</Link></main>;

  return <main style={{ maxWidth: 1150, margin: "0 auto", padding: "32px 20px", color: "#102b50", fontFamily: "Arial, sans-serif" }}>
    <header style={{ marginBottom: 28 }}>
      <Link href="/member">← กลับหน้าสมาชิก</Link>
      <h1>INSURE ONE | Admin Dashboard</h1>
      <p style={{ color: "#64748b" }}>จัดการคำขอและสร้างใบเสนอราคาสำหรับสมาชิก</p>
      <Link href="/admin/prices" style={{ color: "#1764b3", fontWeight: 600 }}>จัดการราคาและโปรโมชั่น →</Link>
    </header>
    <section style={{ background: "linear-gradient(120deg, #102d50, #2563a6)", color: "white", borderRadius: 18, padding: 28, marginBottom: 24 }}>
      <p style={{ margin: 0 }}>ภาพรวมคำขอใบเสนอราคา</p>
      <h2 style={{ fontSize: 34, margin: "10px 0" }}>{quotes.length} รายการ</h2>
      <p style={{ marginBottom: 0 }}>ข้อมูลคำขอจาก Supabase</p>
    </section>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 26 }}>
      {statusOptions.map(option => <div key={option.value} style={{ background: "white", border: "1px solid #d8e3ef", borderRadius: 14, padding: 20 }}>
        <p style={{ marginTop: 0 }}>{option.label}</p>
        <strong style={{ fontSize: 30, color: statusColors[option.value] }}>{counts[option.value as keyof typeof counts]}</strong>
      </div>)}
    </section>
    <section style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
      <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ บริษัท หรือประเภทประกัน..." aria-label="ค้นหาคำขอ" style={{ flex: "1 1 260px", padding: 13, border: "1px solid #ccd8e8", borderRadius: 10 }} />
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="กรองสถานะคำขอ" style={{ padding: 13, border: "1px solid #ccd8e8", borderRadius: 10 }}>
        <option value="all">ทุกสถานะ</option>
        {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </section>
    {message && <p role="status" aria-live="polite" style={{ padding: 14, background: "#eaf3ff", borderRadius: 10, marginBottom: 20 }}>{message}</p>}
    {filtered.length === 0 ? <p>ไม่พบคำขอที่ตรงกับเงื่อนไข</p> : <div style={{ display: "grid", gap: 16 }}>
      {filtered.map(quote => {
        const info = getQuoteDetails(quote.details);
        const offer = offers[quote.id];
        const isEditing = editingId === quote.id && form !== null;
        return <article key={quote.id} style={{ background: "white", padding: 24, border: "1px solid #d8e3ef", borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ marginTop: 0 }}>{quote.insurance_type}</h3>
            <strong style={{ color: statusColors[quote.status] ?? "#64748b" }}>{statusOptions.find(o => o.value === quote.status)?.label ?? quote.status}</strong>
          </div>
          {info.company && <p><strong>บริษัทประกันที่สนใจ:</strong> {info.company}</p>}
          {info.plan && <p><strong>แผนประกัน:</strong> {info.plan}</p>}
          <p><strong>ผู้ติดต่อ:</strong> {quote.contact_name}</p>
          <p><strong>ข้อมูลติดต่อ:</strong> {quote.contact_info}</p>
          {info.extra && <div style={{ background: "#f4f7fb", padding: 14, borderRadius: 10, marginBottom: 16 }}><strong>รายละเอียดเพิ่มเติม</strong><p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{info.extra}</p></div>}
          <p style={{ color: "#64748b" }}>วันที่ส่ง: {new Date(quote.created_at).toLocaleString("th-TH")}</p>
          <label><strong>เปลี่ยนสถานะคำขอ: </strong>{" "}
            <select value={quote.status} disabled={savingId !== null} onChange={e => void updateStatus(quote.id, e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccd8e8" }}>
              {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 22, paddingTop: 18 }}>
            <p style={{ fontWeight: 700, marginTop: 0 }}>ใบเสนอราคา: {offer ? ({ draft: "ฉบับร่าง", sent: "ส่งให้สมาชิกแล้ว", accepted: "ลูกค้าตอบรับ", declined: "ลูกค้าปฏิเสธ", expired: "หมดอายุ" } as Record<string, string>)[offer.status] ?? offer.status : "ยังไม่ได้สร้าง"}</p>
            {offer && <p style={{ fontSize: 14, color: "#475569" }}>เบี้ยประกัน ฿{Number(offer.premium_amount).toLocaleString("th-TH")} / {offer.price_period} · ใช้ได้ถึง {offer.valid_until}</p>}
            {!isEditing && <button type="button" disabled={savingId !== null || Boolean(offer && ["accepted", "declined", "expired"].includes(offer.status))} onClick={() => openOffer(quote)} style={{ background: "#1764b3", color: "white", border: 0, borderRadius: 9, padding: "11px 18px", fontWeight: 600, cursor: "pointer" }}>
              {offer ? "แก้ไขใบเสนอราคา" : "+ สร้างใบเสนอราคา"}
            </button>}
            {isEditing && <div style={{ background: "#f8fbff", padding: 18, borderRadius: 12, marginTop: 14, border: "1px solid #d8e3ef" }}>
              <h4 style={{ marginTop: 0 }}>ข้อมูลใบเสนอราคา</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <label style={fieldStyle}>บริษัทประกัน<input style={inputStyle} value={form.company_name} onChange={e => changeField("company_name", e.target.value)} /></label>
                <label style={fieldStyle}>ชื่อแผนประกัน<input style={inputStyle} value={form.plan_name} onChange={e => changeField("plan_name", e.target.value)} /></label>
                <label style={fieldStyle}>เบี้ยประกัน (บาท)<input type="number" min="0.01" step="0.01" style={inputStyle} value={form.premium_amount} onChange={e => changeField("premium_amount", e.target.value)} /></label>
                <label style={fieldStyle}>รอบชำระ<select style={inputStyle} value={form.price_period} onChange={e => changeField("price_period", e.target.value)}><option value="รายปี">รายปี</option><option value="รายเดือน">รายเดือน</option><option value="ครั้งเดียว">ครั้งเดียว</option></select></label>
                <label style={fieldStyle}>ใบเสนอราคามีผลถึงวันที่<input type="date" style={inputStyle} value={form.valid_until} onChange={e => changeField("valid_until", e.target.value)} /></label>
              </div>
              <label style={{ ...fieldStyle, marginTop: 14 }}>รายละเอียดความคุ้มครอง<textarea rows={4} style={inputStyle} value={form.coverage_details} onChange={e => changeField("coverage_details", e.target.value)} /></label>
              <label style={{ ...fieldStyle, marginTop: 14 }}>เงื่อนไขและข้อยกเว้น<textarea rows={3} style={inputStyle} value={form.terms_and_conditions} onChange={e => changeField("terms_and_conditions", e.target.value)} /></label>
              <p style={{ color: "#92400e", fontSize: 13 }}>กรอกเฉพาะราคาและเงื่อนไขที่ตรวจสอบแล้ว การส่งใบเสนอราคาไม่ใช่การยืนยันความคุ้มครองหรือออกกรมธรรม์</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" disabled={savingId !== null} onClick={() => void saveOffer(quote.id, false)} style={{ padding: "11px 16px", borderRadius: 9, border: "1px solid #1764b3", color: "#1764b3", background: "white", cursor: "pointer" }}>บันทึกฉบับร่าง</button>
                <button type="button" disabled={savingId !== null} onClick={() => void saveOffer(quote.id, true)} style={{ padding: "11px 16px", borderRadius: 9, border: 0, background: "#15803d", color: "white", fontWeight: 700, cursor: "pointer" }}>ยืนยันและส่งให้สมาชิก</button>
                <button type="button" disabled={savingId !== null} onClick={() => { setEditingId(null); setForm(null); }} style={{ padding: "11px 16px", borderRadius: 9, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>ยกเลิก</button>
              </div>
            </div>}
          </div>
        </article>;
      })}
    </div>}
    <p style={{ marginTop: 30, fontSize: 13, color: "#64748b" }}>โปรดจำกัดการเข้าถึงข้อมูลลูกค้าเฉพาะผู้มีสิทธิ์ และใช้ข้อมูลใบเสนอราคาที่ได้รับการยืนยันเท่านั้น</p>
  </main>;
}
