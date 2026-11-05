"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/Lib/supabase";

type FeaturedPlan = {
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
  insurance_companies: { name: string } | null;
};

function todayBangkok() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (key: string) => parts.find(p => p.type === key)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
const baht = (value: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

export default function FeaturedPromotions() {
  const [plans, setPlans] = useState<FeaturedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error } = await supabase.from("insurance_plans")
          .select("id,plan_name,insurance_type,premium_amount,price_period,price_source_url,price_verified_at,price_valid_until,promotion_name,promotion_description,discount_type,discount_value,promotion_start_date,promotion_end_date,insurance_companies(name)")
          .eq("is_published", true).order("created_at", { ascending: false }).limit(60);
        if (!active) return;
        if (error) setFailed(true);
        else setPlans((data ?? []) as unknown as FeaturedPlan[]);
      } catch { if (active) setFailed(true); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  const today = todayBangkok();
  const featured = plans.filter(p =>
    !!p.promotion_name?.trim() &&
    !!p.promotion_start_date && !!p.promotion_end_date &&
    p.promotion_start_date <= today && p.promotion_end_date >= today &&
    p.promotion_start_date <= p.promotion_end_date &&
    !!p.price_source_url && !!p.price_verified_at && !!p.price_valid_until &&
    p.price_valid_until >= today &&
    typeof p.premium_amount === "number" && Number.isFinite(p.premium_amount) && p.premium_amount > 0 &&
    !!p.price_period &&
    (p.discount_type === "percent" || p.discount_type === "fixed") &&
    typeof p.discount_value === "number" && Number.isFinite(p.discount_value) &&
    p.discount_value > 0 && (p.discount_type !== "percent" || p.discount_value <= 100)
  ).slice(0, 3);

  return <section className="section storefront-promotions" id="promotions">
    <div className="section-heading">
      <div><span className="eyebrow">SPECIAL OFFERS</span><h2>โปรโมชั่นประกันที่น่าสนใจ</h2></div>
      <Link href="/products" className="text-link">ดูแผนประกันทั้งหมด →</Link>
    </div>
    {loading ? <p role="status">กำลังตรวจสอบโปรโมชั่นล่าสุด...</p> :
      failed ? <p role="status">ยังไม่สามารถโหลดโปรโมชั่นได้ กรุณาดูแผนประกันทั้งหมด</p> :
      featured.length === 0 ? <div className="storefront-empty">
        <span aria-hidden="true">✦</span><h3>กำลังเตรียมข้อเสนอสำหรับคุณ</h3>
        <p>โปรโมชั่นจะแสดงที่นี่เมื่อบริษัทประกันยืนยันราคา เงื่อนไข และช่วงเวลาแล้ว</p>
        <Link className="button" href="/products">เลือกดูแผนประกัน →</Link>
      </div> :
      <div className="storefront-promo-grid">{featured.map(p => {
        const original = p.premium_amount!;
        const reduction = p.discount_type === "percent" ? original * p.discount_value! / 100 : p.discount_value!;
        const finalPrice = Math.max(0, original - Math.min(original, reduction));
        const params = new URLSearchParams({ company: p.insurance_companies?.name ?? "", plan: p.plan_name, insurance_type: p.insurance_type });
        return <article className="storefront-promo-card" key={p.id}>
          <span className="storefront-promo-tag">✦ โปรโมชั่นที่ตรวจสอบแล้ว</span>
          <small>{p.insurance_companies?.name ?? "บริษัทประกันภัย"} · {p.insurance_type}</small>
          <h3>{p.plan_name}</h3>
          <p>{p.promotion_name}</p>
          {p.promotion_description && <p>{p.promotion_description}</p>}
          <div className="storefront-promo-price"><s>฿{baht(original)}</s><strong>฿{baht(finalPrice)}</strong><small>{p.price_period} · ราคาประมาณการหลังส่วนลด</small></div>
          <small>โปรโมชั่นถึง {p.promotion_end_date}</small>
          <div className="storefront-promo-actions"><Link className="button" href={`/quote?${params.toString()}`}>ขอใบเสนอราคา →</Link><a href={p.price_source_url!} target="_blank" rel="noopener noreferrer">แหล่งอ้างอิงราคา</a></div>
        </article>;
      })}</div>}
    <p className="storefront-disclaimer">ราคาโปรโมชั่นเป็นข้อมูลอ้างอิง ไม่ใช่ยอดชำระที่ยืนยันแล้ว ต้องตรวจสอบเงื่อนไขและเบี้ยจริงกับบริษัทประกันก่อนซื้อ</p>
  </section>;
}
