import { NextResponse } from "next/server";
import { verifyPassword, issueToken, ADMIN_COOKIE } from "../../../lib/adminAuth";

/* Deliberately slow down failures. Without this, the single shared password is
   brute-forceable at request speed; 600ms makes an online attack impractical
   while being invisible to a human typing one password. */
const FAIL_DELAY_MS = 600;

export async function POST(req: Request) {
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    /* malformed body falls through to the failure path */
  }

  if (!verifyPassword(password)) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const { value, maxAge } = issueToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true, // not readable by JS → immune to XSS token theft
    sameSite: "lax", // blocks CSRF from third-party origins
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
