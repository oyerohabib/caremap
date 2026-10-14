"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTenant } from "./tenant-context";

export function TenantHeader() {
  const { slug, name } = useTenant();
  const pathname = usePathname();
  const links = [
    { href: `/t/${slug}/intake`, label: "Patient intake" },
    { href: `/t/${slug}/provider`, label: "Provider" },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="size-3 shrink-0 rounded-full bg-brand ring-4 ring-brand-accent/25" aria-hidden="true" />
        <span className="truncate font-semibold tracking-tight">{name}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">via CareMap</span>
      </Link>
      <nav aria-label="Demo views">
        <ul className="flex items-center gap-1 rounded-lg bg-muted p-0.5 text-sm">
          {links.map((link) => {
            const current = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2.5 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    current && "bg-background text-foreground shadow-xs",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
