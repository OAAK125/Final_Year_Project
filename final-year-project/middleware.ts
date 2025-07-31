import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createMiddlewareClient({ req: request, res: response })


  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const { pathname } = request.nextUrl

  const isAuthPage = [
    '/authentication/login',
    '/authentication/signup',
    '/authentication/forgot-password',
    '/authentication/reset-password',
  ].includes(pathname)

  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Redirect authenticated users away from auth pages
  if (session && isAuthPage) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users away from protected pages
  if (!session && isProtectedRoute) {
    url.pathname = '/authentication/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /**
     * Match all request paths except for:
     * - static files (/_next/static, /_next/image, etc.)
     * - public assets (.ico, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
