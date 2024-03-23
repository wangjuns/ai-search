import { auth } from '@/app/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth

  console.log(session)
  console.log(req.nextUrl.pathname)
  if (!session && !req.nextUrl.pathname.startsWith('/api/auth/signin') && !req.nextUrl.pathname.startsWith('/api/auth/callback/Credentials')) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
