import { NextResponse } from "next/server";

/*
 * Legacy hero upload path — SUPERSEDED, not restored.
 *
 * Portrait upload works again, but it lives at /api/admin/portrait, which also
 * lists the library folder. This path is kept as a 308 so any client still
 * holding an old admin bundle is redirected to the working endpoint instead of
 * being told the feature is gone (which it no longer is).
 *
 * 308 rather than 307/302 because it is permanent AND method-preserving: a
 * POST must stay a POST through the redirect, or the multipart body is dropped
 * and the upload silently becomes an empty GET.
 */
export function POST(req: Request) {
  return NextResponse.redirect(new URL("/api/admin/portrait", req.url), 308);
}

export const GET = POST;
export const PUT = POST;
export const PATCH = POST;
export const DELETE = POST;
