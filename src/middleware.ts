import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Handle CORS for API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    // Use the actual hostname from the request instead of hardcoded values
    const origin = req.headers.get('host') ? `http://${req.headers.get('host')}` : 
                  (process.env.NEXTAUTH_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'http://srv751233.hstgr.cloud:3000' 
                    : 'http://localhost:3000'));
    
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    res.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200 });
    }
  }
  
  // Get the token from the cookies
  const token = req.cookies.get('auth-token')?.value;
  
  // Check if this is an API route that should be protected
  if (req.nextUrl.pathname.startsWith('/api/protected')) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      // Verify the token
      verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      return res;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  }
  
  // For non-API routes that should be protected
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/profile')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    try {
      // Verify the token
      verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      return res;
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/profile/:path*'],
}; 