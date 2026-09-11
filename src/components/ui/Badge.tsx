import type { ReactNode } from "react";

const variants = {
  primary: "bg-primary-light text-primary-dark",
  accent: "bg-accent-light text-accent",
  muted: "bg-muted text-foreground-muted",
  danger: "bg-danger/10 text-danger",
};

export default function Badge({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
