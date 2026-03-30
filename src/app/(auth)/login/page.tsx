"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCamera, IconLoader2 } from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Ungültige Anmeldedaten");
      setLoading(false);
    } else {
      const session = await fetch("/api/auth/session").then((r) => r.json());
      if (session?.user?.role === "DRIVER") {
        router.push("/driver/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      {/* Subtle gradient background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F6A11C]/[0.08] via-transparent to-transparent" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#F6A11C]/15 ring-1 ring-[#F6A11C]/20">
            <IconCamera className="size-8 text-[#F6A11C]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Knipserl
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Fotobox Admin Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                E-Mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@knipserl.de"
                required
                autoFocus
                className="h-10 rounded-xl border-white/[0.08] bg-white/[0.04] text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#F6A11C]/40 focus-visible:ring-[#F6A11C]/20"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-zinc-300"
              >
                Passwort
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-10 rounded-xl border-white/[0.08] bg-white/[0.04] text-zinc-100 focus-visible:border-[#F6A11C]/40 focus-visible:ring-[#F6A11C]/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-xl bg-[#F6A11C] text-zinc-950 font-semibold hover:bg-[#F6A11C]/90 transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-700">
          Knipserl Fotobox Admin &middot; v1.0
        </p>
      </div>
    </div>
  );
}
