import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서울시 공영주차장 안내",
  description: "서울시 공영주차장 정보를 카카오맵에서 확인하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

