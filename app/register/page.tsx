"use client";

import { useState } from "react";
import { supabase } from "@/Lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (!acknowledged) {
      setMessage("กรุณาอ่านและรับทราบข้อมูลส่วนบุคคลก่อนสมัครสมาชิก");
      return;
    }

    if (password.length < 8) {
      setMessage("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setMessage("อีเมลนี้อาจเคยสมัครแล้ว กรุณาลองเข้าสู่ระบบ");
        return;
      }

      if (data.session) {
        setMessage("สมัครสมาชิกสำเร็จแล้ว สามารถเข้าสู่ระบบได้");
      } else {
        setMessage("สมัครสมาชิกแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
      }

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setAcknowledged(false);
    } catch {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page">
      <a className="back-link" href="/">
        ← กลับหน้าแรก
      </a>

      <section className="form-card">
        <span className="eyebrow">JOIN INSURE ONE</span>
        <h1>สมัครสมาชิก</h1>
        <p>สร้างบัญชีเพื่อเริ่มต้นใช้งาน INSURE ONE</p>

        <form onSubmit={handleRegister}>
          <label>
            ชื่อ-นามสกุล
            <input
              type="text"
              placeholder="ชื่อ-นามสกุล"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            อีเมล
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            เบอร์โทรศัพท์
            <input
              type="tel"
              placeholder="เบอร์โทรศัพท์"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label>
            รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)
            <input
              type="password"
              placeholder="ตั้งรหัสผ่าน"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="check" style={{ alignItems: "flex-start", fontWeight: 400 }}>
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} required />
            <span>ฉันได้อ่าน <a href="/privacy" target="_blank" rel="noopener noreferrer">ข้อมูลส่วนบุคคล</a> และ <a href="/terms" target="_blank" rel="noopener noreferrer">เงื่อนไขการใช้บริการ</a> แล้ว (การรับทราบนี้ไม่ใช่ความยินยอมเพื่อการตลาด)</span>
          </label>

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p>
          มีบัญชีแล้ว? <a href="/login">เข้าสู่ระบบ</a>
        </p>
      </section>
    </main>
  );
}