import { Api } from "@/lib/api";
import { APIHandler } from "@/lib/api/api";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  slug: string[];
};

export async function GET(_request: NextRequest, context: { params: Promise<Params> }) {
  const { slug } = await context.params;
  const slugToString = slug.join("/");
  try {
    const api = (await Api()) as APIHandler; // only for payload
    const response = await api.getMedias(slugToString);

    // Transit headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(response.headers)) {
      headers.set(key, value);
    }

    // Create a new NextResponse
    const nextResponse = new NextResponse(response.data, {
      headers,
    });

    return nextResponse;
  } catch (err) {
    console.error("Erreur lors de la récupération du media:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
