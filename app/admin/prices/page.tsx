"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/Lib/supabase";

type Company = { name: string };
type Plan = {
  id: string;
  plan_name: string;
  insurance_type: string;
  premium_amount: number | null;
  price_period: string | null;
  price_source_url: string | null;
  price_verified_at: string | null;
  price_valid_until: string | null;
  promotion_name: string | null;
  promotion_description: string | null;
  discount_type: "percent" | "fixed" | null;
  discount_value: number | null;
  promotion_start_date: string | null;
  promotion_end_date: string | null;
  insurance_companies: Company | null;
};

type EditableField = Exclude<keyof Plan, "id" | "insurance_companies" | "plan_name" | "insurance_type">;

const inputStyle: CSSProperties = {
  width: "100%", padding: 11, border: "1px solid #cfdae8", borderRadius: 9,
  fontSize: 14, marginTop: 6, boxSizing: "border-box", color: "#15304c", background: "white",
};
const cardStyle: CSSProperties = {
  background: "white", border: "1px solid #e0e8f2", borderRadius: 16,
  padding: 22, boxShadow: "0 3px 14px rgba(20,45,70,.04)",
};
const gridStyle: CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16,
};
const money = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const todayBangkok = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

function getDiscount(plan: Plan) {
  const amount = plan.premium_amount;
  const value = plan.discount_value ?? 0;
  if (amount === null || !Number.isFinite(amount) || amount <= 0 || !plan.discount_type || !plan.promotion_name?.trim()) return null;
  if (!plan.promotion_start_date || !plan.promotion_end_date) return null;
  const today = todayBangkok();
  if (today < plan.promotion_start_date || today > plan.promotion_end_date) return null;
  if (plan.price_valid_until && plan.price_valid_until < today) return null;
  const discount = plan.discount_type === "percent" ? amount * value / 100 : value;
  return { discount, final: Math.max(0, amount - discount) };
}

export default function AdminPricesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !auth.user) {
          window.location.replace("/login");
          return;
        }
        const { data: admin, error: adminError } = await supabase.from("admin_users")
          .select("user_id").eq("user_id", auth.user.id).maybeSingle();
        if (!active) return;
        if (adminError || !admin) {
          setMessage("บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบ Admin");
          return;
        }
        setAuthorized(true);
        const { data, error } = await supabase.from("insurance_plans")
          .select(`id,plan_name,insurance_type,premium_amount,price_period,price_source_url,price_verified_at,price_valid_until,promotion_name,promotion_description,discount_type,discount_value,promotion_start_date,promotion_end_date,insurance_companies(name)`)
          .order("created_at", { ascending: false });
        if (!active) return;
        if (error) setMessage("โหลดข้อมูลไม่สำเร็จ: " + error.message);
        else setPlans((data ?? []) as unknown as Plan[]);
      } catch (e) {
        if (active) setMessage("เกิดข้อผิดพลาดขณะโหลดข้อมูล: " + String(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  function editPlan(id: string, field: EditableField, value: string | number | null) {
    setPlans(old => old.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  async function savePlan(plan: Plan) {
    setMessage("");
    const amount = plan.premium_amount;
    if (amount !== null && (!Number.isFinite(amount) || amount <= 0)) {
      setMessage("กรุณากรอกราคาเบี้ยประกันให้มากกว่า 0 บาท"); return;
    }
    if (amount !== null) {
      if (!plan.price_period || !plan.price_source_url?.trim() || !plan.price_valid_until) {
        setMessage("กรุณากรอกรอบชำระ แหล่งอ้างอิง และวันหมดอายุราคาให้ครบ"); return;
      }
      try {
        const url = new URL(plan.price_source_url);
        if (url.protocol !== "https:") throw new Error("HTTPS required");
      } catch { setMessage("ลิงก์อ้างอิงราคาต้องเป็น URL แบบ https:// ที่ถูกต้อง"); return; }
      if (plan.price_valid_until < todayBangkok()) {
        setMessage("วันหมดอายุราคาต้องไม่เป็นวันที่ผ่านมาแล้ว"); return;
      }
    }

    const hasPromotion = Boolean(plan.promotion_name?.trim() || plan.promotion_description?.trim() || plan.discount_type || (plan.discount_value ?? 0) > 0 || plan.promotion_start_date || plan.promotion_end_date);
    const discountValue = plan.discount_value ?? 0;
    if (hasPromotion) {
      if (amount === null) { setMessage("ต้องบันทึกราคาเบี้ยประกันที่ตรวจสอบแล้วก่อนใช้โปรโมชั่น"); return; }
      if (!plan.promotion_name?.trim() || !plan.discount_type || !plan.promotion_start_date || !plan.promotion_end_date) {
        setMessage("กรุณากรอกชื่อโปรโมชั่น ประเภทส่วนลด และช่วงวันที่ให้ครบ"); return;
      }
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        setMessage("ส่วนลดต้องมากกว่า 0"); return;
      }
      if (plan.discount_type === "percent" && discountValue > 100) {
        setMessage("ส่วนลดแบบเปอร์เซ็นต์ต้องไม่เกิน 100%"); return;
      }
      if (plan.discount_type === "fixed" && discountValue > amount) {
        setMessage("ส่วนลดแบบจำนวนเงินต้องไม่เกินราคาเบี้ยประกัน"); return;
      }
      if (plan.promotion_start_date > plan.promotion_end_date) {
        setMessage("วันที่เริ่มโปรโมชั่นต้องไม่เกินวันสิ้นสุด"); return;
      }
      if (plan.price_valid_until && plan.promotion_end_date > plan.price_valid_until) {
        setMessage("วันสิ้นสุดโปรโมชั่นต้องไม่เกินวันหมดอายุราคาที่ตรวจสอบแล้ว"); return;
      }
    }
    setSavingId(plan.id);
    try {
      const { data, error } = await supabase.from("insurance_plans")
        .update({
          premium_amount: amount,
          price_period: amount === null ? null : plan.price_period,
          price_source_url: amount === null ? null : plan.price_source_url?.trim(),
          price_valid_until: amount === null ? null : plan.price_valid_until,
          price_verified_at: amount === null ? null : new Date().toISOString(),
          promotion_name: hasPromotion ? plan.promotion_name?.trim() : null,
          promotion_description: hasPromotion ? plan.promotion_description?.trim() || null : null,
          discount_type: hasPromotion ? plan.discount_type : null,
          discount_value: hasPromotion ? discountValue : 0,
          promotion_start_date: hasPromotion ? plan.promotion_start_date : null,
          promotion_end_date: hasPromotion ? plan.promotion_end_date : null,
        })
        .eq("id", plan.id)
        .select("id,price_verified_at")
        .single();
      if (error) setMessage("บันทึกไม่สำเร็จ: " + error.message);
      else {
        editPlan(plan.id, "price_verified_at", data.price_verified_at);
        setMessage("บันทึกราคาและโปรโมชั่นเรียบร้อยแล้ว: " + (plan.insurance_companies?.name ?? plan.plan_name));
      }
    } catch (e) {
      setMessage("เกิดข้อผิดพลาดขณะบันทึก: " + String(e));
    } finally { setSavingId(null); }
  }

  if (loading) return <main style={{ padding: 35 }}>กำลังโหลดข้อมูล...</main>;
  if (!authorized) return <main style={{ padding: 35 }}><h1>ไม่สามารถเข้าถึงหน้านี้ได้</h1><p>{message}</p><Link href="/login">เข้าสู่ระบบ</Link></main>;

  return <main style={{ minHeight: "100vh", background: "#f3f7fc", padding: "30px 16px", color: "#142c48" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Link href="/admin" style={{ color: "#1764b3", fontWeight: 600, textDecoration: "none" }}>← กลับหน้า Admin</Link>
      <header style={{ margin: "26px 0" }}>
        <h1 style={{ fontSize: 30, margin: "0 0 8px" }}>INSURE ONE</h1>
        <h2 style={{ fontSize: 23, margin: 0 }}>จัดการราคาและโปรโมชั่น</h2>
        <p style={{ color: "#64748b", lineHeight: 1.7 }}>บันทึกราคาและโปรโมชั่นจากแหล่งที่ตรวจสอบได้เท่านั้น ข้อมูลส่วนลดจะยังไม่แสดงบนหน้าลูกค้าจนกว่าจะพัฒนาหน้าแสดงผล</p>
      </header>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={cardStyle}><span>จำนวนแผนประกัน</span><strong style={{ display: "block", fontSize: 28 }}>{plans.length}</strong></div>
        <div style={cardStyle}><span>แผนที่มีราคา</span><strong style={{ display: "block", fontSize: 28 }}>{plans.filter(p => p.premium_amount !== null).length}</strong></div>
        <div style={cardStyle}><span>โปรโมชั่นที่อยู่ในช่วงวันที่กำหนด</span><strong style={{ display: "block", fontSize: 28 }}>{plans.filter(p => getDiscount(p) !== null).length}</strong></div>
      </div>
      {message && <div role="status" style={{ padding: 15, marginBottom: 18, background: "#eaf3ff", border: "1px solid #bcd8fa", borderRadius: 10 }}>{message}</div>}
      {plans.length === 0 && <p>ยังไม่มีแผนประกันในระบบ หรือไม่มีสิทธิ์อ่านข้อมูล</p>}
      <div style={{ display: "grid", gap: 20 }}>
        {plans.map(plan => {
          const calculated = getDiscount(plan);
          return <section key={plan.id} style={cardStyle}>
            <h3 style={{ fontSize: 21, margin: "0 0 5px" }}>{plan.insurance_companies?.name ?? "ไม่ทราบบริษัท"}</h3>
            <p style={{ color: "#64748b", margin: "0 0 20px" }}>{plan.plan_name} · {plan.insurance_type}</p>
            <h4 style={{ margin: "0 0 12px" }}>ราคาเบี้ยประกัน</h4>
            <div style={gridStyle}>
              <label>ราคาเบี้ยประกัน (บาท)<input type="number" min="0.01" step="0.01" value={plan.premium_amount ?? ""} onChange={e => editPlan(plan.id, "premium_amount", e.target.value === "" ? null : Number(e.target.value))} placeholder="ระบุราคาที่ได้รับการยืนยัน" style={inputStyle} /></label>
              <label>รอบชำระเบี้ย<select value={plan.price_period ?? ""} onChange={e => editPlan(plan.id, "price_period", e.target.value || null)} style={inputStyle}><option value="">เลือกรอบชำระ</option><option value="รายปี">รายปี</option><option value="รายเดือน">รายเดือน</option><option value="ครั้งเดียว">ครั้งเดียว</option></select></label>
              <label>URL แหล่งอ้างอิงราคา<input type="url" value={plan.price_source_url ?? ""} onChange={e => editPlan(plan.id, "price_source_url", e.target.value)} placeholder="https://..." style={inputStyle} /></label>
              <label>ราคามีผลถึงวันที่<input type="date" value={plan.price_valid_until ?? ""} onChange={e => editPlan(plan.id, "price_valid_until", e.target.value || null)} style={inputStyle} /></label>
            </div>
            <h4 style={{ margin: "26px 0 12px", paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>โปรโมชั่นและส่วนลด</h4>
            <div style={gridStyle}>
              <label>ชื่อโปรโมชั่น<input type="text" value={plan.promotion_name ?? ""} onChange={e => editPlan(plan.id, "promotion_name", e.target.value)} placeholder="ชื่อโปรโมชั่นที่ได้รับการยืนยัน" style={inputStyle} /></label>
              <label>ประเภทส่วนลด<select value={plan.discount_type ?? ""} onChange={e => editPlan(plan.id, "discount_type", e.target.value || null)} style={inputStyle}><option value="">ไม่มีส่วนลด</option><option value="percent">เปอร์เซ็นต์ (%)</option><option value="fixed">จำนวนเงิน (บาท)</option></select></label>
              <label>มูลค่าส่วนลด<input type="number" min="0" step="0.01" value={plan.discount_value ?? 0} onChange={e => editPlan(plan.id, "discount_value", e.target.value === "" ? 0 : Number(e.target.value))} style={inputStyle} /></label>
              <label>เริ่มโปรโมชั่น<input type="date" value={plan.promotion_start_date ?? ""} onChange={e => editPlan(plan.id, "promotion_start_date", e.target.value || null)} style={inputStyle} /></label>
              <label>สิ้นสุดโปรโมชั่น<input type="date" value={plan.promotion_end_date ?? ""} onChange={e => editPlan(plan.id, "promotion_end_date", e.target.value || null)} style={inputStyle} /></label>
              <label style={{ gridColumn: "1 / -1" }}>รายละเอียดและเงื่อนไขโปรโมชั่น<textarea rows={3} value={plan.promotion_description ?? ""} onChange={e => editPlan(plan.id, "promotion_description", e.target.value)} placeholder="รายละเอียด เงื่อนไข ข้อยกเว้น และแหล่งที่ยืนยันโปรโมชั่น" style={{ ...inputStyle, resize: "vertical" }} /></label>
            </div>
            <div style={{ background: "#f0f6ff", borderRadius: 12, padding: 16, marginTop: 18 }}>
              {calculated ? <><div>เบี้ยก่อนส่วนลด: ฿{money(plan.premium_amount!)}</div><div>ส่วนลด: −฿{money(calculated.discount)}</div><strong style={{ fontSize: 20 }}>ยอดหลังส่วนลด (ตัวอย่าง): ฿{money(calculated.final)}</strong></> : <span style={{ color: "#53677f" }}>ยังไม่มีโปรโมชั่นที่ใช้งานได้ในวันนี้ หรือยังไม่ครบเงื่อนไขสำหรับคำนวณส่วนลด</span>}
              <p style={{ margin: "9px 0 0", fontSize: 12, color: "#64748b" }}>ยอดนี้เป็นเพียงการคำนวณจากข้อมูลที่กรอก ไม่ใช่การยืนยันยอดเรียกเก็บจริง และอาจไม่รวมภาษีหรืออากรที่เกี่ยวข้อง</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginTop: 20 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>{plan.price_verified_at ? "บันทึกข้อมูลราคาล่าสุด: " + new Date(plan.price_verified_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : "ยังไม่มีข้อมูลการบันทึกราคา"}</span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" disabled={savingId !== null} onClick={() => { setPlans(old => old.map(p => p.id === plan.id ? { ...p, promotion_name: null, promotion_description: null, discount_type: null, discount_value: 0, promotion_start_date: null, promotion_end_date: null } : p)); setMessage("ล้างช่องโปรโมชั่นแล้ว กรุณากดบันทึกเพื่อยืนยันการเปลี่ยนแปลง"); }} style={{ padding: "11px 16px", borderRadius: 9, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>ล้างโปรโมชั่น</button>
                <button type="button" disabled={savingId !== null} onClick={() => void savePlan(plan)} style={{ padding: "11px 23px", borderRadius: 9, border: 0, background: "#1764b3", color: "white", fontWeight: 700, cursor: "pointer", opacity: savingId !== null ? .6 : 1 }}>{savingId === plan.id ? "กำลังบันทึก..." : "บันทึกราคาและโปรโมชั่น"}</button>
              </div>
            </div>
          </section>;
        })}
      </div>
    </div>
  </main>;
}
