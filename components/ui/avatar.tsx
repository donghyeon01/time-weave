import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/cn";
import { colors, type ColorKey } from "@/lib/theme";
import { techniques, type TechniqueKey } from "@/lib/theme-variant";

export interface AvatarProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Image>,
  "src" | "alt" | "width" | "height"
> {
  color?: ColorKey;
  technique?: TechniqueKey;
  size?: "sm" | "md" | "lg";
  fallback?: string;
  src?: string;
  alt?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({
  color = "primary",
  technique = "clay",
  size = "md",
  fallback,
  src,
  alt = "",
  className,
  ...props
}: AvatarProps) {
  const c = colors[color];
  const t = techniques[technique];
  const isGlass = technique === "glass";

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={sizeMap[size]}
        height={sizeMap[size]}
        unoptimized
        className={cn(
          "inline-block object-cover",
          "rounded-full",
          sizeClasses[size],
          "bg-[var(--bg-color)] text-[var(--text-color)]",
          t.base,
          t.shadow,
          className,
        )}
        style={
          {
            "--bg-color": isGlass
              ? `color-mix(in srgb, ${c.bg} 20%, transparent)`
              : c.bg,
            "--text-color": c.text,
            "--shadow-color": c.shadowColor,
          } as React.CSSProperties
        }
        {...props}
      />
    );
  }

  return (
    <div
      aria-label={alt}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-full",
        sizeClasses[size],
        "bg-[var(--bg-color)] text-[var(--text-color)]",
        "font-semibold",
        t.base,
        t.shadow,
        className,
      )}
      style={
        {
          "--bg-color": isGlass
            ? `color-mix(in srgb, ${c.bg} 20%, transparent)`
            : c.bg,
          "--text-color": c.text,
          "--shadow-color": c.shadowColor,
        } as React.CSSProperties
      }
      {...props}>
      {fallback}
    </div>
  );
}
