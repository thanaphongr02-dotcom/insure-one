"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const carBrands: Record<string, string[]> = {
  Toyota: ["Yaris", "Yaris Ativ", "Corolla Altis", "Camry", "Hilux Revo", "Fortuner", "Corolla Cross"],
  Honda: ["City", "Civic", "Accord", "HR-V", "CR-V", "Jazz"],
  Isuzu: ["D-Max", "MU-X"],
  Mitsubishi: ["Triton", "Pajero Sport", "Xpander"],
  Mazda: ["Mazda 2", "Mazda 3", "CX-3", "CX-5", "CX-30"],
  Nissan: ["Almera", "Navara", "Kicks", "GT-R"],
  Ford: ["Ranger", "Everest"],
  Suzuki: ["Swift", "Celerio", "Ertiga"],
  MG: ["MG3", "MG5", "ZS", "HS", "MG4"],
  BMW: ["3 Series", "5 Series", "X1", "X3"],
  Mercedes: ["C-Class", "E-Class", "GLC"],
  BYD: ["Dolphin", "Atto 3", "Seal"],
  Other: ["รุ่นอื่น ๆ"],
};
const usageOptions = ["ใช้ส่วนตัว", "รับส่งผู้โดยสารหรือบริการเดลิเวอรี่", "ให้เช่ารถ ระยะสั้น", "ให้เช่ารถ ระยะยาว", "การใช้รถเพื่อประกอบอาชีพหรือธุรกิจแบบอื่น ๆ"];
const coverages = ["ประกันชั้น 1", "ประกันชั้น 2+", "ประกันชั้น 3+", "ประกันชั้น 2", "ประกันชั้น 3", "พ.ร.บ."];
const years = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() + 1 - i));

export default function MotorQuoteWizard() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [variant, setVariant] = useState("");
  const [mileage, setMileage] = useState("");
  const [usage, setUsage] = useState("");
  const [claims, setClaims] = useState("");
  const [coverage, setCoverage] = useState("ประกันชั้น 1");
  const [submitted, setSubmitted] = useState(false);
  const models = useMemo(() => carBrands[brand] ?? [], [brand]);
  const complete = Boolean(brand && model && year && variant.trim() && mileage && usage && claims);
  const summary = [`ยี่ห้อ: ${brand}`, `รุ่น: ${model}`, `ปี: ${year}`, `รุ่นย่อย/เครื่องยนต์: ${variant}`, `เลขไมล์: ${mileage}`, `การใช้งาน: ${usage}`, `เคลม 12 เดือน: ${claims} ครั้ง`, `แผนที่สนใจ: ${coverage}`].join("\n");
  const quoteUrl = "/quote?" + new URLSearchParams({ insurance_type: "ประกันรถยนต์", motor_details: summary }).toString();
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "36px 18px 80px", color: "#164d91", lineHeight: 1.6 }}>
      <Link href="/">← กลับหน้าหลัก</Link>
      <header style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 42 }}>🚙</div>
        <h1 style={{ marginBottom: 8 }}>เช็กแผนประกันรถยนต์</h1>
        <p>บอกรายละเอียดรถและการใช้งาน เพื่อให้เจ้าหน้าที่จัดหาใบเสนอราคาจากบริษัทที่ได้รับอนุญาต</p>
      </header>
      <form onSubmit={e => { e.preventDefault(); if (complete) setSubmitted(true); }} style={{ display: "grid", gap: 20 }}>
        <fieldset style={fieldStyle}><legend>1. รายละเอียดรถ</legend>
          <label style={labelStyle}>ยี่ห้อรถ
            <select style={inputStyle} required value={brand} onChange={e => { setBrand(e.target.value); setModel(""); setSubmitted(false); }}>
              <option value="">เลือกยี่ห้อรถ</option>{Object.keys(carBrands).map(x => <option key={x} value={x}>{x === "Other" ? "ยี่ห้ออื่น ๆ" : x}</option>)}
            </select>
          </label>
          <label style={labelStyle}>รุ่นรถ
            <select style={inputStyle} required value={model} disabled={!brand} onChange={e => { setModel(e.target.value); setSubmitted(false); }}>
              <option value="">เลือกรุ่นรถ</option>{models.map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label style={labelStyle}>ปีรถ
            <select style={inputStyle} required value={year} onChange={e => { setYear(e.target.value); setSubmitted(false); }}>
              <option value="">เลือกปีรถ</option>{years.map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label style={labelStyle}>รุ่นย่อย / ขนาดเครื่องยนต์
            <input style={inputStyle} required maxLength={100} value={variant} onChange={e => { setVariant(e.target.value); setSubmitted(false); }} placeholder="เช่น 1.5 E, 2.0 Turbo, EV" />
          </label>
        </fieldset>
        <fieldset style={fieldStyle}><legend>2. การใช้งานและประวัติรถ</legend>
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
        </fieldset>
        <fieldset style={fieldStyle}><legend>3. เลือกประเภทความคุ้มครอง</legend>
          <div style={{ display: "grid", gap: 8 }}>
            {coverages.map(x => <label key={x} style={{ ...choiceStyle, background: coverage === x ? "#eaf4ff" : "white" }}><input type="radio" name="coverage" checked={coverage === x} onChange={() => { setCoverage(x); setSubmitted(false); }} /> {x}</label>)}
          </div>
        </fieldset>
        <button type="submit" disabled={!complete} style={{ ...inputStyle, cursor: complete ? "pointer" : "not-allowed", color: "white", background: complete ? "#1167c5" : "#9baec2", border: 0, fontWeight: 700 }}>ดูสรุปข้อมูลและขอใบเสนอราคา</button>
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
