import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Header } from "@/components/Header";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Time-Weave",
  description: "일정과 할 일, 친구와 함께 쓰는 스마트 스케줄러",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  return (
    <html lang="ko">
      <body className="antialiased">
        <QueryProvider>
          <Header isLoggedIn={isLoggedIn} />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
