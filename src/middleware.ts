import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export function middleware(request: NextRequest) {
  // Add your middleware logic here
  return NextResponse.next();
}

// Configure which paths middleware will run on
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|favicon.ico|public/).*)',
  ]
}; 