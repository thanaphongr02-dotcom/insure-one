const categories = [
  { icon: "🚗", title: "ประกันรถยนต์", desc: "ดูตัวเลือกความคุ้มครองรถยนต์" },
  { icon: "❤️", title: "ประกันชีวิต", desc: "ค้นหาผลิตภัณฑ์ประกันชีวิต" },
  { icon: "🏥", title: "ประกันสุขภาพ", desc: "ตรวจสอบแผนสุขภาพที่มีข้อมูลยืนยัน" },
  { icon: "🛡️", title: "ประกันอุบัติเหตุ", desc: "ดูความคุ้มครองอุบัติเหตุ" },
  { icon: "🏠", title: "ประกันบ้านและทรัพย์สิน", desc: "ตรวจสอบความคุ้มครองทรัพย์สิน" },
  { icon: "✈️", title: "ประกันเดินทาง", desc: "ค้นหาความคุ้มครองระหว่างเดินทาง" },
  { icon: "🌾", title: "ประกันการเกษตร", desc: "ตรวจสอบผลิตภัณฑ์ที่มีให้บริการ" },
  { icon: "🏢", title: "ประกันธุรกิจ", desc: "ทางเลือกสำหรับกิจการและร้านค้า" },
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/" aria-label="INSURE ONE หน้าแรก">
          <span className="brand-mark">I</span>
          <span>INSURE <b>ONE</b><small>ประกันครบ เลือกง่าย</small></span>
        </a>
        <nav>
          <a href="#products">ผลิตภัณฑ์</a>
          <a href="#how">วิธีใช้งาน</a>
          <a href="#contact">ติดต่อเรา</a>
        </nav>
        <div className="account-actions">
          <a className="login" href="/login">เข้าสู่ระบบ</a>
          <a className="button button-small" href="/register">สมัครสมาชิก</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="dot" /> INSURANCE MADE SIMPLE</div>
          <h1>ประกันที่ใช่<br /><em>เลือกง่ายในที่เดียว</em></h1>
          <p>ค้นหาผลิตภัณฑ์ประกัน เปรียบเทียบข้อมูลความคุ้มครอง และส่งคำขอให้เจ้าหน้าที่ช่วยดูแลอย่างเป็นขั้นตอน</p>
          <div className="hero-actions">
            <a className="button" href="#products">เลือกประเภทประกัน <span>→</span></a>
            <a className="text-link" href="#how">ดูวิธีใช้งาน</a>
          </div>
          <div className="trust-row">
            <span>✓ ข้อมูลผลิตภัณฑ์ตรวจสอบได้</span>
            <span>✓ มีเจ้าหน้าที่ให้คำปรึกษา</span>
          </div>
        </div>
        <div className="hero-art" aria-label="ภาพประกอบการดูแลและความคุ้มครอง">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="shield">✓</div>
          <div className="float-card card-top"><span className="mini-icon">🛡️</span><div><b>ความคุ้มครอง</b><small>เลือกตามความต้องการ</small></div></div>
          <div className="float-card card-bottom"><span className="mini-icon gold">✦</span><div><b>เปรียบเทียบง่าย</b><small>ตรวจสอบข้อมูลก่อนตัดสินใจ</small></div></div>
          <div className="art-caption">YOUR PEACE OF MIND</div>
        </div>
      </section>

      <section className="stats">
        <div><b>หลายประเภท</b><span>ค้นหาประกันได้ตามความต้องการ</span></div>
        <div><b>เข้าใจง่าย</b><span>ดูข้อมูลสำคัญก่อนตัดสินใจ</span></div>
        <div><b>มีผู้ช่วยดูแล</b><span>ส่งคำขอให้เจ้าหน้าที่ติดต่อกลับ</span></div>
      </section>

      <section className="section" id="products">
        <div className="section-heading">
          <div><span className="eyebrow">FIND YOUR COVER</span><h2>คุณกำลังมองหาประกันแบบไหน?</h2></div>
          <p>เลือกหมวดหมู่เพื่อเริ่มต้นค้นหาผลิตภัณฑ์ที่มีข้อมูลยืนยันแล้ว</p>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <a className="category-card" href={`/products?category=${encodeURIComponent(c.title)}`} key={c.title}>
              <span className="category-icon">{c.icon}</span>
              <h3>{c.title}</h3><p>{c.desc}</p><span className="arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="section-heading centered">
          <span className="eyebrow">HOW IT WORKS</span><h2>เริ่มต้นได้ใน 3 ขั้นตอน</h2>
        </div>
        <div className="steps">
          <article><span>01</span><h3>เลือกประกัน</h3><p>เลือกประเภทและดูข้อมูลแผนที่สนใจ</p></article>
          <article><span>02</span><h3>ส่งคำขอ</h3><p>แจ้งความต้องการให้เจ้าหน้าที่ตรวจสอบรายละเอียด</p></article>
          <article><span>03</span><h3>ยืนยันและดำเนินการ</h3><p>ซื้อหรือชำระเงินได้เมื่อผลิตภัณฑ์และช่องทางได้รับการยืนยันว่าพร้อมใช้งาน</p></article>
        </div>
      </section>

      <section className="contact-band" id="contact">
        <div><span className="eyebrow">NEED HELP?</span><h2>ไม่แน่ใจว่าจะเลือกแผนไหน?</h2><p>ส่งคำขอให้เจ้าหน้าที่ติดต่อกลับเพื่ออธิบายข้อมูลและเงื่อนไขที่สำคัญ</p></div>
        <a className="button button-light" href="/quote">ขอให้ติดต่อกลับ <span>→</span></a>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-mark">I</span><span>INSURE ONE<small>ประกันครบ เลือกง่าย</small></span></div>
        <p>ข้อมูลผลิตภัณฑ์ ราคา และความคุ้มครองต้องได้รับการตรวจสอบก่อนเผยแพร่</p>
        <div className="footer-links"><a href="/privacy">นโยบายความเป็นส่วนตัว</a><a href="/terms">เงื่อนไขการใช้บริการ</a><a href="/contact">ติดต่อเรา</a></div>
        <small>INSURE ONE เป็นชื่อโครงการตัวอย่าง ไม่ได้แสดงว่าเป็นบริษัทประกันหรือได้รับการรับรองจากบริษัทใด</small>
      </footer>
    </main>
  );
}


