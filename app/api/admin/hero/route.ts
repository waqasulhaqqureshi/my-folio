import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "../../../lib/adminAuth";
import { getHeroContent, saveHeroContent } from "../../../lib/heroContent";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getHeroContent());
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

  const saved = await saveHeroContent(body);

  /* The homepage caches its render. Without this the editor saves, navigates
     home, and sees the OLD hero — which reads as "the save silently failed". */
  revalidatePath("/");

  return NextResponse.json(saved);
}
