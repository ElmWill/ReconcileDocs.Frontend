import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-sand-100 placeholder:text-sand-100/40 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/30",
        className
      )}
      {...props}
    />
  );
}