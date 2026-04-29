import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-sand-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}