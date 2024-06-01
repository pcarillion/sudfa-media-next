import { ArticlesList } from "@/components/articles/ArticlesList";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { Container } from "@/components/common/Container";
import { Pagination } from "@/components/utils/Pagination";
import { Api } from "@/lib/api";
import React from "react";

const LIMIT = 5;

export const AuteurContainer = async ({
  id,
  page,
}: {
  id: string;
  page: string;
}) => {
  const api = await Api();
  const author = await api.getAuthorById(id);
  const { articles, nbResults } = await api.getPaginatedArticlesByAuthor(
    author,
    LIMIT * Number(page)
  );
  return (
    <Container>
      <AuthorCard author={author} />
      <ArticlesList articles={articles} />
      <Pagination shouldHideButton={nbResults < LIMIT * Number(page)} />
    </Container>
  );
};
