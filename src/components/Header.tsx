"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { http } from "@/lib/api";

const navItems = [
  { href: "/todos", label: "ToDo" },
  { href: "/calendar", label: "캘린더" },
  { href: "/friends", label: "친구" },
  { href: "/scheduling", label: "조율" },
  { href: "/me", label: "내 정보" },
];

interface HeaderProps {
  isLoggedIn: boolean;
}

export function Header({ isLoggedIn }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await http.post("auth/logout");
    queryClient.clear();
    window.location.href = "/";
  };

  const linkBase =
    "rounded-xl px-4 py-2 text-sm font-semibold shadow-glass transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-white/80 shadow-glass backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-text">
          Time-Weave
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {isLoggedIn &&
            navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  linkBase,
                  pathname === item.href
                    ? "bg-primary-dark text-white"
                    : "bg-white text-text hover:bg-primary",
                )}>
                {item.label}
              </Link>
            ))}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="rounded-xl bg-fail px-4 py-2 text-sm font-semibold text-fail-dark shadow-glass">
              로그아웃
            </button>
          ) : (
            <Link
              href="/"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-dark shadow-glass">
              시작하기
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-xl p-2 shadow-glass md:hidden"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}>
          {menuOpen ? "닫기" : "메뉴"}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-text-muted/10 px-4 pb-4 md:hidden">
          <ul className="mt-3 space-y-2">
            {isLoggedIn &&
              navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block",
                      linkBase,
                      pathname === item.href
                        ? "bg-primary-dark text-white"
                        : "bg-white text-text",
                    )}>
                    {item.label}
                  </Link>
                </li>
              ))}
            <li>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-xl bg-fail px-4 py-2 text-left text-sm font-semibold text-fail-dark shadow-glass">
                  로그아웃
                </button>
              ) : (
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-dark shadow-glass">
                  시작하기
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
