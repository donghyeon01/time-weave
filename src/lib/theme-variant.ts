export const techniques = {
  clay: {
    base: "rounded-2xl  transition-all duration-150",
    shadow: "shadow-clay",
    pressed: "active:shadow-clay-pressed",
    active: "active:translate-y-0.5 active:scale-[0.98]",
  },
  glass: {
    base: "rounded-2xl border border-white/20 backdrop-blur-lg transition-all duration-150",
    shadow: "shadow-glass",
    pressed: "active:shadow-glass-pressed",
    active: "active:scale-[0.98]",
  },
  flat: {
    base: "rounded-lg border border-black/10 transition-colors",
    shadow: "shadow-none",
    pressed: "active:shadow-none",
    active: "active:brightness-95 active:translate-y-px",
  },
} as const;

export type TechniqueKey = keyof typeof techniques;
