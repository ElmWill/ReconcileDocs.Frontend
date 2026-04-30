import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-6 shadow-sm",
        "border-slate-200",
        "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn("text-lg font-semibold tracking-tight text-slate-800", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardBody({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("mt-4 space-y-4 text-slate-700", className)} {...props}>
      {children}
    </div>
  );
}