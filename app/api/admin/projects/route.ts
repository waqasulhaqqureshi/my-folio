import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "../../../lib/adminAuth";
import { getProjects, saveProjects } from "../../../lib/projectContent";

/*
 * Projects CRUD.
 *
 * The whole roster is sent as one array rather than exposing per-row
 * POST/PATCH/DELETE endpoints. Ordering is part of the content here (the
 * carousel steps through the array), so a partial update would need a separate
 * reorder call and could interleave with an in-flight edit. One atomic
 * write of the full list makes "what you see is what is saved" literally true.
 */

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getProjects());
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "Expected an array of projects." },
      { status: 400 }
    );
  }

  const saved = await saveProjects(body);

  /* The homepage is force-dynamic but still cached per request path; without
     this the editor saves, navigates home, and sees the old roster. */
  revalidatePath("/");

  return NextResponse.json(saved);
}
