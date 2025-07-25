import { PaginatedArticlesList } from "@/components/articles/PaginatedArticlesList";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { Container } from "@/components/common/Container";
import { Api } from "@/lib/api";
import { Article } from "@/payload-types";
import React from "react";

const LIMIT = 5;

export const AuteurContainer = async ({ id }: { id: string }) => {
  const api = await Api();
  const author = await api.getAuthorById(id);

  if (!author) {
    return <Container>Auteur non trouvé</Container>;
  }

  const getArticles = async (
    offset: number
  ): Promise<{
    articles: Article[];
    nbResults: number;
  }> => {
    "use server";
    const api = await Api();
    const result = await api.getPaginatedArticlesByAuthor(
      id,
      Math.floor(offset / LIMIT) + 1,
      LIMIT
    );
    return {
      articles: result.docs,
      nbResults: result.totalDocs,
    };
  };
  const firstPage = await api.getPaginatedArticlesByAuthor(id, 1, LIMIT);
  const articles = firstPage.docs;

  return (
    <Container>
      <AuthorCard author={author} />
      <PaginatedArticlesList
        initialArticles={articles}
        limit={LIMIT}
        getArticlesCallback={getArticles}
      />
    </Container>
  );
};
