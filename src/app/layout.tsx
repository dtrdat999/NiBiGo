import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NiBiGo AI Travel Platform — Lập kế hoạch tour Ninh Bình cá nhân hóa",
  description:
    "Tạo tour Ninh Bình trọn gói cá nhân hóa theo ngân sách, sở thích và thành phần đoàn. Lịch trình rõ ràng, chi phí minh bạch, chỉnh tour bằng AI.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
