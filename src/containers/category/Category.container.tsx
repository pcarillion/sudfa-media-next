import { ArticlesList } from "@/components/articles/ArticlesList";
import { Container } from "@/components/common/Container";
import { Pagination } from "@/components/utils/Pagination";
import { H1 } from "@/components/common/ui/H1";
import { Typography } from "@/components/common/ui/Typography";
import { Api } from "@/lib/api";
import React from "react";

const LIMIT = 5;

export const CategoryContainer = async ({
  id,
  page,
}: {
  id: string;
  page: string;
}) => {
  const api = await Api();
  const category = await api.getCategoryById(id);
  const { articles, nbResults } = await api.getPaginatedArticlesByCateogry(
    category.name,
    LIMIT * Number(page)
  );
  return (
    <Container>
      <H1 center>{category.name}</H1>
      <Typography classAdd="px-3 m-3 md:px-40 md:m-12" center>
        {category.description}
      </Typography>
      <ArticlesList articles={articles} />
      <Pagination shouldHideButton={nbResults < LIMIT * Number(page)} />
    </Container>
  );
};
