import { PaginatedArticlesList } from "@/components/articles/PaginatedArticlesList";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { Container } from "@/components/common/Container";
import { Api } from "@/lib/api";
import React from "react";

const LIMIT = 5;

export const AuteurContainer = async ({ id }: { id: string }) => {
  const api = await Api();
  const author = await api.getAuthorById(id);

  const getArticles = async (offset: number) => {
    "use server";
    return await api.getPaginatedArticlesByAuthor(author, LIMIT, offset);
  };
  const { articles } = await getArticles(0);

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
