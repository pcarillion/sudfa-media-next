import { ArticlesList } from "@/components/articles/ArticlesList";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { AspectRatioImage } from "@/components/common/AspectRatioImage";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { H3 } from "@/components/common/ui/H3";
import { Typography } from "@/components/common/ui/Typography";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Api } from "@/lib/api";
import { formatDate } from "@/utils/Formatting";
import React from "react";

const LIMIT = 5;

export const ArticleContainer = async ({ slug }: { slug: string }) => {
  const api = await Api();
  const article = await api.getArticleBySlug(decodeURIComponent(slug));
  const otherArticles = await api.getArticlesByCategory(
    article.category.name,
    LIMIT,
    article.id
  );
  if (!article) {
    return null;
  }
  return (
    <>
      <Container>
        <div className="px-3 md:px-24 w-full">
          <H1>{article.titre}</H1>
          <Typography center classAdd="my-2.5">
            {formatDate(article.date)} - par {article.authors[0].name} -{" "}
            {article.category.name}
          </Typography>
          <Typography classAdd="my-12">{article.presentation}</Typography>
          <AspectRatioImage
            src={article.photoPrincipale.url}
            alt={article.photoPrincipale.alt}
            className="my-2.5"
          />
          <Typography center classAdd="italic">
            {article.photoPrincipale.legend}
          </Typography>
          <LexicalRenderer content={article.content_html} />
        </div>
        {article.authors.map((author) => {
          return <AuthorCard key={author.id} author={author} />;
        })}
        {otherArticles.length > 0 && (
          <div>
            <H3 center>{article.category.name}</H3>
            <ArticlesList articles={otherArticles} />
          </div>
        )}
      </Container>
    </>
  );
};
