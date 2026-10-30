
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/Lib/supabase";

type Company = {
  name: string;
};

type Plan = {
  id: string;
  plan_name: string;
  insurance_type: string;
  premium_amount: number | null;
  price_period: string | null;
  price_source_url: string | null;
  price_verified_at: string | null;
  price_valid_until: string | null;
  insurance_companies: Company | null;
};

export default function AdminPricesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        window.location.replace("/login");
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", auth.user.id)
          .maybeSingle();

      if (adminError || !admin) {
        setMessage("บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบ Admin");
        setLoading(false);
        return;
      }

      setAuthorized(true);

      const { data, error } = await supabase
        .from("insurance_plans")
        .select(`
          id,
          plan_name,
          insurance_type,
          premium_amount,
          price_period,
          price_source_url,
          price_verified_at,
          price_valid_until,
          insurance_companies (name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("โหลดข้อมูลไม่สำเร็จ: " + error.message);
      } else {
        setPlans((data ?? []) as unknown as Plan[]);
      }

      setLoading(false);
    }

    load();
  }, []);

  function editPlan(
    id: string,
    field: keyof Plan,
    value: string | number | null
  ) {
    setPlans((old) =>
      old.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  }

  async function savePlan(plan: Plan) {
    setMessage("");

    const amount = plan.premium_amount;

    if (
      amount !== null &&
      (!Number.isFinite(amount) || amount <= 0)
    ) {
      setMessage("กรุณากรอกราคาให้มากกว่า 0 บาท");
      return;
    }

    if (amount !== null) {
      if (
        !plan.price_period ||
        !plan.price_source_url ||
        !plan.price_valid_until
      ) {
        setMessage(
          "กรุณากรอกรอบชำระ แหล่งอ้างอิง และวันหมดอายุราคาให้ครบ"
        );
        return;
      }

      if (!/^https:\/\/.+/i.test(plan.price_source_url)) {
        setMessage("ลิงก์อ้างอิงต้องเริ่มต้นด้วย https://");
        return;
      }

      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Bangkok",
      });

      if (plan.price_valid_until < today) {
        setMessage("วันหมดอายุราคาต้องไม่เป็นวันที่ผ่านมาแล้ว");
        return;
      }
    }

    setSavingId(plan.id);

    const { data, error } = await supabase
      .from("insurance_plans")
      .update({
        premium_amount: amount,
        price_period: amount === null ? null : plan.price_period,
        price_source_url:
          amount === null ? null : plan.price_source_url,
        price_valid_until:
          amount === null ? null : plan.price_valid_until,
        price_verified_at:
          amount === null ? null : new Date().toISOString(),
      })
      .eq("id", plan.id)
      .select("id, price_verified_at")
      .single();

    if (error) {
      setMessage("บันทึกไม่สำเร็จ: " + error.message);
    } else {
      editPlan(
        plan.id,
        "price_verified_at",
        data.price_verified_at
      );
      setMessage("บันทึกราคาเรียบร้อยแล้ว");
    }

    setSavingId(null);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #d4dfeb",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    marginTop: "6px",
    background: "#fff",
    color: "#142c48",
  };

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        กำลังโหลดข้อมูล...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main style={{ padding: 40 }}>
        <h1>ไม่สามารถเข้าถึงหน้านี้ได้</h1>
        <p>{message}</p>
        <Link href="/login">เข้าสู่ระบบ</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f7fc",
        padding: "30px 18px",
        color: "#142c48",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/admin"
          style={{
            color: "#1764b3",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← กลับหน้า Admin
        </Link>

        <header style={{ margin: "26px 0" }}>
          <h1 style={{ fontSize: "30px", marginBottom: 8 }}>
            INSURE ONE
          </h1>

          <h2 style={{ fontSize: "23px", margin: 0 }}>
            จัดการราคาเบี้ยประกัน
          </h2>

          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            จัดการราคาเบี้ยประกันจากแหล่งข้อมูลที่ตรวจสอบได้
            พร้อมกำหนดวันหมดอายุของราคา
          </p>
        </header>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "16px 24px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ color: "#64748b" }}>
              จำนวนแผนประกัน
            </div>
            <strong style={{ fontSize: 27 }}>
              {plans.length}
            </strong>
          </div>

          <div
            style={{
              background: "white",
              padding: "16px 24px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ color: "#64748b" }}>
              แผนที่มีราคา
            </div>
            <strong style={{ fontSize: 27 }}>
              {
                plans.filter(
                  (p) => p.premium_amount !== null
                ).length
              }
            </strong>
          </div>
        </div>

        {message && (
          <div
            role="status"
            style={{
              background: "#eaf3ff",
              border: "1px solid #bcd8fa",
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            {message}
          </div>
        )}

        {plans.length === 0 && (
          <p>ยังไม่มีแผนประกันในระบบ</p>
        )}

        <div
          style={{
            display: "grid",
            gap: 20,
          }}
        >
          {plans.map((plan) => (
            <section
              key={plan.id}
              style={{
                background: "white",
                padding: 24,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <h3
                style={{
                  fontSize: 21,
                  marginTop: 0,
                  marginBottom: 6,
                }}
              >
                {plan.insurance_companies?.name ??
                  "ไม่ทราบบริษัท"}
              </h3>

              <p
                style={{
                  color: "#64748b",
                  marginTop: 0,
                }}
              >
                {plan.plan_name} · {plan.insurance_type}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 18,
                }}
              >
                <label>
                  ราคาเบี้ยประกัน (บาท)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={plan.premium_amount ?? ""}
                    onChange={(e) =>
                      editPlan(
                        plan.id,
                        "premium_amount",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    placeholder="เช่น 8500"
                    style={inputStyle}
                  />
                </label>

                <label>
                  รอบชำระเบี้ยประกัน
                  <select
                    value={plan.price_period ?? ""}
                    onChange={(e) =>
                      editPlan(
                        plan.id,
                        "price_period",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">เลือกรอบชำระ</option>
                    <option value="รายปี">รายปี</option>
                    <option value="รายเดือน">รายเดือน</option>
                    <option value="ครั้งเดียว">ครั้งเดียว</option>
                  </select>
                </label>

                <label>
                  URL แหล่งอ้างอิงราคา
                  <input
                    type="url"
                    value={plan.price_source_url ?? ""}
                    onChange={(e) =>
                      editPlan(
                        plan.id,
                        "price_source_url",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    style={inputStyle}
                  />
                </label>

                <label>
                  ราคามีผลถึงวันที่
                  <input
                    type="date"
                    value={plan.price_valid_until ?? ""}
                    onChange={(e) =>
                      editPlan(
                        plan.id,
                        "price_valid_until",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 14,
                  marginTop: 22,
                }}
              >
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  {plan.price_verified_at
                    ? "ตรวจสอบข้อมูลล่าสุด: " +
                      new Date(
                        plan.price_verified_at
                      ).toLocaleString("th-TH")
                    : "ยังไม่มีข้อมูลการตรวจสอบราคา"}
                </span>

                <button
                  type="button"
                  disabled={savingId !== null}
                  onClick={() => savePlan(plan)}
                  style={{
                    background: "#1764b3",
                    color: "white",
                    border: "none",
                    padding: "12px 26px",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: savingId !== null ? 0.6 : 1,
                  }}
                >
                  {savingId === plan.id
                    ? "กำลังบันทึก..."
                    : "บันทึกราคา"}
                </button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
