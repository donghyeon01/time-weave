import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cn } from "@/lib/cn";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

interface HomePageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    redirect("/todos");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-foreground">Time-Weave</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        일정, 할 일, 친구를 하나로 엮는 스마트 스케줄러
      </p>

      <div className="mt-10 flex flex-col gap-4">
        <Link
          href="/api/auth/signin/kakao"
          className={cn(
            "rounded-2xl px-8 py-4 text-center font-semibold shadow-clay",
            "bg-[#FEE500] text-[#391919] hover:shadow-clay-pressed",
          )}>
          Kakao로 시작하기
        </Link>
        <Link
          href="/api/auth/signin/google"
          className={cn(
            "rounded-2xl px-8 py-4 text-center font-semibold shadow-clay",
            "bg-white text-text hover:shadow-clay-pressed",
          )}>
          Google로 시작하기
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-fail-dark">
          로그인 중 오류가 발생했습니다: {error}
        </p>
      )}
    </main>
  );
}
