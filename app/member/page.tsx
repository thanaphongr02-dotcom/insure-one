
"use client";

import "./member.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/Lib/supabase";

type QuoteRequest = {
  id: string;
  insurance_type: string;
  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "รอตรวจสอบ",
  reviewing: "กำลังตรวจสอบ",
  completed: "ดำเนินการเสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export default function MemberPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMember() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) return;

        if (error || !data.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);

        const { data: quoteData, error: quoteError } =
          await supabase
            .from("quote_requests")
            .select("id, insurance_type, status, created_at")
            .eq("user_id", data.user.id)
            .order("created_at", { ascending: false });

        if (!active) return;

        if (quoteError) {
          setQuotesError(
            `โหลดคำขอไม่สำเร็จ: ${quoteError.message}`
          );
        } else {
          setQuotes(quoteData ?? []);
        }
      } catch {
        if (active) {
          setErrorMessage(
            "ไม่สามารถเชื่อมต่อข้อมูลสมาชิกได้ กรุณาลองใหม่"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setQuotesLoading(false);
        }
      }
    }

    void loadMember();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setSigningOut(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMessage(
          "ออกจากระบบไม่สำเร็จ กรุณาลองใหม่"
        );
        return;
      }

      router.replace("/login");
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <main className="member-loading">
        กำลังตรวจสอบข้อมูลสมาชิก...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="member-loading">
        <p>{errorMessage || "กรุณาเข้าสู่ระบบ"}</p>
        <Link href="/login">ไปหน้าเข้าสู่ระบบ</Link>
      </main>
    );
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "สมาชิก INSURE ONE";

  const phone =
    typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : "ยังไม่ได้ระบุ";

  const pendingCount = quotes.filter(
    (quote) => quote.status === "pending"
  ).length;

  return (
    <main className="member-dashboard">
      <header className="member-header">
        <Link href="/" className="member-brand">
          <span className="member-brand-icon">I</span>
          <span>
            <strong>INSURE ONE</strong>
            <small>ประกันครบ เลือกง่าย</small>
          </span>
        </Link>

        <nav className="member-header-actions">
          <Link href="/">หน้าแรก</Link>
          <Link href="/products">เลือกประกัน</Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="member-logout"
          >
            {signingOut ? "กำลังออก..." : "ออกจากระบบ"}
          </button>
        </nav>
      </header>

      <div className="member-container">
        <section className="member-welcome">
          <span className="member-eyebrow">
            MEMBER DASHBOARD
          </span>

          <h1>สวัสดี, {fullName}</h1>

          <p>
            ยินดีต้อนรับสู่พื้นที่สมาชิก INSURE ONE
            จัดการข้อมูลและบริการประกันของคุณได้ในที่เดียว
          </p>
          <div className="member-hero-actions"><Link href="/quote" className="member-hero-primary">ขอคำปรึกษา / ใบเสนอราคา →</Link><Link href="/products" className="member-hero-secondary">สำรวจประเภทประกัน</Link></div>
          <div className="member-hero-note">ติดตามคำขอได้จากบัญชีของคุณ · ไม่มีการเรียกเก็บเงินผ่านหน้านี้</div>
        </section>

        <section className="member-overview">
          <div className="member-stat">
            <span>กรมธรรม์ของฉัน</span>
            <strong>—</strong>
            <small>รอเชื่อมต่อฐานข้อมูลกรมธรรม์</small>
          </div>

          <div className="member-stat">
            <span>คำขอใบเสนอราคา</span>
            <strong>
              {quotesLoading
                ? "..."
                : quotesError
                ? "—"
                : quotes.length}
            </strong>
            <small>
              {quotesError
                ? "ไม่สามารถโหลดข้อมูลได้"
                : "จำนวนคำขอที่ส่งเข้าระบบ"}
            </small>
          </div>

          <div className="member-stat">
            <span>คำขอที่รอตรวจสอบ</span>
            <strong>
              {quotesLoading
                ? "..."
                : quotesError
                ? "—"
                : pendingCount}
            </strong>
            <small>สถานะ pending จาก Supabase</small>
          </div>
        </section>

        <section className="member-section">
          <div className="member-section-heading">
            <span className="member-eyebrow">
              YOUR SERVICES
            </span>
            <h2>บริการสำหรับสมาชิก</h2>
          </div>

          <div className="member-service-grid">
            <Link
              href="/products"
              className="member-service"
            >
              <span className="member-service-icon">🛡️</span>
              <h3>เลือกผลิตภัณฑ์ประกัน</h3>
              <p>
                ค้นหาประกันที่เหมาะกับความต้องการของคุณ
              </p>
              <span className="member-service-action">
                ดูผลิตภัณฑ์ →
              </span>
            </Link>

            <Link
              href="/quote"
              className="member-service"
            >
              <span className="member-service-icon">📋</span>
              <h3>ขอใบเสนอราคา</h3>
              <p>ส่งข้อมูลให้เจ้าหน้าที่ติดต่อกลับ</p>
              <span className="member-service-action">
                ส่งคำขอ →
              </span>
            </Link>

            <div className="member-service member-service-pending">
              <span className="member-service-icon">📄</span>
              <h3>กรมธรรม์ของฉัน</h3>
              <p>ดูรายละเอียดกรมธรรม์และความคุ้มครอง</p>
              <span className="member-service-note">
                อยู่ระหว่างพัฒนา
              </span>
            </div>

            <div className="member-service member-service-pending">
              <span className="member-service-icon">🔄</span>
              <h3>ต่ออายุประกัน</h3>
              <p>ตรวจสอบกรมธรรม์ที่ใกล้หมดอายุ</p>
              <span className="member-service-note">
                อยู่ระหว่างพัฒนา
              </span>
            </div>
          </div>
        </section>

        <section className="member-profile">
          <div>
            <span className="member-eyebrow">
              MY QUOTE REQUESTS
            </span>

            <h2>รายการคำขอใบเสนอราคาของฉัน</h2>
            <p>
              ติดตามสถานะคำขอที่ส่งผ่าน INSURE ONE
            </p>
          </div>

          {quotesLoading ? (
            <p>กำลังโหลดรายการคำขอ...</p>
          ) : quotesError ? (
            <p role="alert" className="member-error">
              {quotesError}
            </p>
          ) : quotes.length === 0 ? (
            <p>ยังไม่มีคำขอใบเสนอราคา</p>
          ) : (
            <div className="member-quote-list">
              {quotes.map((quote) => (
                <div
                  className="member-quote-item"
                  key={quote.id}
                >
                  <div>
                    <strong>{quote.insurance_type}</strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: 6,
                      }}
                    >
                      ส่งเมื่อ{" "}
                      {new Date(
                        quote.created_at
                      ).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Bangkok",
                      })}
                    </small>

                    {/* เพิ่มปุ่มติดตามสถานะ */}
                    <Link
                      href={`/member/quotes/${quote.id}`}
                      style={{
                        display: "inline-block",
                        marginTop: 12,
                        padding: "9px 15px",
                        background: "#1764b3",
                        color: "#ffffff",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      ดูรายละเอียด / ติดตามสถานะ →
                    </Link>
                  </div>

                  <span className="member-quote-status">
                    {statusLabels[quote.status] ??
                      quote.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="member-profile">
          <div>
            <span className="member-eyebrow">
              ACCOUNT INFORMATION
            </span>
            <h2>ข้อมูลส่วนตัว</h2>
            <p>ข้อมูลบัญชีที่บันทึกไว้ในระบบสมาชิก</p>
          </div>

          <div className="member-profile-details">
            <div>
              <span>ชื่อ-นามสกุล</span>
              <strong>{fullName}</strong>
            </div>
            <div>
              <span>อีเมล</span>
              <strong>
                {user.email || "ไม่พบข้อมูล"}
              </strong>
            </div>
            <div>
              <span>เบอร์โทรศัพท์</span>
              <strong>{phone}</strong>
            </div>
          </div>
        </section>

        {errorMessage && (
          <p role="alert" className="member-error">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}
