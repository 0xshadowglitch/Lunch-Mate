import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage      = pathname.startsWith("/login") || pathname.startsWith("/signup")
  const isOnboarding    = pathname.startsWith("/onboarding")
  const isAdminPage     = pathname.startsWith("/admin")
  const isUserPage      = pathname.startsWith("/user")
  const isInvitePage    = pathname.startsWith("/invite")  // /invite is public (shows login prompt if needed)
  const isApiRoute      = pathname.startsWith("/api")     // API routes handle their own auth

  // 1. Unauthenticated → redirect to login for protected areas
  if (!user && (isAdminPage || isUserPage || isOnboarding)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Already logged in → skip auth pages
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // 3. Logged-in user without an org → onboarding
  //    (except if they're on the invite page — they might be accepting to GET an org)
  if (user && (isAdminPage || isUserPage) && !isOnboarding) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
