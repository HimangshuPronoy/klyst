import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need auth checks.
     * Skip: landing page, _next static/image, favicon, api routes, images
     */
    '/dashboard/:path*',
    '/brand-assets/:path*',
    '/auth/:path*',
  ],
}
