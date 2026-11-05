"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import "./products.css";
import { officialInsuranceProducts } from "@/lib/insurance/official-public-catalog";
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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const companies = Array.from(new Set([...plans.map(p => p.insurance_companies?.name), ...officialInsuranceProducts.map(p => p.company)].filter((x): x is string => Boolean(x)))).sort((a,b) => a.localeCompare(b, "th"));
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
  const categories = Array.from(new Set(["ประกันรถยนต์", "ประกันสุขภาพ", "ประกันชีวิต", "ประกันอุบัติเหตุ", "ประกันบ้านและทรัพย์สิน", "ประกันเดินทาง", "ประกันการเกษตร", "ประกันธุรกิจ", ...plans.map(p => p.insurance_type)])).sort((a,b) => a.localeCompare(b, "th"));
  const visiblePlans = plans.filter(p => (category === "all" || p.insurance_type === category) && (companyFilter === "all" || p.insurance_companies?.name === companyFilter) && (priceFilter === "all" || (priceFilter === "verified" ? priceVerified(p) : !priceVerified(p))) && [p.plan_name, p.insurance_type, p.insurance_companies?.name ?? "", p.coverage_summary ?? ""].some(value => value.toLocaleLowerCase("th-TH").includes(search.trim().toLocaleLowerCase("th-TH"))));
  if (sort === "company") visiblePlans.sort((a,b) => (a.insurance_companies?.name ?? "").localeCompare(b.insurance_companies?.name ?? "", "th"));
  if (sort === "name") visiblePlans.sort((a,b) => a.plan_name.localeCompare(b.plan_name, "th"));
  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18,
    padding: 24, boxShadow: "0 5px 20px rgba(0,0,0,0.04)",
  };

  if (loading) return <main style={{ padding: 40 }}>กำลังโหลดแผนประกัน...</main>;

  return (
    <main className="products-page" style={{ minHeight: "100vh", background: "#f3f7fc", padding: "32px 18px", color: "#102b50" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#1764b3", textDecoration: "none", fontWeight: 600 }}>← กลับหน้าหลัก</Link>
        <header className="products-hero" style={{ margin: "28px 0" }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>INSURE ONE</h1>
          <h2 style={{ fontSize: 24, margin: 0 }}>แผนประกันภัยและโปรโมชั่น</h2>
          <p style={{ color: "#64748b", lineHeight: 1.8 }}>
            เปรียบเทียบข้อมูลเบื้องต้นและส่งคำขอใบเสนอราคาเพื่อรับข้อเสนอที่เหมาะกับคุณ
          </p>
        </header>
        <section className="insurance-trust-panel" aria-label="วิธีเลือกประกันอย่างมั่นใจ">
          <div><strong>เริ่มต้นง่าย ๆ ใน 3 ขั้นตอน</strong><p>① เลือกประเภทประกัน → ② อ่านความคุ้มครองและข้อควรระวัง → ③ ขอให้เจ้าหน้าที่ตรวจสอบเบี้ยจริง</p></div>
          <div><strong>ข้อมูลโปร่งใส ตรวจสอบได้</strong><p>แยกข้อมูลจากเว็บไซต์บริษัทออกจากแผนที่ได้รับการตรวจสอบราคา ไม่มีการแสดงส่วนลดหรือราคาเบี้ยที่ไม่ได้รับการยืนยัน</p></div>
          <div><strong>ตรวจสอบผู้เสนอขาย</strong><p>ก่อนซื้อควรตรวจสอบใบอนุญาตตัวแทนหรือนายหน้าที่ คปภ. และอ่านเงื่อนไข ข้อยกเว้น ระยะเวลาคุ้มครอง และการชำระเบี้ยให้ครบถ้วน</p><a href="https://www.oic.or.th/" target="_blank" rel="noopener noreferrer">เว็บไซต์ คปภ. ↗</a></div>
        </section>
        <section className="insurance-guide-details" aria-label="คำแนะนำแต่ละประเภทประกัน">
          <h2>ประกันแต่ละประเภทคุ้มครองอะไร?</h2>
          <p>คำอธิบายทั่วไปเพื่อช่วยเลือกประเภท ไม่ใช่รายละเอียดหรือคำรับรองความคุ้มครองของกรมธรรม์ใดโดยเฉพาะ</p>
          <div className="insurance-guide-grid">{[
            {name:"ประกันรถยนต์",info:"พิจารณาชั้น 1, 2+, 3+, 2, 3 และ พ.ร.บ. ตามความเสี่ยงและงบประมาณ",check:"ตรวจทุนประกัน ค่าเสียหายส่วนแรก การซ่อมห้าง/อู่ และข้อยกเว้น"},
            {name:"ประกันสุขภาพ",info:"ช่วยรองรับค่ารักษาพยาบาลตามวงเงินและเงื่อนไขที่เลือก",check:"ตรวจวงเงินต่อครั้ง/ต่อปี โรคที่ไม่คุ้มครอง ระยะเวลารอคอย และเงื่อนไขสุขภาพ"},
            {name:"ประกันชีวิต",info:"ช่วยวางแผนความคุ้มครองชีวิตและผลประโยชน์แก่ผู้รับประโยชน์",check:"ตรวจระยะเวลาชำระเบี้ย จำนวนเงินเอาประกัน ข้อยกเว้น และผลประโยชน์"},
            {name:"ประกันอุบัติเหตุ",info:"คุ้มครองความเสี่ยงจากอุบัติเหตุตามข้อตกลงในกรมธรรม์",check:"ตรวจนิยามอุบัติเหตุ อาชีพที่รับประกัน และวงเงินค่ารักษา"},
            {name:"ประกันเดินทาง",info:"ช่วยดูแลเหตุไม่คาดคิดระหว่างการเดินทางตามแผน",check:"ตรวจประเทศที่คุ้มครอง วันที่เดินทาง ค่ารักษา การยกเลิกทริป และกิจกรรมยกเว้น"},
            {name:"ประกันบ้านและทรัพย์สิน",info:"คุ้มครองความเสียหายต่ออาคารหรือทรัพย์สินจากภัยที่ระบุ",check:"ตรวจภัยที่คุ้มครอง ทุนประกัน ความเสียหายส่วนแรก และทรัพย์สินที่ยกเว้น"},
            {name:"ประกันการเกษตร",info:"ช่วยบริหารความเสี่ยงของพืชผล ปศุสัตว์ หรือกิจการเกษตรตามโครงการ",check:"ตรวจชนิดพืช/สัตว์ พื้นที่ ฤดูกาล ภัยที่รับประกัน และหลักฐานความเสียหาย"},
            {name:"ประกันธุรกิจ",info:"คุ้มครองความเสี่ยงทรัพย์สิน ความรับผิด หรือการดำเนินธุรกิจตามแบบประกัน",check:"ตรวจประเภทกิจการ ทุนประกัน ข้อยกเว้น และเงื่อนไขความรับผิด"},
          ].map(item=><article key={item.name}><h3>{item.name}</h3><p>{item.info}</p><strong>ควรตรวจสอบก่อนซื้อ</strong><p>{item.check}</p><Link href={item.name==="ประกันรถยนต์"?"/motor-quote":`/quote?insurance_type=${encodeURIComponent(item.name)}`}>ขอคำแนะนำประเภทนี้ →</Link></article>)}</div>
        </section>
        <section className="insurance-category-guide" aria-label="เลือกประเภทประกันที่สนใจ">
          <div className="insurance-category-heading"><h2>เลือกประกันที่คุณต้องการ</h2><p>กดเลือกประเภทเพื่อดูแผนที่เผยแพร่แล้ว หรือส่งข้อมูลให้เจ้าหน้าที่ช่วยค้นหาข้อเสนอที่เหมาะสม</p></div>
          <div className="insurance-category-grid">
            {[
              { name: "ประกันรถยนต์", icon: "🚗", detail: "ชั้น 1 · 2+ · 3+ · พ.ร.บ." },
              { name: "ประกันสุขภาพ", icon: "💙", detail: "ค่ารักษาพยาบาลและความคุ้มครองสุขภาพ" },
              { name: "ประกันชีวิต", icon: "🛡️", detail: "วางแผนดูแลคนที่คุณรัก" },
              { name: "ประกันอุบัติเหตุ", icon: "🩹", detail: "คุ้มครองอุบัติเหตุที่ไม่คาดคิด" },
              { name: "ประกันเดินทาง", icon: "✈️", detail: "ท่องเที่ยวในประเทศและต่างประเทศ" },
              { name: "ประกันบ้านและทรัพย์สิน", icon: "🏡", detail: "ดูแลบ้านและทรัพย์สิน" },
              { name: "ประกันการเกษตร", icon: "🌾", detail: "ความเสี่ยงด้านการเกษตร" },
              { name: "ประกันธุรกิจ", icon: "🏢", detail: "ความเสี่ยงในการดำเนินธุรกิจ" },
            ].map(item => {
              const count = plans.filter(p => p.insurance_type === item.name).length;
              return <article key={item.name} className="insurance-category-card">
                <div className="insurance-category-icon" aria-hidden="true">{item.icon}</div>
                <h3>{item.name}</h3><p>{item.detail}</p>
                <small>{count ? `มีแผนเผยแพร่ ${count} แผน` : "รับคำขอให้เจ้าหน้าที่ตรวจสอบราคา"}</small>
                <div className="insurance-category-actions">
                  <button type="button" onClick={() => { setCategory(item.name); setSearch(""); setCompanyFilter("all"); setPriceFilter("all"); document.getElementById("insurance-plan-results")?.scrollIntoView({ behavior: "smooth" }); }}>ดูแผน</button>
                  <Link href={item.name === "ประกันรถยนต์" ? "/motor-quote" : `/quote?insurance_type=${encodeURIComponent(item.name)}`}>{item.name === "ประกันรถยนต์" ? "กรอกข้อมูลรถ" : "ขอราคา"}</Link>
                </div>
              </article>;
            })}
          </div>
          <p className="insurance-category-note">ราคาและโปรโมชั่นจะแสดงเฉพาะแผนที่มีแหล่งข้อมูลตรวจสอบได้และยังไม่หมดอายุ ไม่มีการสมมติราคาเบี้ยหรือส่วนลด</p>
        </section>
        <section className="simple-insurance-search" aria-label="ค้นหาประกันแบบง่าย">
          <div className="simple-insurance-search-title"><h2>🔎 หาแผนประกันที่เหมาะกับคุณ</h2><p>เลือกประเภทด้านบน หรือพิมพ์ชื่อบริษัทหรือชื่อแผนที่ต้องการ</p></div>
          <label className="simple-search-input"><span>ค้นหาประกัน</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="เช่น ประกันรถยนต์, ซัมซุง, ชั้น 1..." /></label>
          <div className="simple-search-bottom">
            <p>{category === "all" ? "กำลังดูทุกประเภท" : `กำลังดู: ${category}`}{companyFilter !== "all" ? ` · ${companyFilter}` : ""}</p>
            <button type="button" onClick={()=>{setSearch("");setCategory("all");setCompanyFilter("all");setPriceFilter("all");setSort("newest");}}>ล้างตัวเลือกทั้งหมด ↺</button>
          </div>
          <button type="button" className="advanced-filter-toggle" aria-expanded={advancedOpen} onClick={()=>setAdvancedOpen(!advancedOpen)}>{advancedOpen ? "ซ่อนตัวเลือกเพิ่มเติม ▲" : "กรองตามบริษัท ราคา และเรียงลำดับ ▼"}</button>
          {advancedOpen && <div className="advanced-filter-grid">
            <label>ประเภทประกัน<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">ทุกประเภท</option>{categories.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
            <label>บริษัทประกัน<select value={companyFilter} onChange={e=>setCompanyFilter(e.target.value)}><option value="all">ทุกบริษัทที่มีข้อมูล</option>{companies.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
            <label>ราคาเบี้ย<select value={priceFilter} onChange={e=>setPriceFilter(e.target.value)}><option value="all">แสดงทั้งหมด</option><option value="verified">มีราคาอ้างอิงที่ตรวจสอบได้</option><option value="quote">ยังไม่มีราคา ต้องสอบถาม</option></select></label>
            <label>เรียงลำดับ<select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">เพิ่มเข้าระบบล่าสุด</option><option value="company">ตามชื่อบริษัท ก–ฮ</option><option value="name">ตามชื่อแผน ก–ฮ</option></select></label>
            <p className="filter-help">ตัวเลือก “ราคาเบี้ย” ใช้กรองเฉพาะแผนที่มีข้อมูลราคาตรวจสอบได้ในระบบ ส่วนข้อมูลแผนจากเว็บไซต์บริษัทจะยังแสดงเป็น “สอบถามราคา”</p>
          </div>}
        </section>
        <section className="official-catalog" aria-label="ผลิตภัณฑ์จากเว็บไซต์บริษัทประกัน">
          <div className="insurance-category-heading"><h2>รู้จักผลิตภัณฑ์จากเว็บไซต์บริษัทประกัน</h2><p>ข้อมูลเบื้องต้นอ้างอิงจากหน้าเว็บไซต์ทางการ ไม่ใช่การดึงราคาแบบเรียลไทม์ และไม่ใช่ข้อเสนอที่ได้รับอนุมัติให้จำหน่ายบน INSURE ONE</p></div>
          <div className="official-catalog-grid">{officialInsuranceProducts.filter(p => (category === "all" || p.category === category) && (companyFilter === "all" || p.company === companyFilter) && (priceFilter !== "verified") && [p.name,p.company,p.category].some(s => s.toLocaleLowerCase("th").includes(search.trim().toLocaleLowerCase("th")))).map(p => <article className="official-product-card" key={p.company+p.name}>
            <div className="official-product-company"><span className="company-identity" aria-hidden="true">{p.company.includes("ซัมซุง") ? "SAMSUNG LIFE" : "INDARA INSURANCE"}</span><span>{p.company}</span></div><h3>{p.name}</h3><span className="official-product-category">{p.category}</span><p>{p.summary}</p>
            {p.note && <p className="official-product-warning">{p.note}</p>}
            <div className="official-product-actions"><a href={p.source} target="_blank" rel="noopener noreferrer">อ่านข้อมูลจากบริษัท ↗</a><Link href={`/quote?insurance_type=${encodeURIComponent(p.category)}&plan=${encodeURIComponent(p.name)}&company=${encodeURIComponent(p.company)}`}>ขอให้ตรวจสอบราคา</Link></div>
          </article>)}</div>
          <p className="insurance-category-note">ราคาประกันขึ้นกับอายุ สุขภาพ รถยนต์ พื้นที่ ความคุ้มครอง และการรับประกันภัย โปรดตรวจสอบรายละเอียดล่าสุดจากบริษัทก่อนตัดสินใจ</p>
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
        <div id="insurance-plan-results" />
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
              <Link href={`/quote?insurance_type=${encodeURIComponent(category === "all" ? "อื่น ๆ" : category)}`} style={{ background: "#1764b3", color: "#fff", padding: "14px 22px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>ขอใบเสนอราคา / คำปรึกษา</Link>
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
              <article className="products-card" key={plan.id} style={cardStyle}>
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
