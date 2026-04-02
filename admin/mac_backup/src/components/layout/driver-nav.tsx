"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  IconDashboard,
  IconList,
  IconBeach,
  IconLogout,
} from "@tabler/icons-react";

const navItems = [
  { href: "/driver/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/driver/orders", label: "Aufträge", icon: IconList },
  { href: "/driver/vacation", label: "Urlaub", icon: IconBeach },
];

export function DriverNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <img src="/logo.png" alt="Knipserl" className="h-7 w-auto" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userName}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconLogout className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="mx-auto flex max-w-2xl">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
