import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { Typography } from "@/components/common/ui/Typography";
import { Api } from "@/lib/api";
import React from "react";
import { PaginatedArticlesList } from "@/components/articles/PaginatedArticlesList";

const LIMIT = 5;

export const CategoryContainer = async ({ id }: { id: string }) => {
  const api = await Api();
  const category = await api.getCategoryById(id);

  if (!category) {
    return <Container>Catégorie non trouvée</Container>;
  }

  const getArticles = async (offset: number) => {
    "use server";
    const api = await Api();
    const result = await api.getPaginatedArticlesByCateogry(
      id,
      Math.floor(offset / LIMIT) + 1,
      LIMIT
    );
    return {
      articles: result.docs,
      nbResults: result.totalDocs,
    };
  };
  const firstPage = await api.getPaginatedArticlesByCateogry(id, 1, LIMIT);
  const articles = firstPage.docs;
  return (
    <Container>
      <H1 center>{category.name}</H1>
      <Typography classAdd="px-3 m-3 md:px-40 md:m-12" center>
        {category.description}
      </Typography>
      <PaginatedArticlesList
        initialArticles={articles}
        limit={LIMIT}
        getArticlesCallback={getArticles}
      />
    </Container>
  );
};
