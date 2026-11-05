"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const carBrands: Record<string, string[]> = {
  Toyota: ["Yaris","Yaris Ativ","Vios","Corolla Altis","Corolla Cross","Camry","Prius","C-HR","Hilux Revo","Hilux Champ","Fortuner","Innova","Innova Zenix","Sienta","Veloz","Avanza","Alphard","Vellfire","Land Cruiser","bZ4X","GR 86","Supra","Hiace","Commuter"],
  Honda: ["City","City Hatchback","Civic","Accord","Jazz","Brio","Brio Amaze","HR-V","CR-V","BR-V","WR-V","Mobilio","Freed","Odyssey","Stepwgn","e:N1"],
  Isuzu: ["D-Max","MU-X","Dragon Eye","TFR","Elf"],
  Mitsubishi: ["Triton","Pajero Sport","Xpander","Xpander Cross","Mirage","Attrage","Lancer","Lancer EX","Pajero","Outlander","Delica"],
  Nissan: ["Almera","March","Note","Sylphy","Teana","Tiida","Sunny","Navara","Terra","Kicks","X-Trail","Juke","GT-R","370Z","Leaf","Serena"],
  Mazda: ["Mazda 2","Mazda 3","Mazda 6","CX-3","CX-30","CX-5","CX-8","CX-9","CX-60","CX-80","BT-50","MX-5"],
  Ford: ["Ranger","Ranger Raptor","Everest","Fiesta","Focus","EcoSport","Mustang","Territory","Escape"],
  Suzuki: ["Swift","Celerio","Ertiga","XL7","Ciaz","Carry","Jimny","Vitara"],
  MG: ["MG3","MG4","MG5","MG6","ZS","ZS EV","HS","HS PHEV","EP","ES","Extender","Maxus 9","Cyberster"],
  BYD: ["Dolphin","Atto 3","Seal","Sealion 6","Sealion 7","M6","Denza D9"],
  GWM: ["ORA Good Cat","ORA 07","Haval H6","Haval Jolion","Tank 300","Tank 500","Poer"],
  Hyundai: ["Grand i10","Accent","Elantra","Sonata","Creta","Tucson","Santa Fe","Staria","H-1","Ioniq 5","Ioniq 6","Kona"],
  Kia: ["Picanto","Rio","Cerato","Seltos","Sportage","Sorento","Carnival","EV5","EV6","EV9"],
  BMW: ["1 Series","2 Series","3 Series","4 Series","5 Series","6 Series","7 Series","X1","X2","X3","X4","X5","X6","X7","iX1","iX3","i4","i5","i7","iX","Z4"],
  "Mercedes-Benz": ["A-Class","B-Class","C-Class","E-Class","S-Class","CLA","CLS","GLA","GLB","GLC","GLE","GLS","G-Class","EQA","EQB","EQE","EQS","V-Class"],
  Audi: ["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q5","Q7","Q8","e-tron","Q4 e-tron","Q8 e-tron","TT","R8"],
  Volkswagen: ["Polo","Golf","Passat","Tiguan","Touareg","Caravelle","Multivan","Transporter","Beetle","ID.4","ID. Buzz"],
  Volvo: ["S60","S90","V40","V60","V90","XC40","XC60","XC90","EX30","EX40","EX90"],
  Subaru: ["XV","Crosstrek","Forester","Outback","Impreza","WRX","BRZ","Levorg"],
  Peugeot: ["2008","3008","5008","408","508"],
  Porsche: ["Macan","Cayenne","Panamera","Taycan","911","718 Cayman","718 Boxster"],
  Lexus: ["IS","ES","LS","UX","NX","RX","GX","LX","LM","RZ"],
  Tesla: ["Model 3","Model Y","Model S","Model X"],
  NETA: ["V","V-II","X","S"],
  AION: ["Y Plus","ES","V","UT"],
  Deepal: ["S07","L07","S05"],
  Changan: ["CS35","CS55","UNI-T","UNI-K","Lumin"],
  OMODA: ["C5","E5","C7"],
  JAECOO: ["J7","J8","J5"],
  Chery: ["Tiggo 4","Tiggo 7","Tiggo 8"],
  Wuling: ["Air EV","Binguo EV","Mini EV"],
  Leapmotor: ["C10","T03"],
  Zeekr: ["X","001","009","7X"],
  XPENG: ["G6","G9","X9","P7"],
  NIO: ["ET5","ET7","ES6","ES8"],
  MINI: ["Cooper","Countryman","Clubman","Aceman"],
  Jeep: ["Wrangler","Compass","Cherokee","Grand Cherokee"],
  LandRover: ["Defender","Discovery","Range Rover","Range Rover Evoque","Range Rover Sport","Discovery Sport"],
  Jaguar: ["XE","XF","F-Pace","E-Pace","I-Pace"],
  Chevrolet: ["Colorado","Trailblazer","Captiva","Cruze","Sonic","Aveo","Spin"],
  Fiat: ["500","500e","Panda","Ducato"],
  Renault: ["Clio","Megane","Koleos","Captur"],
  Citroen: ["C3","C4","C5 Aircross"],
  SsangYong: ["Tivoli","Korando","Rexton","Stavic"],
  Proton: ["Saga","Persona","Exora","Preve"],
  Tata: ["Xenon","Super Ace"],
  Daihatsu: ["Mira","Move","Tanto","Hijet"],
  Lamborghini: ["Huracan","Aventador","Urus","Revuelto"],
  Ferrari: ["Roma","Portofino","488","F8","296","SF90","Purosangue"],
  Maserati: ["Ghibli","Levante","Grecale","Quattroporte"],
  Bentley: ["Continental GT","Bentayga","Flying Spur"],
  RollsRoyce: ["Ghost","Phantom","Cullinan","Spectre"],
  AstonMartin: ["Vantage","DB11","DB12","DBX"],
  Other: [],
};
const OTHER_MODEL = "รุ่นอื่น ๆ (ระบุเอง)";
const usageOptions = ["ใช้ส่วนตัว", "รับส่งผู้โดยสารหรือบริการเดลิเวอรี่", "ให้เช่ารถ ระยะสั้น", "ให้เช่ารถ ระยะยาว", "การใช้รถเพื่อประกอบอาชีพหรือธุรกิจแบบอื่น ๆ"];
const coverages = ["ประกันชั้น 1", "ประกันชั้น 2+", "ประกันชั้น 3+", "ประกันชั้น 2", "ประกันชั้น 3", "พ.ร.บ."];
const years = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() + 1 - i));

export default function MotorQuoteWizard() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [year, setYear] = useState("");
  const [variant, setVariant] = useState("");
  const [mileage, setMileage] = useState("");
  const [usage, setUsage] = useState("");
  const [claims, setClaims] = useState("");
  const [coverage, setCoverage] = useState("ประกันชั้น 1");
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState("รายปี");
  const models = useMemo(() => carBrands[brand] ?? [], [brand]);
  const complete = Boolean(brand && (brand !== "Other" || customBrand.trim()) && model && (model !== OTHER_MODEL || customModel.trim()) && year && variant.trim() && mileage && usage && claims);
  const summary = [`ยี่ห้อ: ${brand === "Other" ? customBrand.trim() : brand}`, `รุ่น: ${model === OTHER_MODEL ? customModel.trim() : model}`, `ปี: ${year}`, `รุ่นย่อย/เครื่องยนต์: ${variant}`, `เลขไมล์: ${mileage}`, `การใช้งาน: ${usage}`, `เคลม 12 เดือน: ${claims} ครั้ง`, `แผนที่สนใจ: ${coverage}`, `รูปแบบชำระที่สนใจ: ${payment}`].join("\n");
  const quoteUrl = "/quote?" + new URLSearchParams({ insurance_type: "ประกันรถยนต์", motor_details: summary }).toString();
  return (
    <main className="motor-wizard" style={{ maxWidth: 860, margin: "0 auto", padding: "36px 18px 80px", color: "#164d91", lineHeight: 1.6 }}>
      <Link href="/">← กลับหน้าหลัก</Link>
      <header style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 42 }}>🚙</div>
        <h1 style={{ marginBottom: 8 }}>เช็กแผนประกันรถยนต์</h1>
        <p>บอกรายละเอียดรถและการใช้งาน เพื่อให้เจ้าหน้าที่จัดหาใบเสนอราคาจากบริษัทที่ได้รับอนุญาต</p>
      </header>
      <nav className="motor-steps" aria-label="ขั้นตอนขอใบเสนอราคา">{["รายละเอียดรถ", "การใช้งานและประวัติ", "เลือกความคุ้มครอง"].map((x,i)=><button key={x} type="button" className={step===i?"active":""} onClick={()=>setStep(i)}>{i+1}. {x}</button>)}</nav>
      <form onSubmit={e => { e.preventDefault(); if (complete) setSubmitted(true); }} style={{ display: "grid", gap: 20 }}>
        {step===0 && <fieldset style={fieldStyle}><legend>1. รายละเอียดรถ</legend>
          <label style={labelStyle}>ยี่ห้อรถ
            <select style={inputStyle} required value={brand} onChange={e => { setBrand(e.target.value); setModel(""); setCustomBrand(""); setCustomModel(""); setSubmitted(false); }}>
              <option value="">เลือกยี่ห้อรถ</option>{Object.keys(carBrands).map(x => <option key={x} value={x}>{x === "Other" ? "ยี่ห้ออื่น ๆ" : x}</option>)}
            </select>
          </label>
          {brand === "Other" && <label style={labelStyle}>ระบุยี่ห้อรถ<input style={inputStyle} value={customBrand} maxLength={70} required onChange={e=>setCustomBrand(e.target.value)} placeholder="พิมพ์ยี่ห้อรถ" /></label>}
          <label style={labelStyle}>รุ่นรถ
            <select style={inputStyle} required value={model} disabled={!brand} onChange={e => { setModel(e.target.value); setCustomModel(""); setSubmitted(false); }}>
              <option value="">เลือกรุ่นรถ</option>{models.map(x => <option key={x}>{x}</option>)}<option value={OTHER_MODEL}>{OTHER_MODEL}</option>
            </select>
          </label>
          {model === OTHER_MODEL && <label style={labelStyle}>ระบุรุ่นรถ<input style={inputStyle} value={customModel} maxLength={90} required onChange={e=>setCustomModel(e.target.value)} placeholder="พิมพ์ชื่อรุ่นที่ไม่มีในรายการ" /></label>}
          <label style={labelStyle}>ปีรถ
            <select style={inputStyle} required value={year} onChange={e => { setYear(e.target.value); setSubmitted(false); }}>
              <option value="">เลือกปีรถ</option>{years.map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label style={labelStyle}>รุ่นย่อย / ขนาดเครื่องยนต์
            <input style={inputStyle} required maxLength={100} value={variant} onChange={e => { setVariant(e.target.value); setSubmitted(false); }} placeholder="เช่น 1.5 E, 2.0 Turbo, EV" />
          </label>
        </fieldset>}
        {step===1 && <fieldset style={fieldStyle}><legend>2. การใช้งานและประวัติรถ</legend>
          <label style={labelStyle}>เลขไมล์ปัจจุบัน
            <select style={inputStyle} required value={mileage} onChange={e => { setMileage(e.target.value); setSubmitted(false); }}>
              <option value="">ระบุเลขไมล์</option>{["ต่ำกว่า 10,000 กม.", "10,000–30,000 กม.", "30,001–60,000 กม.", "60,001–100,000 กม.", "มากกว่า 100,000 กม."].map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <div>ลักษณะการใช้งานรถ</div>
          {usageOptions.map(x => <label key={x} style={choiceStyle}><input type="radio" name="usage" required checked={usage === x} onChange={() => { setUsage(x); setSubmitted(false); }} /> {x}</label>)}
          <div>ใน 12 เดือนที่ผ่านมา เคยแจ้งเคลมกี่ครั้ง?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
            {["0", "1", "2", "มากกว่า 3"].map(x => <label key={x} style={{ ...choiceStyle, textAlign: "center", borderColor: claims === x ? "#1569c7" : "#d5e3f5" }}><input type="radio" name="claims" required checked={claims === x} onChange={() => { setClaims(x); setSubmitted(false); }} /> {x}</label>)}
          </div>
        </fieldset>}
        {step===2 && <fieldset style={fieldStyle}><legend>3. เลือกประเภทความคุ้มครอง</legend>
          <div style={{ display: "grid", gap: 8 }}>
            {coverages.map(x => <label key={x} style={{ ...choiceStyle, background: coverage === x ? "#eaf4ff" : "white" }}><input type="radio" name="coverage" checked={coverage === x} onChange={() => { setCoverage(x); setSubmitted(false); }} /> {x}</label>)}
          </div>
          <div style={{marginTop:16}}>รูปแบบการชำระที่สนใจ</div><div className="motor-payment">{["รายปี","รายเดือน (หากบริษัทมีบริการ)"].map(x=><button type="button" key={x} className={payment===x?"selected":""} onClick={()=>setPayment(x)}>{x}</button>)}</div>
        </fieldset>}
        <div className="motor-navigation">{step>0&&<button type="button" onClick={()=>setStep(step-1)}>← ย้อนกลับ</button>}{step<2&&<button type="button" onClick={()=>setStep(step+1)}>ถัดไป →</button>}</div>
        {step===2&&<button type="submit" disabled={!complete} style={{ ...inputStyle, cursor: complete ? "pointer" : "not-allowed", color: "white", background: complete ? "#1167c5" : "#9baec2", border: 0, fontWeight: 700 }}>ดูสรุปข้อมูลและขอใบเสนอราคา</button>}
      </form>
      {submitted && <section aria-live="polite" style={{ ...fieldStyle, marginTop: 24, whiteSpace: "pre-wrap" }}>
        <h2>สรุปข้อมูลสำหรับขอใบเสนอราคา</h2>
        <p>{summary}</p>
        <p><strong>ยังไม่มีราคาเบี้ยประกันที่ยืนยันจากบริษัท</strong> ราคาจริงและความคุ้มครองจะขึ้นอยู่กับการพิจารณารับประกันของบริษัทแต่ละแห่ง</p>
        <button type="button" onClick={() => navigator.clipboard?.writeText(summary)} style={{ ...inputStyle, background: "#e8f2ff", cursor: "pointer" }}>คัดลอกข้อมูลรถ</button>
        <p><Link href={quoteUrl}>ส่งข้อมูลรถพร้อมคำขอใบเสนอราคา →</Link></p>
        <small>ระบบจะนำข้อมูลรถไปใส่ในแบบฟอร์มคำขอให้โดยอัตโนมัติ แต่จะบันทึกเมื่อคุณกดยืนยันส่งคำขอเท่านั้น</small>
      </section>}
    </main>
  );
}
const fieldStyle: React.CSSProperties = { border: "1px solid #c8dff9", borderRadius: 16, padding: 20, display: "grid", gap: 14 };
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #c8dff9", borderRadius: 10, fontSize: 16 };
const choiceStyle: React.CSSProperties = { display: "block", padding: "13px 12px", border: "1px solid #d5e3f5", borderRadius: 10, cursor: "pointer", color: "#164d91" };
