"use client";

import { Container } from "@/components/common/Container";
import React, { useEffect, useState } from "react";
import { ArticlesList } from "../ArticlesList";
import { Loader2 } from "lucide-react";
import { Article } from "@/payload-types";

/**
 * Composant de liste d'articles avec pagination infinie
 * @param {Object} props - Les propriétés du composant
 * @param {Article[]} props.initialArticles - Articles initiaux à afficher
 * @param {number} props.limit - Nombre d'articles par page
 * @param {Function} props.getArticlesCallback - Fonction pour charger plus d'articles
 * @returns {JSX.Element} Liste d'articles avec bouton "Charger plus"
 */
export const PaginatedArticlesList = ({
  initialArticles,
  limit,
  getArticlesCallback,
}: {
  initialArticles: Article[];
  limit: number;
  getArticlesCallback: (offset: number) => Promise<{
    articles: Article[];
    nbResults: number;
  }>;
}) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(limit);
  const [maxAtteined, setMaxAtteined] = useState(false);
  
  /**
   * Charge plus d'articles depuis l'API
   */
  const loadMoreArticles = async () => {
    setLoading(true);
    const { articles: newArticles, nbResults } =
      await getArticlesCallback(offset);
    setArticles(articles => [...articles, ...newArticles]);
    setLoading(false);
    setOffset(limit + offset);
    setMaxAtteined(nbResults < limit);
  };

  useEffect(() => {
    setMaxAtteined(initialArticles.length < limit);
  }, [initialArticles, limit]);

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
              <div className="flex items-center justify-center ">
                <Loader2
                  size={20}
                  className="animate-spin"
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            ) : (
              "+"
            )}
          </button>
        </Container>
      )}
    </>
  );
};
