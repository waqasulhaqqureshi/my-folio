import type { Metadata } from "next";
import PreviewClient from "./PreviewClient";

/*
 * /preview — development-only responsive harness.
 *
 * Not linked from anywhere in the site and excluded from indexing. It renders
 * the real page inside per-device iframes so media queries resolve against a
 * genuine viewport of that width (see PreviewClient for why a scaled div would
 * be useless here).
 */
export const metadata: Metadata = {
  title: "Device preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ path?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  /* Same-origin only: the harness reads each frame's innerWidth to verify the
     viewport really is the width it claims, which a cross-origin frame would
     block. Anything not starting with a single "/" is rejected. */
  const raw = typeof sp.path === "string" ? sp.path : "/";
  const path = /^\/(?!\/)/.test(raw) ? raw : "/";
  return <PreviewClient path={path} />;
}
