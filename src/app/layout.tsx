import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 知识图鉴",
  description: "50个AI核心概念的交互式图鉴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
