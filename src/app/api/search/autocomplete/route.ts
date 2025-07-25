import { Api } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const api = await Api();
    const articles = await api.searchArticlesAutocomplete(query);

    const suggestions = articles.map(article => ({
      id: article.id,
      titre: article.titre,
      slug: article.slug,
    }));

    return NextResponse.json({
      suggestions,
      query,
    });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}