import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const APP = ["/dashboard", "/quests", "/rewards", "/profile", "/account", "/pricing", "/start"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let signedIn = false;

  // visitors without a Supabase session cookie are signed out: no network call needed
  const hasSession = req.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (url && anon && hasSession) {
    const sb = createServerClient(url, anon, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await sb.auth.getUser();
    signedIn = Boolean(data.user);
  }

  const { pathname, searchParams } = req.nextUrl;

  // Kwop tracked link: keep ?k= for 30 days (first-party cookie)
  const k = searchParams.get("k");
  if (k && /^[A-Za-z0-9]{1,12}$/.test(k)) {
    res.cookies.set("kwop_k", k, { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", path: "/" });
  }
  // marketing attribution, kept for sign-up (profiles.intended_plan / profiles.source)
  const plan = searchParams.get("plan");
  if (plan) res.cookies.set("sq_plan", plan.slice(0, 40), { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", path: "/" });
  const utm: Record<string, string> = {};
  searchParams.forEach((v, key) => {
    if (key.startsWith("utm_")) utm[key] = v.slice(0, 100);
  });
  if (Object.keys(utm).length)
    res.cookies.set("sq_utm", JSON.stringify(utm), { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", path: "/" });

  if (url && anon) {
    const isApp = APP.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (isApp && !signedIn) {
      const to = req.nextUrl.clone();
      to.pathname = "/login";
      to.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
      return NextResponse.redirect(to);
    }
    if (signedIn && (pathname === "/" || pathname === "/signup" || pathname === "/login")) {
      const to = req.nextUrl.clone();
      to.pathname = "/dashboard";
      to.search = "";
      return NextResponse.redirect(to);
    }
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|api/og|.*\\.(?:png|jpg|svg|webp|ico)$).*)"],
};
