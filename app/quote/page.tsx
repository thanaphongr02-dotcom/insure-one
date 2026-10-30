
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/Lib/supabase";

type QuoteRequest = {
  id: string;
  contact_name: string | null;
  contact_info: string | null;
  insurance_type: string;
  details: string | null;
  status: string;
  created_at: string;
};

type StatusHistory = {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "รอตรวจสอบ",
  reviewing: "กำลังตรวจสอบ",
  completed: "ดำเนินการเสร็จสิ้น",
  cancelled: "ยกเลิกคำขอ",
};

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const quoteId = params?.id as string;

  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuote() {
      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser();

        if (!active) return;

        if (authError || !auth.user) {
          router.replace("/login");
          return;
        }

        const { data: quoteData, error: quoteError } =
          await supabase
            .from("quote_requests")
            .select(
              "id, contact_name, contact_info, insurance_type, details, status, created_at"
            )
            .eq("id", quoteId)
            .eq("user_id", auth.user.id)
            .maybeSingle();

        if (!active) return;

        if (quoteError) {
          setErrorMessage(
            "โหลดข้อมูลคำขอไม่สำเร็จ: " + quoteError.message
          );
          return;
        }

        if (!quoteData) {
          setErrorMessage(
            "ไม่พบคำขอนี้ หรือคุณไม่มีสิทธิ์เข้าถึง"
          );
          return;
        }

        setQuote(quoteData as QuoteRequest);

        const { data: historyData, error: historyQueryError } =
          await supabase
            .from("quote_status_history")
            .select("id, old_status, new_status, changed_at")
            .eq("quote_id", quoteId)
            .order("changed_at", { ascending: true });

        if (!active) return;

        if (historyQueryError) {
          setHistoryError(
            "ไม่สามารถโหลดประวัติสถานะได้: " +
              historyQueryError.message
          );
        } else {
          setHistory((historyData ?? []) as StatusHistory[]);
        }
      } catch {
        if (active) {
          setErrorMessage(
            "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (quoteId) {
      void loadQuote();
    } else {
      setErrorMessage("ไม่พบรหัสคำขอ");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [quoteId, router]);

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #dbe6f3",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        กำลังโหลดรายละเอียดคำขอ...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f7fc",
        padding: "32px 18px",
        color: "#142c48",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link
          href="/member"
          style={{
            color: "#1764b3",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← กลับหน้า Member Dashboard
        </Link>

        <header style={{ margin: "28px 0" }}>
          <div
            style={{
              color: "#1764b3",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            INSURE ONE · QUOTE TRACKING
          </div>

          <h1 style={{ fontSize: 30, marginBottom: 8 }}>
            ติดตามสถานะใบเสนอราคา
          </h1>

          <p style={{ color: "#64748b" }}>
            ตรวจสอบรายละเอียดและความคืบหน้าคำขอของคุณ
          </p>
        </header>

        {errorMessage ? (
          <section style={cardStyle}>
            <p role="alert" style={{ color: "#b91c1c" }}>
              {errorMessage}
            </p>
          </section>
        ) : quote ? (
          <>
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>
                รายละเอียดคำขอ
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: 16,
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <strong>ประเภทประกัน</strong>
                  <div>{quote.insurance_type}</div>
                </div>

                <div>
                  <strong>ชื่อผู้ติดต่อ</strong>
                  <div>{quote.contact_name || "ไม่ระบุ"}</div>
                </div>

                <div>
                  <strong>ข้อมูลติดต่อ</strong>
                  <div>{quote.contact_info || "ไม่ระบุ"}</div>
                </div>

                <div>
                  <strong>วันที่ส่งคำขอ</strong>
                  <div>{formatDate(quote.created_at)}</div>
                </div>

                <div>
                  <strong>สถานะปัจจุบัน</strong>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: 6,
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: "#e8f2ff",
                      color: "#1764b3",
                      fontWeight: 700,
                    }}
                  >
                    {getStatusLabel(quote.status)}
                  </div>
                </div>

                {quote.details && (
                  <div>
                    <strong>รายละเอียดเพิ่มเติม</strong>
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        color: "#475569",
                        marginBottom: 0,
                      }}
                    >
                      {quote.details}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>
                ประวัติการติดตามสถานะ
              </h2>

              <p style={{ color: "#64748b" }}>
                ระบบจะแสดงประวัติเมื่อเจ้าหน้าที่เปลี่ยนสถานะคำขอ
              </p>

              <div
                style={{
                  borderLeft: "3px solid #c6dbf5",
                  marginLeft: 10,
                  paddingLeft: 24,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    paddingBottom: 24,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: -33,
                      top: 3,
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      background: "#1764b3",
                      border: "3px solid #ffffff",
                    }}
                  />

                  <strong>ส่งคำขอใบเสนอราคา</strong>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                      marginTop: 5,
                    }}
                  >
                    {formatDate(quote.created_at)}
                  </div>
                </div>

                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      position: "relative",
                      paddingBottom: 24,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: -33,
                        top: 3,
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        background: "#1764b3",
                        border: "3px solid #ffffff",
                      }}
                    />

                    <strong>
                      เปลี่ยนสถานะเป็น{" "}
                      {getStatusLabel(item.new_status)}
                    </strong>

                    {item.old_status && (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 13,
                          marginTop: 5,
                        }}
                      >
                        จาก {getStatusLabel(item.old_status)}
                      </div>
                    )}

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                        marginTop: 5,
                      }}
                    >
                      {formatDate(item.changed_at)}
                    </div>
                  </div>
                ))}
              </div>

              {historyError ? (
                <p role="alert" style={{ color: "#b91c1c" }}>
                  {historyError}
                </p>
              ) : history.length === 0 ? (
                <p style={{ color: "#64748b" }}>
                  ยังไม่มีประวัติการเปลี่ยนสถานะที่บันทึกไว้
                  ประวัติจะเริ่มแสดงเมื่อมีการเปลี่ยนสถานะ
                  หลังเปิดใช้งานระบบบันทึกประวัติ
                </p>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
