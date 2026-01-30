import type { CollectionSlug, PayloadRequest } from "payload";
import { getPayload } from "payload";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import configPromise from "@payload-config";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const previewSecret = searchParams.get("previewSecret");
  const slug = searchParams.get("slug");
  const collection = searchParams.get("collection") as CollectionSlug | null;
  const path = searchParams.get("path");

  if (!previewSecret || previewSecret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json(
      { error: "Invalid preview secret" },
      { status: 401 }
    );
  }

  if (!slug || !collection || !path) {
    return NextResponse.json(
      { error: "Missing preview parameters" },
      { status: 400 }
    );
  }

  const payload = await getPayload({ config: configPromise });
  const user = await payload.auth({
    req: req as unknown as PayloadRequest,
    headers: req.headers,
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
  }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(path, req.url));
}
