export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api/inquiries|_next/static|_next/image|favicon.ico).*)"],
};
