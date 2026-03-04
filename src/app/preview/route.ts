import type { CollectionSlug, PayloadRequest } from "payload";
import { getPayload } from "payload";
import { redirect } from "next/navigation";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import configPromise from "@payload-config";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const previewSecret =
    searchParams.get("previewSecret") ?? searchParams.get("secret");
  const slug = searchParams.get("slug");
  const collection = searchParams.get("collection") as CollectionSlug | null;
  const path = searchParams.get("path");

  if (!previewSecret || previewSecret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json(
      { error: "Invalid preview secret" },
      { status: 401 }
    );
  }

  if (!slug || !path || collection !== "articles") {
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

  const doc = await payload.find({
    collection: "articles",
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 0,
    draft: true,
    overrideAccess: true,
    limit: 1,
  });

  if (!doc.docs.length) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(path);
}
