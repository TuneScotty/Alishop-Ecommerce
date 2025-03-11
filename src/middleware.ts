import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/' || path.startsWith('/api/');
  
  // Get the token from the cookies
  const token = request.cookies.get('next-auth.session-token')?.value || '';
  
  // Redirect logic
  if (!isPublicPath && !token) {
    // Redirect to login if trying to access a protected route without a token
    return NextResponse.redirect(new URL(`/login?redirect=${path}`, request.url));
  }
  
  if ((path === '/login' || path === '/register') && token) {
    // Redirect to home if trying to access login/register with a token
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}; 