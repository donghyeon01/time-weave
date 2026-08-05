import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cn } from "@/lib/cn";
import { techniques } from "@/lib/theme-variant";
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

  const buttonBase = cn(
    "inline-flex w-full items-center justify-center px-8 py-4 text-center text-base font-semibold",
    techniques.clay.base,
    techniques.clay.shadow,
    techniques.clay.pressed,
    techniques.clay.active,
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,var(--color-background)_55%,var(--color-secondary)_100%)]">
      <section
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl bg-white/70 p-8",
          techniques.glass.base,
          techniques.glass.shadow,
        )}>
        <div className="relative h-40 w-40">
          <Image
            src="/img/logo.png"
            alt="Time-Weave 로고"
            fill
            unoptimized
            priority
            sizes="160px"
            className="object-contain"
          />
        </div>

        <div className="relative mt-4 h-16 w-72">
          <Image
            src="/img/typo.png"
            alt="Time-Weave"
            fill
            unoptimized
            priority
            sizes="(max-width: 768px) 80vw, 320px"
            className="object-contain"
          />
        </div>

        <p className="mt-2 text-center text-text-muted">
          일정, 할 일, 친구를 하나로 엮는 스마트 스케줄러
        </p>

        <div className="mt-10 flex w-full flex-col gap-4">
          <Link
            href="/api/auth/signin/kakao"
            className={cn(
              buttonBase,
              "bg-(--color-yellow) text-(--color-yellow-dark)",
            )}
            style={
              {
                "--shadow-color": "var(--color-yellow-dark)",
              } as React.CSSProperties
            }>
            Kakao로 시작하기
          </Link>
          <Link
            href="/api/auth/signin/google"
            className={cn(buttonBase, "bg-(--color-white) text-(--color-text)")}
            style={
              { "--shadow-color": "var(--color-text)" } as React.CSSProperties
            }>
            Google로 시작하기
          </Link>
        </div>

        {error && (
          <p className="mt-6 text-fail-dark">
            로그인 중 오류가 발생했습니다: {error}
          </p>
        )}
      </section>
    </main>
  );
}
