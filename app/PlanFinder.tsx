"use client";

import { useState } from "react";
import Link from "next/link";

const goals = [
  { id:"car", icon:"🚗", title:"ดูแลรถยนต์", category:"ประกันรถยนต์", hint:"เปรียบเทียบแผนสำหรับรถยนต์" },
  { id:"health", icon:"💗", title:"ดูแลสุขภาพ", category:"ประกันสุขภาพ", hint:"สำรวจค่ารักษาพยาบาล" },
  { id:"family", icon:"👨‍👩‍👧", title:"ดูแลครอบครัว", category:"ประกันชีวิต", hint:"วางแผนความคุ้มครองชีวิต" },
  { id:"travel", icon:"✈️", title:"เตรียมเดินทาง", category:"ประกันเดินทาง", hint:"สำรวจแผนสำหรับทริป" },
  { id:"home", icon:"🏠", title:"ปกป้องบ้าน", category:"ประกันบ้านและทรัพย์สิน", hint:"ดูความคุ้มครองทรัพย์สิน" },
  { id:"farm", icon:"🌾", title:"ดูแลฟาร์ม", category:"ประกันการเกษตร", hint:"ค้นหาประกันสำหรับการเกษตร" },
];
export default function PlanFinder() {
  const [selected,setSelected] = useState(goals[0].id);
  const goal = goals.find(g=>g.id===selected) ?? goals[0];
  return <section className="section storefront-finder" aria-labelledby="finder-title">
    <div className="storefront-finder-head"><div><span className="eyebrow">SMART PLAN FINDER</span><h2 id="finder-title">วันนี้คุณอยากคุ้มครองอะไร?</h2><p>เลือกความต้องการ แล้วดูแผนประกันในหมวดนั้นได้ทันที</p></div><span className="storefront-finder-icon" aria-hidden="true">✨</span></div>
    <div className="storefront-finder-grid" role="group" aria-label="เลือกความต้องการ">{goals.map(g=><button type="button" key={g.id} className={`storefront-finder-choice ${selected===g.id?"selected":""}`} aria-pressed={selected===g.id} onClick={()=>setSelected(g.id)}><span aria-hidden="true">{g.icon}</span><strong>{g.title}</strong></button>)}</div>
    <div className="storefront-finder-result" aria-live="polite"><div><strong>{goal.hint}</strong><p>ข้อมูลราคาและเงื่อนไขขึ้นอยู่กับแผนที่บริษัทประกันยืนยัน</p></div><Link href={`/products?category=${encodeURIComponent(goal.category)}`}>ดู{goal.category} <span aria-hidden="true">→</span></Link></div>
  </section>;
}
