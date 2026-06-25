import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NiBiGo AI Planner — Tạo tour Ninh Bình rõ lịch trình, rõ chi phí",
  description:
    "Tạo phương án tour Ninh Bình theo ngân sách, sở thích và thành phần đoàn. Xem 3 gói gợi ý, chi phí minh bạch và gửi yêu cầu để Sales xác nhận trước khi đặt.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={lora.variable}>
      <body className={`${lora.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
