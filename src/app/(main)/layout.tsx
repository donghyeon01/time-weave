import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/");
  }

  return (
    <>
      <Header isLoggedIn={!!accessToken} />
      {children}
    </>
  );
}
