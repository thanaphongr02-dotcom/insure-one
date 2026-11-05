"use client";

import { useEffect, useState } from "react";

const slides = [
  { tag: "INSURE ONE · SMART PROTECTION", title: "ประกันครบ จบในที่เดียว", desc: "ค้นหาแผนประกันหลากหลายประเภท เปรียบเทียบข้อมูลที่ตรวจสอบได้ และส่งคำขอใบเสนอราคาได้ง่าย ๆ", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85", alt: "ครอบครัวใช้เวลาร่วมกัน", link: "/products", button: "ค้นหาแผนประกัน" },
  { tag: "DRIVE WITH CONFIDENCE", title: "ทุกเส้นทาง อุ่นใจมากขึ้น", desc: "เลือกดูแผนประกันรถยนต์และความคุ้มครองที่เหมาะกับการเดินทางของคุณ", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85", alt: "รถยนต์บนท้องถนน", link: "/products?category=ประกันรถยนต์", button: "ดูประกันรถยนต์" },
  { tag: "PROTECT YOUR HOME", title: "บ้านที่รัก ดูแลได้ทุกวัน", desc: "สำรวจตัวเลือกความคุ้มครองบ้านและทรัพย์สิน ก่อนขอรายละเอียดจากเจ้าหน้าที่", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85", alt: "บ้านพักอาศัย", link: "/products?category=ประกันบ้านและทรัพย์สิน", button: "ดูประกันบ้าน" },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive(n => (n + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [paused]);
  const slide = slides[active];
  return <section className="storefront-hero storefront-hero-carousel" aria-roledescription="carousel" aria-label="แนะนำแผนประกัน" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
    <div className="storefront-hero-inner">
      <div className="storefront-hero-copy" key={active}>
        <span className="storefront-kicker">✦ {slide.tag}</span>
        <h1>{slide.title.split(" ").slice(0,1).join(" ")} <span>{slide.title.split(" ").slice(1).join(" ")}</span></h1>
        <p className="storefront-lead">{slide.desc}</p>
        <div className="storefront-checks"><span>✓ หลายประเภท</span><span>✓ ค้นหาสะดวก</span><span>✓ เจ้าหน้าที่ช่วยดูแล</span></div>
        <div className="storefront-hero-buttons"><a className="storefront-primary-cta" href={slide.link}>{slide.button} →</a><a className="storefront-outline-cta" href="/products">เปรียบเทียบแผน ↗</a></div>
        <p className="storefront-fineprint">ข้อมูลและเบี้ยจริงขึ้นอยู่กับเงื่อนไขของบริษัทประกัน</p>
      </div>
      <div className="storefront-hero-visual storefront-carousel-visual"><div className="storefront-carousel-image" role="img" aria-label={slide.alt} style={{backgroundImage:`linear-gradient(0deg,rgba(9,46,92,.22),transparent 50%),url("${slide.image}")`}}/><div className="storefront-hero-shield" aria-hidden="true">✓</div><div className="storefront-visual-badge">🛡️ <span>ค้นหาแผนที่เหมาะ<br/><b>กับชีวิตของคุณ</b></span></div></div>
    </div>
    <div className="storefront-carousel-controls"><button type="button" aria-label="ภาพก่อนหน้า" onClick={() => setActive(n => (n - 1 + slides.length) % slides.length)}>‹</button><div className="storefront-carousel-dots">{slides.map((_, i) => <button key={i} type="button" aria-label={`แสดงภาพที่ ${i+1}`} aria-current={active===i ? "true" : undefined} className={active===i ? "active" : ""} onClick={() => setActive(i)} />)}</div><button type="button" aria-label="ภาพถัดไป" onClick={() => setActive(n => (n + 1) % slides.length)}>›</button></div>
  </section>;
}
