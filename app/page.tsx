import FeaturedPromotions from "./FeaturedPromotions";
import HeroCarousel from "./HeroCarousel";
import PlanFinder from "./PlanFinder";

const categories = [
  { icon: "🚘", title: "ประกันรถยนต์", desc: "รถยนต์และรถจักรยานยนต์" },
  { icon: "💗", title: "ประกันสุขภาพ", desc: "ค่ารักษาพยาบาล" },
  { icon: "👨‍👩‍👧", title: "ประกันชีวิต", desc: "ดูแลคนที่คุณรัก" },
  { icon: "🛡️", title: "ประกันอุบัติเหตุ", desc: "คุ้มครองเหตุไม่คาดฝัน" },
  { icon: "🏡", title: "ประกันบ้านและทรัพย์สิน", desc: "บ้านและทรัพย์สิน" },
  { icon: "✈️", title: "ประกันเดินทาง", desc: "เที่ยวอย่างอุ่นใจ" },
  { icon: "🌱", title: "ประกันการเกษตร", desc: "พืชผลและฟาร์ม" },
  { icon: "🏢", title: "ประกันธุรกิจ", desc: "กิจการและร้านค้า" },
];

export default function Home() {
  return <main className="storefront">
    <header className="topbar storefront-topbar">
      <a className="brand" href="/" aria-label="INSURE ONE หน้าแรก"><span className="brand-mark">◆</span><span>INSURE <b>ONE</b><small>ประกันครบ เลือกง่าย ใส่ใจทุกชีวิต</small></span></a>
      <nav aria-label="เมนูหลัก"><a href="/">หน้าแรก</a><a href="#products">ผลิตภัณฑ์</a><a href="#promotions">โปรโมชั่น</a><a href="/products">เปรียบเทียบแผน</a><a href="#how">วิธีใช้งาน</a><a href="/contact">ติดต่อเรา</a></nav>
      <div className="account-actions"><a className="login" href="/login">เข้าสู่ระบบ</a><a className="button button-small" href="/register">สมัครสมาชิก</a></div>
    </header>

    <HeroCarousel />

    <section className="storefront-category-wrap" id="products" aria-labelledby="category-title">
      <div className="storefront-category-heading"><span className="eyebrow">EXPLORE INSURANCE</span><h2 id="category-title">เลือกประกันที่ใช่สำหรับคุณ</h2><p>เริ่มต้นจากประเภทที่สนใจ</p></div>
      <div className="storefront-category-strip">{categories.map(c => <a key={c.title} href={`/products?category=${encodeURIComponent(c.title)}`} className="storefront-category-tile"><span className="storefront-category-emoji" aria-hidden="true">{c.icon}</span><strong>{c.title}</strong><small>{c.desc}</small></a>)}</div>
    </section>

    <section className="storefront-campaigns section" aria-label="ค้นหาความคุ้มครองตามไลฟ์สไตล์">
      <div className="section-heading"><div><span className="eyebrow">HANDPICKED FOR YOU</span><h2>สิทธิประโยชน์และแผนที่คุณอาจสนใจ</h2></div><p>เลือกดูประเภทความคุ้มครองก่อนตรวจสอบข้อเสนอจริง</p></div>
      <div className="storefront-campaign-grid">
        <a className="storefront-campaign-card campaign-auto" href="/products?category=ประกันรถยนต์"><span className="campaign-label">แนะนำให้สำรวจ</span><h3>ประกันรถยนต์<br/>เลือกความคุ้มครองให้ตรงใจ</h3><p>เปรียบเทียบข้อมูลแผนและเงื่อนไข</p><strong>ดูแผนรถยนต์ →</strong></a>
        <a className="storefront-campaign-card campaign-health" href="/products?category=ประกันสุขภาพ"><span className="campaign-label">ดูแลสุขภาพ</span><h3>สุขภาพที่ดี<br/>เริ่มจากการวางแผน</h3><p>ค้นหาตัวเลือกค่ารักษาพยาบาล</p><strong>ดูแผนสุขภาพ →</strong></a>
        <a className="storefront-campaign-card campaign-travel" href="/products?category=ประกันเดินทาง"><span className="campaign-label">สำหรับนักเดินทาง</span><h3>พร้อมออกเดินทาง<br/>อย่างมั่นใจ</h3><p>สำรวจความคุ้มครองก่อนทริป</p><strong>ดูแผนเดินทาง →</strong></a>
      </div>
    </section>
    <PlanFinder />
    <FeaturedPromotions />

    <section className="storefront-feature-grid section" aria-label="บริการของเรา">
      <div className="section-heading"><div><span className="eyebrow">WHY INSURE ONE</span><h2>เรื่องประกัน ให้เป็นเรื่องง่าย</h2></div><p>เริ่มค้นหาด้วยตัวเอง และให้เจ้าหน้าที่ช่วยตรวจสอบรายละเอียดก่อนตัดสินใจ</p></div>
      <div className="storefront-feature-cards">
        <article><span>🔎</span><h3>ค้นหาและเปรียบเทียบ</h3><p>ค้นหาแผนตามชื่อบริษัท ประเภทประกัน และความคุ้มครองที่สนใจ</p><a href="/products">ดูแผนประกัน →</a></article>
        <article><span>💬</span><h3>ขอคำแนะนำ</h3><p>ส่งความต้องการและรับการติดต่อกลับจากผู้ดูแลระบบ</p><a href="/quote">ขอใบเสนอราคา →</a></article>
        <article><span>📋</span><h3>ติดตามคำขอออนไลน์</h3><p>สมาชิกสามารถตรวจสอบสถานะคำขอและข้อเสนอที่ได้รับในระบบ</p><a href="/member">พื้นที่สมาชิก →</a></article>
      </div>
    </section>

    <section className="how-section" id="how"><div className="section-heading centered"><span className="eyebrow">HOW IT WORKS</span><h2>เลือกประกันง่าย ๆ ใน 3 ขั้นตอน</h2></div><div className="steps"><article><span>01</span><h3>เลือกประเภท</h3><p>ค้นหาแผนและข้อมูลความคุ้มครองที่สนใจ</p></article><article><span>02</span><h3>ขอใบเสนอราคา</h3><p>ส่งข้อมูลที่จำเป็นเพื่อให้เจ้าหน้าที่ตรวจสอบ</p></article><article><span>03</span><h3>ยืนยันก่อนซื้อ</h3><p>ตรวจสอบเบี้ยจริง เงื่อนไข และช่องทางดำเนินการที่ได้รับอนุญาต</p></article></div></section>
    <section className="contact-band"><div><span className="eyebrow">WE'RE HERE TO HELP</span><h2>ยังไม่แน่ใจว่าควรเลือกแผนไหน?</h2><p>บอกความต้องการของคุณ แล้วให้เจ้าหน้าที่ช่วยดูรายละเอียด</p></div><a className="button button-light" href="/quote">ขอคำปรึกษา →</a></section>
    <footer><div className="footer-brand"><span className="brand-mark">◆</span><span>INSURE ONE<small>ประกันครบ เลือกง่าย ใส่ใจทุกชีวิต</small></span></div><p>ข้อมูลราคาและโปรโมชั่นต้องได้รับการยืนยันก่อนเผยแพร่ เว็บไซต์ไม่ใช่ผู้รับประกันภัยโดยตรง</p><div className="footer-links"><a href="/privacy">นโยบายความเป็นส่วนตัว</a><a href="/terms">เงื่อนไขการใช้บริการ</a><a href="/contact">ติดต่อเรา</a></div><small>ยังไม่มีการยืนยันความร่วมมือหรือสิทธิ์จำหน่ายกับทุกบริษัทประกัน</small></footer>
  </main>;
}
