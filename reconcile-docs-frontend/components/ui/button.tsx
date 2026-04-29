import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

export function Button({ className, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}