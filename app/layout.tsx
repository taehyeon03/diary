import type { Metadata, Viewport } from "next";
import "@fontsource/nanum-brush-script/400.css";
import "@fontsource/gowun-batang/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "언젠간 떨어질 포스트잇",
  description: "나무 벽에 붙은 포스트잇. 언젠간 떨어지지만, 언제인지는 아무도 몰라요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c7a57b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
