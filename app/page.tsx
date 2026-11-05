import FeaturedPromotions from "./FeaturedPromotions";

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

    <section className="storefront-hero" aria-label="เลือกประกันให้เหมาะกับชีวิต">
      <div className="storefront-hero-inner">
        <div className="storefront-hero-copy">
          <span className="storefront-kicker">✦ INSURE ONE · YOUR COVER, YOUR CHOICE</span>
          <h1>ประกันครบ <span>จบในที่เดียว</span></h1>
          <p className="storefront-lead">ค้นหาแผนประกันหลากหลายประเภท เปรียบเทียบข้อมูลจากแหล่งที่ตรวจสอบได้ และขอใบเสนอราคาที่เหมาะกับคุณ</p>
          <div className="storefront-checks"><span>✓ หลากหลายประเภท</span><span>✓ เปรียบเทียบง่าย</span><span>✓ มีเจ้าหน้าที่ช่วยดูแล</span></div>
          <div className="storefront-hero-buttons"><a className="storefront-primary-cta" href="#products">ค้นหาแผนประกันเลย <span>→</span></a><a className="storefront-outline-cta" href="/products">เปรียบเทียบแผน ↗</a></div>
          <p className="storefront-fineprint">การซื้อและราคาจริงขึ้นอยู่กับเงื่อนไขและการยืนยันจากบริษัทประกัน</p>
        </div>
        <div className="storefront-hero-visual" aria-label="ภาพประกอบครอบครัว บ้าน รถยนต์ และการดูแลสุขภาพ">
          <div className="storefront-photo storefront-photo-family" role="img" aria-label="ครอบครัวอบอุ่น"></div>
          <div className="storefront-photo storefront-photo-home" role="img" aria-label="บ้านพักอาศัย"></div>
          <div className="storefront-photo storefront-photo-car" role="img" aria-label="รถยนต์"></div>
          <div className="storefront-hero-shield" aria-hidden="true">✓</div>
          <div className="storefront-visual-badge">🛡️ <span>เลือกความคุ้มครอง<br/><b>ให้เหมาะกับชีวิตคุณ</b></span></div>
        </div>
      </div>
    </section>

    <section className="storefront-category-wrap" id="products" aria-labelledby="category-title">
      <div className="storefront-category-heading"><span className="eyebrow">EXPLORE INSURANCE</span><h2 id="category-title">เลือกประกันที่ใช่สำหรับคุณ</h2><p>เริ่มต้นจากประเภทที่สนใจ</p></div>
      <div className="storefront-category-strip">{categories.map(c => <a key={c.title} href={`/products?category=${encodeURIComponent(c.title)}`} className="storefront-category-tile"><span className="storefront-category-emoji" aria-hidden="true">{c.icon}</span><strong>{c.title}</strong><small>{c.desc}</small></a>)}</div>
    </section>

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
