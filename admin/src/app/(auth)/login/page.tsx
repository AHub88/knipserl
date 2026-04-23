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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.08] via-transparent to-transparent" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="Knipserl" className="h-14 w-auto mb-3" />
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm shadow-2xl shadow-black/5 dark:shadow-black/25">
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
              <label htmlFor="email" className="text-sm font-medium text-foreground/80 block">
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
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80 block">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20">
                Ungültige Anmeldedaten
              </div>
            )}

            <button
              type="submit"
              className="h-10 w-full rounded-xl bg-primary text-zinc-950 font-semibold hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
            >
              Anmelden
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Knipserl Fotobox Admin &middot; v1.0
        </p>
      </div>
    </div>
  );
}
