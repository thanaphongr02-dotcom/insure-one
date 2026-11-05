"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/Lib/supabase";

type AccessState = "checking" | "allowed" | "signed-out" | "denied" | "error";

/**
 * Client-side UX gate only. Database RLS and storage policies MUST enforce
 * authorization independently: hiding admin pages is not a security boundary.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    let active = true;
    let request = 0;

    async function checkAccess() {
      const current = ++request;
      if (active) setAccess("checking");
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (!active || current !== request) return;
        if (authError) { setAccess("signed-out"); return; }
        if (!auth.user) { setAccess("signed-out"); return; }

        const { data, error } = await supabase.from("admin_users")
          .select("user_id").eq("user_id", auth.user.id).maybeSingle();
        if (!active || current !== request) return;
        if (error) { setAccess("error"); return; }
        setAccess(data ? "allowed" : "denied");
      } catch {
        if (active && current === request) setAccess("error");
      }
    }

    void checkAccess();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Defer querying Supabase until the auth callback has completed.
      Promise.resolve().then(() => { if (active) void checkAccess(); });
    });
    return () => { active = false; request++; subscription.unsubscribe(); };
  }, []);

  if (access === "allowed") return <>{children}</>;

  const messages: Record<Exclude<AccessState, "allowed">, string> = {
    checking: "กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...",
    "signed-out": "กรุณาเข้าสู่ระบบก่อนเข้าหน้าผู้ดูแลระบบ",
    denied: "บัญชีนี้ไม่ได้รับอนุญาตให้เข้าถึงหน้าผู้ดูแลระบบ",
    error: "ไม่สามารถตรวจสอบฐานข้อมูลผู้ดูแลระบบได้ กรุณาตรวจสอบการตั้งค่า Supabase และสิทธิ์การอ่านตาราง admin_users",
  };
  return <main style={{ maxWidth: 640, margin: "72px auto", padding: 24, lineHeight: 1.8 }}>
    <h1>INSURE ONE · Admin</h1>
    <p role="status">{messages[access]}</p>
    {access === "signed-out" ? <Link href="/login">เข้าสู่ระบบ</Link> :
      access !== "checking" ? <Link href="/member">กลับหน้าสมาชิก</Link> : null}
  </main>;
}
