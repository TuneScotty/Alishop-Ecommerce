// Next.js middleware for handling CORS headers and API route configuration
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Configures CORS headers for all API routes and handles preflight requests
 * @param request - NextRequest object containing the incoming HTTP request
 * @returns NextResponse with CORS headers set, or immediate response for OPTIONS requests
 * Purpose: Enables cross-origin requests by setting appropriate CORS headers and handling preflight OPTIONS requests
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
