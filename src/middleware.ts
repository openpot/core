import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle subdomain-based routing.
 * 
 * Logic:
 * - app.openpot.co -> Continue to PWA dashboard (/).
 * - openpot.co / www.openpot.co -> Rewrite root to /landing.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define landing page domains
  const landingDomains = ['openpot.co', 'www.openpot.co'];
  
  // Check if current host is a landing domain
  const isLandingHost = landingDomains.some(domain => hostname.includes(domain));
  
  // If it's a landing host and we are at the root, rewrite to the landing page
  if (isLandingHost && url.pathname === '/') {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
