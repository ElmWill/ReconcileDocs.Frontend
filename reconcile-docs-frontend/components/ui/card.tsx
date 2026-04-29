import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-md", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn("text-lg font-semibold tracking-tight text-sand-100", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardBody({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("mt-4 space-y-4", className)} {...props}>
      {children}
    </div>
  );
}