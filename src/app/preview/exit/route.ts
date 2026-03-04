import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "/";

  const draft = await draftMode();
  draft.disable();

  return NextResponse.redirect(new URL(path, req.nextUrl.origin));
}
