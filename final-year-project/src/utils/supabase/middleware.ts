import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // --- AUTH CHECK ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/authentication") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/authentication/login";
    return NextResponse.redirect(url);
  }

  // --- ROLE CHECK (only if user exists) ---
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      const currentPath = request.nextUrl.pathname;

      // Admins → /admin
      if (profile.role === "admin" && !currentPath.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }

      // Contributors → /contributor
      if (profile.role === "contributor" && !currentPath.startsWith("/contributor")) {
        const url = request.nextUrl.clone();
        url.pathname = "/contributor";
        return NextResponse.redirect(url);
      }

      // Students → allow `/`, `/dashboard`, `/authentication`, `/auth`
      if (profile.role === "student") {
        const allowedPaths = ["/", "/dashboard", "/authentication", "/auth"];
        const isAllowed = allowedPaths.some((path) =>
          currentPath.startsWith(path)
        );

        if (!isAllowed) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
