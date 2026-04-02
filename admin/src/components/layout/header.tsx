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
import {
  IconLogout,
  IconUser,
  IconChevronDown,
  IconEye,
} from "@tabler/icons-react";
import { useViewMode } from "@/lib/view-mode-context";

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

const viewModeConfig = [
  { key: "admin" as const, label: "Admin", className: "text-[#F6A11C]" },
  { key: "driver" as const, label: "Fahrer", className: "text-emerald-400" },
  {
    key: "accounting" as const,
    label: "Buchhaltung",
    className: "text-blue-400",
  },
];

export function Header({ drivers }: { drivers?: { id: string; name: string; initials: string | null }[] }) {
  const { data: session } = useSession();
  const { viewMode, setViewMode, isAdmin, impersonateDriverId, setImpersonateDriverId } = useViewMode();

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const role = session?.user?.role ?? "";
  const roleConfig = roleLabels[role] ?? {
    label: role,
    className: "bg-[#2a2b30]/80 text-zinc-400 border border-zinc-500/30",
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b border-white/[0.10] bg-sidebar/80 backdrop-blur-sm px-4 shadow-md shadow-black/30">
      <SidebarTrigger className="text-zinc-400 hover:text-zinc-200 transition-colors" />
      <Separator
        orientation="vertical"
        className="h-5 bg-[#222326]"
      />

      <div className="flex-1" />

      {/* View mode toggle - only for admins */}
      {isAdmin && (
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-white/[0.12] bg-card p-0.5 shadow-sm shadow-black/20">
          <IconEye className="size-3.5 text-zinc-400 ml-1.5 mr-0.5" />
          {viewModeConfig.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={
                "h-6 px-2.5 rounded-md text-[11px] font-semibold transition-colors " +
                (viewMode === mode.key
                  ? `bg-[#28292d] ${mode.className}`
                  : "text-zinc-400 hover:text-zinc-200")
              }
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* Driver select when in driver view mode */}
      {isAdmin && viewMode === "driver" && drivers && drivers.length > 0 && (
        <select
          value={impersonateDriverId ?? ""}
          onChange={(e) => setImpersonateDriverId(e.target.value || null)}
          className="h-7 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 pr-6 text-[11px] font-semibold outline-none cursor-pointer appearance-none bg-[length:10px] bg-[right_4px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2334d399%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
        >
          <option value="" className="bg-card text-zinc-300">Alle Fahrer</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id} className="bg-card text-zinc-300">
              {d.name} {d.initials ? `(${d.initials})` : ""}
            </option>
          ))}
        </select>
      )}

      {session?.user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              buttonVariants({ variant: "ghost" }) +
              " gap-2.5 h-9 px-2.5 rounded-lg hover:bg-[#1c1d20] transition-colors"
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
            <IconChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl border border-white/[0.12] bg-card p-1 shadow-2xl shadow-black/60"
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
            <DropdownMenuSeparator className="bg-[#222326]" />
            <DropdownMenuItem className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 cursor-pointer">
              <IconUser className="size-4 text-muted-foreground" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#222326]" />
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
