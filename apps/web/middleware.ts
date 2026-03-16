import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get('session_id')?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/matches/:path*', '/admin/:path*', '/translate/:path*', '/financial/:path*', '/sequencing/insurance/:path*', '/sequencing/orders/:path*', '/sequencing/guide/:path*', '/sequencing/confirm/:path*', '/sequencing/results/:path*'],
};
