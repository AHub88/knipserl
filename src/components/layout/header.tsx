"use client";

import { signOut, useSession } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconLogout, IconUser, IconChevronDown } from "@tabler/icons-react";

const roleLabels: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Administrator",
    className: "bg-[#F6A11C]/15 text-[#F6A11C] border border-[#F6A11C]/30",
  },
  ADMIN_ACCOUNTING: {
    label: "Buchhaltung",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  DRIVER: {
    label: "Fahrer",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
};

export function Header() {
  const { data: session } = useSession();
  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const role = session?.user?.role ?? "";
  const roleConfig = roleLabels[role] ?? {
    label: role,
    className: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30",
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="text-zinc-400 hover:text-zinc-200 transition-colors" />
      <Separator
        orientation="vertical"
        className="h-5 bg-white/[0.08]"
      />

      <div className="flex-1" />

      {session?.user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              buttonVariants({ variant: "ghost" }) +
              " gap-2.5 h-9 px-2.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            }
          >
            <Avatar className="size-7 ring-1 ring-white/[0.1]">
              <AvatarFallback className="text-[10px] font-bold bg-[#F6A11C]/15 text-[#F6A11C]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-zinc-200 leading-tight">
                {session.user.name}
              </span>
              <span
                className={
                  "inline-flex items-center rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider leading-tight mt-0.5 " +
                  roleConfig.className
                }
              >
                {roleConfig.label}
              </span>
            </div>
            <IconChevronDown className="size-3.5 text-zinc-500 hidden sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl border border-white/[0.08] bg-zinc-900 p-1 shadow-xl shadow-black/40"
          >
            <DropdownMenuLabel className="px-3 py-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-zinc-200">
                  {session.user.name}
                </span>
                <span
                  className={
                    "inline-flex items-center self-start rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider " +
                    roleConfig.className
                  }
                >
                  {roleConfig.label}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 cursor-pointer">
              <IconUser className="size-4 text-zinc-500" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300 cursor-pointer"
            >
              <IconLogout className="size-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
