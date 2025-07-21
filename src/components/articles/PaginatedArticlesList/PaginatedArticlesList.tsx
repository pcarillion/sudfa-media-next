"use client";

import { Container } from "@/components/common/Container";
import { Articles } from "@/types/api.types";
import React, { useState } from "react";
import { ArticlesList } from "../ArticlesList";
import { Loader2 } from "lucide-react";

export const PaginatedArticlesList = ({
  initialArticles,
  limit,
  getArticlesCallback,
}: {
  initialArticles: Articles;
  limit: number;
  getArticlesCallback: (offset: number) => Promise<{
    articles: Articles;
    nbResults: number;
  }>;
}) => {
  const [articles, setArticles] = useState<Articles>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(limit);
  const [maxAtteined, setMaxAtteined] = useState(false);
  const loadMoreArticles = async () => {
    setLoading(true);
    const { articles: newArticles, nbResults } = await getArticlesCallback(
      offset
    );
    setArticles((articles) => [...articles, ...newArticles]);
    setLoading(false);
    setOffset(limit + offset);
    setMaxAtteined(nbResults < limit);
  };

  return (
    <>
      <ArticlesList articles={articles} />
      {!maxAtteined && (
        <Container>
          <button
            className="text-xl mx-auto block my-6 border w-12 h-12 border-black hover:opacity-70 hover:boder-slate-700 rounded-full"
            onClick={() => loadMoreArticles()}
          >
            {loading ? (
              <Loader2 
                size={15} 
                className="animate-spin"
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              "+"
            )}
          </button>
        </Container>
      )}
    </>
  );
};
