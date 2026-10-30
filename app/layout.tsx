import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INSURE ONE | ประกันครบ เลือกง่าย",
  description: "ค้นหาและเปรียบเทียบผลิตภัณฑ์ประกันจากผู้ให้บริการที่เกี่ยวข้อง",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
