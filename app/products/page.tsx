"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/Lib/supabase";

type Company = { id: string; name: string; logo_url: string | null };
type Plan = {
  id: string;
  plan_name: string;
  insurance_type: string;
  premium_amount: number | null;
  price_period: string | null;
  coverage_summary: string | null;
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

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(amount);

const bangkokToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(() => searchParams.get("category") || "all");
  useEffect(() => { setCategory(searchParams.get("category") || "all"); }, [searchParams]);
  const [sort, setSort] = useState("newest");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const companies = Array.from(new Set(plans.map(p => p.insurance_companies?.name).filter((x): x is string => Boolean(x)))).sort((a,b) => a.localeCompare(b, "th"));
  const priceVerified = (p: Plan) => typeof p.premium_amount === "number" && Number.isFinite(p.premium_amount) && p.premium_amount > 0 && !!p.price_period && !!p.price_source_url && !!p.price_verified_at && !!p.price_valid_until && p.price_valid_until >= bangkokToday();
  const selectedPlans = plans.filter(p => selectedIds.includes(p.id));
  function toggleCompare(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }

  useEffect(() => {
    let active = true;
    async function loadPlans() {
      const { data, error } = await supabase
        .from("insurance_plans")
        .select(`
          id, plan_name, insurance_type, premium_amount, price_period,
          coverage_summary, price_source_url, price_verified_at, price_valid_until,
          promotion_name, promotion_description, discount_type, discount_value,
          promotion_start_date, promotion_end_date,
          insurance_companies (id, name, logo_url)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setErrorMessage(error.message);
      else setPlans((data ?? []) as unknown as Plan[]);
      setLoading(false);
    }
    void loadPlans();
    return () => { active = false; };
  }, []);

  const today = bangkokToday();
  const categories = Array.from(new Set(plans.map(p => p.insurance_type))).sort();
  const visiblePlans = plans.filter(p => (category === "all" || p.insurance_type === category) && (companyFilter === "all" || p.insurance_companies?.name === companyFilter) && (priceFilter === "all" || (priceFilter === "verified" ? priceVerified(p) : !priceVerified(p))) && [p.plan_name, p.insurance_type, p.insurance_companies?.name ?? "", p.coverage_summary ?? ""].some(value => value.toLocaleLowerCase("th-TH").includes(search.trim().toLocaleLowerCase("th-TH"))));
  if (sort === "company") visiblePlans.sort((a,b) => (a.insurance_companies?.name ?? "").localeCompare(b.insurance_companies?.name ?? "", "th"));
  if (sort === "name") visiblePlans.sort((a,b) => a.plan_name.localeCompare(b.plan_name, "th"));
  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18,
    padding: 24, boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
  };

  if (loading) return <main style={{ padding: 40 }}>กำลังโหลดแผนประกัน...</main>;

  return (
    <main style={{ minHeight: "100vh", background: "#f3f7fc", padding: "32px 18px", color: "#102b50" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#1764b3", textDecoration: "none", fontWeight: 600 }}>← กลับหน้าหลัก</Link>
        <header style={{ margin: "28px 0" }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>INSURE ONE</h1>
          <h2 style={{ fontSize: 24, margin: 0 }}>แผนประกันภัยและโปรโมชั่น</h2>
          <p style={{ color: "#64748b", lineHeight: 1.8 }}>
            เปรียบเทียบข้อมูลเบื้องต้นและส่งคำขอใบเสนอราคาเพื่อรับข้อเสนอที่เหมาะกับคุณ
          </p>
        </header>
        <section aria-label="ค้นหาและกรองแผนประกัน" style={{ display: "flex", gap: 12, flexWrap: "wrap", background: "white", borderRadius: 16, padding: 18, marginBottom: 24, border: "1px solid #dce6f1" }}>
          <label style={{ flex: "2 1 240px", fontSize: 13, fontWeight: 600 }}>ค้นหาแผนประกัน
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="ชื่อแผน บริษัท หรือความคุ้มครอง" style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 6 }} />
          </label>
          <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600 }}>ประเภทประกัน
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 6 }}>
              <option value="all">ทุกประเภท</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600 }}>บริษัทประกัน
            <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 6 }}>
              <option value="all">ทุกบริษัท</option>{companies.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600 }}>สถานะราคา
            <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 6 }}>
              <option value="all">ทั้งหมด</option><option value="verified">มีราคาอ้างอิงที่ยังไม่หมดอายุ</option><option value="quote">ต้องสอบถามราคา</option>
            </select>
          </label>
          <label style={{ flex: "1 1 150px", fontSize: 13, fontWeight: 600 }}>เรียงตาม
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginTop: 6 }}>
              <option value="newest">ล่าสุด</option><option value="company">ชื่อบริษัท</option><option value="name">ชื่อแผน</option>
            </select>
          </label>
        </section>
        {selectedPlans.length > 0 && <section aria-label="เปรียบเทียบแผนที่เลือก" style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: 16, padding: 18, marginBottom: 22 }}>
          <h2>เปรียบเทียบแผนที่เลือก ({selectedPlans.length}/3)</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead><tr><th style={{ textAlign: "left", padding: 10 }}>บริษัท / แผน</th><th style={{ textAlign: "left", padding: 10 }}>ประเภท</th><th style={{ textAlign: "left", padding: 10 }}>เบี้ยอ้างอิง</th><th style={{ textAlign: "left", padding: 10 }}>ความคุ้มครอง</th></tr></thead>
              <tbody>{selectedPlans.map(p => <tr key={p.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ padding: 10 }}>{p.insurance_companies?.name ?? "ไม่ระบุบริษัท"}<div>{p.plan_name}</div></td>
                <td style={{ padding: 10 }}>{p.insurance_type}</td>
                <td style={{ padding: 10 }}>{priceVerified(p) ? `฿${formatMoney(p.premium_amount!)} / ${p.price_period}` : "สอบถามราคา"}</td>
                <td style={{ padding: 10 }}>{p.coverage_summary || "สอบถามรายละเอียด"}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: "#64748b" }}>ข้อมูลสำหรับเปรียบเทียบเบื้องต้น ไม่ใช่การเสนอขายหรือยืนยันรับประกันภัย โปรดตรวจสอบเงื่อนไขฉบับเต็มกับบริษัทประกัน</p>
          <button type="button" onClick={() => setSelectedIds([])} style={{ border: "1px solid #cbd5e1", padding: "9px 16px", borderRadius: 8, background: "white", cursor: "pointer" }}>ล้างรายการเปรียบเทียบ</button>
        </section>}
        {!loading && !errorMessage && <p aria-live="polite" style={{ color: "#64748b" }}>พบ {visiblePlans.length} แผนประกัน</p>}
        {errorMessage && <div role="alert" style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: 16, borderRadius: 12, marginBottom: 20 }}>โหลดแผนประกันไม่สำเร็จ: {errorMessage}</div>}
        {!errorMessage && plans.length === 0 && (
          <section aria-label="ขอคำปรึกษาประกันภัย" style={{ background: "linear-gradient(135deg, #ffffff, #eaf3ff)", border: "1px solid #cbdff7", borderRadius: 18, padding: "32px 26px", margin: "18px 0 24px" }}>
            <div style={{ fontSize: 38, marginBottom: 12 }} aria-hidden="true">🛡️</div>
            <h2 style={{ fontSize: 24, margin: "0 0 12px" }}>ยังไม่มีแผนประกันที่ผ่านการตรวจสอบเพื่อเผยแพร่</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, maxWidth: 700 }}>
              คุณยังสามารถส่งคำขอคำปรึกษาหรือขอใบเสนอราคาได้ โดยเจ้าหน้าที่จะติดต่อกลับเพื่อสอบถามความต้องการ
              ทั้งนี้ การส่งคำขอไม่ใช่การยืนยันราคา การรับประกันภัย หรือการออกกรมธรรม์
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <Link href="/quote" style={{ background: "#1764b3", color: "#fff", padding: "14px 22px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>ขอใบเสนอราคา / คำปรึกษา</Link>
              <Link href="/register" style={{ border: "1px solid #1764b3", color: "#1764b3", padding: "14px 22px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>สมัครสมาชิกเพื่อส่งคำขอ</Link>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 18 }}>กรุณาอย่าส่งเลขบัตรประชาชน ข้อมูลสุขภาพ หรือข้อมูลการชำระเงินผ่านช่องรายละเอียดคำขอ</p>
          </section>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {visiblePlans.map((plan) => {
            const company = plan.insurance_companies;
            const validPrice =
              typeof plan.premium_amount === "number" && Number.isFinite(plan.premium_amount) &&
              plan.premium_amount > 0 && !!plan.price_period && !!plan.price_source_url &&
              !!plan.price_verified_at && !!plan.price_valid_until && plan.price_valid_until >= today;
            const basePrice = validPrice ? plan.premium_amount! : null;
            const promotionActive =
              basePrice !== null && !!plan.promotion_name?.trim() &&
              (plan.discount_type === "percent" || plan.discount_type === "fixed") &&
              typeof plan.discount_value === "number" && Number.isFinite(plan.discount_value) &&
              plan.discount_value > 0 &&
              (plan.discount_type !== "percent" || plan.discount_value <= 100) &&
              !!plan.promotion_start_date && !!plan.promotion_end_date &&
              plan.promotion_start_date <= today && plan.promotion_end_date >= today &&
              plan.promotion_start_date <= plan.promotion_end_date;
            const discount = promotionActive && basePrice !== null
              ? Math.min(basePrice, plan.discount_type === "percent"
                  ? basePrice * plan.discount_value! / 100 : plan.discount_value!)
              : 0;
            const finalPrice = basePrice === null ? null : Math.max(0, basePrice - discount);
            const params = new URLSearchParams({ company: company?.name ?? "", plan: plan.plan_name });
            return (
              <article key={plan.id} style={cardStyle}>
                <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: "#f8fafc", borderRadius: 12 }}>
                  {company?.logo_url ? (
                    <img src={company.logo_url} alt={`โลโก้ ${company.name}`} style={{ maxWidth: "85%", maxHeight: 70, objectFit: "contain" }} />
                  ) : <span style={{ fontSize: 34 }}>🛡️</span>}
                </div>
                <h3 style={{ fontSize: 19, marginBottom: 8 }}>{company?.name ?? "บริษัทประกันภัย"}</h3>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>{plan.plan_name}</p>
                <p style={{ fontSize: 14, color: "#64748b" }}>ประเภท: {plan.insurance_type}</p>
                {plan.coverage_summary && <p style={{ fontSize: 14, lineHeight: 1.7 }}>{plan.coverage_summary}</p>}
                <div style={{ background: "#eff6ff", borderRadius: 12, padding: 16, margin: "18px 0" }}>
                  {basePrice !== null && finalPrice !== null ? (
                    <>
                      {promotionActive && (
                        <div style={{ marginBottom: 12, background: "#ecfdf5", padding: 12, borderRadius: 10, color: "#166534" }}>
                          <strong>🎁 {plan.promotion_name}</strong>
                          {plan.promotion_description && <p style={{ fontSize: 13, margin: "6px 0" }}>{plan.promotion_description}</p>}
                          <div style={{ fontSize: 13 }}>
                            ส่วนลด {plan.discount_type === "percent" ? `${formatMoney(plan.discount_value!)}%` : `฿${formatMoney(plan.discount_value!)}`}
                          </div>
                          <div style={{ fontSize: 12, marginTop: 5 }}>โปรโมชั่นถึงวันที่ {plan.promotion_end_date}</div>
                        </div>
                      )}
                      {promotionActive && <div style={{ color: "#64748b", textDecoration: "line-through", fontSize: 15 }}>฿{formatMoney(basePrice)}</div>}
                      <div style={{ fontSize: 27, fontWeight: 700, color: "#1556a2" }}>฿{formatMoney(finalPrice)}</div>
                      <div style={{ fontSize: 13 }}>{plan.price_period} {promotionActive ? "· ราคาประมาณการหลังส่วนลด" : "· ราคาอ้างอิง"}</div>
                      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>ราคาอ้างอิงถึงวันที่ {plan.price_valid_until}</div>
                      <a href={plan.price_source_url!} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#1764b3" }}>ดูแหล่งอ้างอิงราคา</a>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 23, fontWeight: 700, color: "#1556a2" }}>สอบถามราคา</div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>เบี้ยประกันขึ้นอยู่กับข้อมูลและเงื่อนไขของผู้ขอเอาประกัน</div>
                    </>
                  )}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedIds.includes(plan.id)} disabled={!selectedIds.includes(plan.id) && selectedIds.length >= 3} onChange={() => toggleCompare(plan.id)} />
                  เพิ่มลงตารางเปรียบเทียบ (สูงสุด 3 แผน)
                </label>
                <Link href={`/quote?${params.toString()}`} style={{ display: "block", textAlign: "center", background: "#1764b3", color: "white", padding: "13px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>ขอใบเสนอราคา</Link>
              </article>
            );
          })}
        </div>
        {!errorMessage && plans.length > 0 && visiblePlans.length === 0 && <p>ไม่พบแผนที่ตรงกับคำค้นหา ลองเปลี่ยนคำค้นหาหรือเลือกทุกประเภท</p>}
        <p style={{ marginTop: 28, color: "#64748b", fontSize: 13, lineHeight: 1.8 }}>
          หมายเหตุ: ราคาและโปรโมชั่นที่แสดงเป็นข้อมูลอ้างอิง ไม่ใช่ข้อเสนอรับประกันภัยที่มีผลผูกพัน
          ยอดที่ต้องชำระจริงต้องได้รับการยืนยันจากบริษัทประกันหรือช่องทางที่ได้รับอนุญาตก่อนเสมอ
        </p>
      </div>
    </main>
  );
}

export default function ProductsPage() { return <Suspense fallback={<main style={{padding:40}}>กำลังโหลดแผนประกัน...</main>}><ProductsContent /></Suspense>; }
