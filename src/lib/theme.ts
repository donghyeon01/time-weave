export const colors = {
  primary: {
    bg: "var(--color-primary)",
    text: "var(--color-primary-dark)",
    shadowColor: "var(--color-primary-dark)",
  },
  secondary: {
    bg: "var(--color-secondary)",
    text: "var(--color-secondary-dark)",
    shadowColor: "var(--color-secondary-dark)",
  },
  success: {
    bg: "var(--color-success)",
    text: "var(--color-success-dark)",
    shadowColor: "var(--color-success-dark)",
  },
  fail: {
    bg: "var(--color-fail)",
    text: "var(--color-fail-dark)",
    shadowColor: "var(--color-fail-dark)",
  },
  warning: {
    bg: "var(--color-warning)",
    text: "var(--color-warning-dark)",
    shadowColor: "var(--color-warning-dark)",
  },
  yellow: {
    bg: "var(--color-yellow)",
    text: "var(--color-yellow-dark)",
    shadowColor: "var(--color-yellow-dark)",
  },
  white: {
    bg: "var(--color-white)",
    text: "var(--color-text)",
    shadowColor: "var(--color-text)",
  },
} as const;

export type ColorKey = keyof typeof colors;
