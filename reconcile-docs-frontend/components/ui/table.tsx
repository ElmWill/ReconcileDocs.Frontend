import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

export function Table({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLTableElement>>) {
  return (
    <table className={cn("w-full border-collapse text-left text-sm text-sand-100", className)} {...props}>
      {children}
    </table>
  );
}