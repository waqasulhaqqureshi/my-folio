import { NextResponse } from "next/server";

/*
 * Hero image upload — RETIRED.
 *
 * This route existed solely to replace the hero portrait. The portrait is now
 * locked to the bundled asset (see HERO_PORTRAIT in lib/heroTypes.ts), so there
 * is nothing for an upload to repoint.
 *
 * The route is kept as an explicit 410 rather than deleted for two reasons:
 *
 *  - Deleting it would make the path fall through to the catch-all route, which
 *    answers 404 with an HTML page. A client still holding the old admin bundle
 *    would then show "Unexpected token '<'" instead of a real reason.
 *  - 410 Gone is the honest status: the endpoint is not missing or temporarily
 *    unavailable, it has been withdrawn permanently.
 *
 * The previous implementation wrote sniffed, size-capped images into
 * public/uploads/ and called saveHeroContent({ profileImg }). Both halves of
 * that are gone: nothing writes to public/uploads/ any more, and profileImg is
 * no longer a persisted field, so a replayed request from an old tab or a saved
 * curl cannot resurrect an override.
 */

const GONE = {
  error:
    "The hero portrait is locked to the bundled image and can no longer be replaced by upload.",
};

export async function POST() {
  return NextResponse.json(GONE, { status: 410 });
}

/* Same answer for any other verb, so probing the path can never 405-hint that
   some other method still works. */
export const GET = POST;
export const PUT = POST;
export const PATCH = POST;
export const DELETE = POST;
