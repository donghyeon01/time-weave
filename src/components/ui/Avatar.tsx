"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: number;
  alt?: string;
  className?: string;
}

export function Avatar({
  src,
  fallback,
  size = 64,
  alt = "프로필",
  className,
}: AvatarProps) {
  const initial = fallback[0] ?? "";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-primary-dark",
        className,
      )}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          className="object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
}
