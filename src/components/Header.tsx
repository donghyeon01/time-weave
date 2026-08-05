"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { http } from "@/lib/api";
import { techniques } from "@/lib/theme-variant";
import { Button } from "@/components/ui/Button";

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

  const activeStyle = {
    "--bg-color": "var(--color-primary-dark)",
    "--text-color": "#ffffff",
    "--shadow-color": "var(--color-primary-dark)",
  } as React.CSSProperties;

  const inactiveStyle = {
    "--bg-color": "var(--color-white)",
    "--text-color": "var(--color-text)",
    "--shadow-color": "var(--color-text)",
  } as React.CSSProperties;

  const startStyle = {
    "--bg-color": "var(--color-primary)",
    "--text-color": "var(--color-primary-dark)",
    "--shadow-color": "var(--color-primary-dark)",
  } as React.CSSProperties;

  const linkBase = cn(
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold",
    "bg-(--bg-color) text-(--text-color)",
    techniques.clay.base,
    techniques.clay.shadow,
    techniques.clay.pressed,
    techniques.clay.active,
  );

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
                style={pathname === item.href ? activeStyle : inactiveStyle}
                className={cn(
                  linkBase,
                  pathname === item.href ? "" : "hover:bg-primary/80",
                )}>
                {item.label}
              </Link>
            ))}

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              color="fail"
              className="px-4 py-2 text-xs">
              로그아웃
            </Button>
          ) : (
            <Link href="/" style={startStyle} className={linkBase}>
              시작하기
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-2xl p-2 shadow-clay md:hidden"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu">
          {menuOpen ? "닫기" : "메뉴"}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-text-muted/10 px-4 pb-4 md:hidden">
          <ul className="mt-3 space-y-2">
            {isLoggedIn &&
              navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={pathname === item.href ? activeStyle : inactiveStyle}
                    className={cn("block", linkBase)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            <li>
              {isLoggedIn ? (
                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  color="fail"
                  className="w-full px-4 py-2 text-left text-xs">
                  로그아웃
                </Button>
              ) : (
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  style={startStyle}
                  className={cn("block", linkBase)}>
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
