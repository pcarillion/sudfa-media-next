"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { SearchInput } from "@/components/search/SearchInput";
import { ArticlesList } from "@/components/articles/ArticlesList";
import { Article } from "@/payload-types";
import { Loader2, AlertCircle, FileX } from "lucide-react";

interface SearchState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  query: string;
}

export default function SearchPageClient() {
  const [searchState, setSearchState] = useState<SearchState>({
    articles: [],
    loading: false,
    error: null,
    hasSearched: false,
    query: "",
  });

  // Handle search from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");

    if (queryParam) {
      handleSearch(queryParam);
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      query: query.trim(),
    }));

    // Update URL without reloading the page
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("q", query.trim());
    window.history.pushState({}, "", newUrl.toString());

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}&limit=20`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();

      setSearchState(prev => ({
        ...prev,
        articles: data.articles || [],
        loading: false,
        hasSearched: true,
        error: null,
      }));
    } catch (error) {
      console.error("Search error:", error);
      setSearchState(prev => ({
        ...prev,
        articles: [],
        loading: false,
        hasSearched: true,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      }));
    }
  };

  const { articles, loading, error, hasSearched, query } = searchState;

  return (
    <Container>
      <div className="py-8">
        <div className="text-center mb-8">
          <H1>Recherche d&apos;articles</H1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Recherchez parmi tous nos articles en utilisant des mots-clés du
            titre
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <SearchInput
            onSearch={handleSearch}
            loading={loading}
            placeholder="Rechercher des articles..."
          />
        </div>

        {/* Search Results */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#D2270F] mb-4" />
              <p className="text-gray-600">Recherche en cours...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur de recherche
              </h3>
              <p className="text-gray-600 text-center max-w-md">{error}</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-4 px-4 py-2 bg-[#D2270F] text-white rounded-md hover:bg-[#B91C0C] transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && hasSearched && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <FileX className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Aucun article ne correspond à votre recherche &quot;{query}
                &quot;.
                <br />
                Essayez avec d&apos;autres mots-clés.
              </p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {articles.length} résultat{articles.length > 1 ? "s" : ""}{" "}
                  pour &quot;{query}&quot;
                </h2>
              </div>
              <ArticlesList articles={articles} />
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FileX className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-gray-600 max-w-md">
                Saisissez des mots-clés dans la barre de recherche ci-dessus
                pour trouver des articles.
              </p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
