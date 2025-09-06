// TypeScript declarations for cookie library with parsing and serialization support

/**
 * Cookie library type definitions for parsing and serializing HTTP cookies
 * Purpose: Provides type safety for cookie operations including parsing cookie strings
 * and serializing cookies with security options for HTTP responses
 */
declare module 'cookie' {
  export function parse(cookieString: string): { [key: string]: string };
  export function serialize(name: string, val: string, options?: CookieSerializeOptions): string;

  interface CookieSerializeOptions {
    domain?: string;
    encode?(val: string): string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    secure?: boolean;
  }
} 