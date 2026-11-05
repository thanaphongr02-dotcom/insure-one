"use client";

import { useState } from "react";
import { supabase } from "@/Lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setMessage("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
        } else {
          setMessage("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
        }
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next?.startsWith("/quote") ? next : "/member";
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่");
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
        <span className="eyebrow">MEMBER AREA</span>

        <h1>เข้าสู่ระบบ</h1>
        <p>เข้าสู่ระบบสมาชิก INSURE ONE</p>

        <form onSubmit={handleLogin}>
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
            รหัสผ่าน
            <input
              type="password"
              placeholder="รหัสผ่าน"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p>
          ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
        </p>
      </section>
    </main>
  );
}