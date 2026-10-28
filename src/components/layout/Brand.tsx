import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandProps {
  href?: string;
  className?: string;
}

export function Brand({ href = "/", className }: BrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <ShoppingBagIcon className="size-4" />
      </span>
      <span className="text-base leading-none">
        Uiwave
        <span className="hidden text-muted-foreground sm:inline"> Commerce</span>
      </span>
    </Link>
  );
}
