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