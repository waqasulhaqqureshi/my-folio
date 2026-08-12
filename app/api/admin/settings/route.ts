import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "../../../lib/adminAuth";
import { getSettings, saveSettings } from "../../../lib/settingsContent";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSettings());
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
  const saved = await saveSettings(body);
  revalidatePath("/");
  return NextResponse.json(saved);
}
