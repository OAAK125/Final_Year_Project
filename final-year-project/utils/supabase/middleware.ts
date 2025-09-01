import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const publicPaths = [
      "/authentication/login",
      "/authentication/signup",
      "/authentication/forgot-password",
      "/authentication/reset-password",
    ];
    if (!publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
      const url = request.nextUrl.clone();
      url.pathname = "/authentication/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ✅ Fetch profile and enforce role-based access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile) {
    if (request.nextUrl.pathname.startsWith("/admin") && profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (request.nextUrl.pathname.startsWith("/contributor") && profile.role !== "contributor") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
