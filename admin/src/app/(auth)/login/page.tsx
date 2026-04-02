import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F6A11C]/[0.08] via-transparent to-transparent" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="Knipserl" className="h-14 w-auto mb-3" />
          <p className="text-sm text-zinc-500">Admin Dashboard</p>
        </div>

        <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 backdrop-blur-sm shadow-2xl shadow-black/40">
          <form
            action={async (formData: FormData) => {
              "use server";
              try {
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo: "/",
                });
              } catch (err) {
                if (err instanceof AuthError) {
                  redirect("/login?error=1");
                }
                throw err;
              }
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300 block">
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="name@knipserl.de"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-[#F6A11C]/40 focus:ring-2 focus:ring-[#F6A11C]/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-300 block">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-100 outline-none focus:border-[#F6A11C]/40 focus:ring-2 focus:ring-[#F6A11C]/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20">
                Ungültige Anmeldedaten
              </div>
            )}

            <button
              type="submit"
              className="h-10 w-full rounded-xl bg-[#F6A11C] text-zinc-950 font-semibold hover:bg-[#F6A11C]/90 transition-all duration-200 active:scale-[0.98]"
            >
              Anmelden
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-500">
          Knipserl Fotobox Admin &middot; v1.0
        </p>
      </div>
    </div>
  );
}
