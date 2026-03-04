import { ArticlesList } from "@/components/articles/ArticlesList";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { AspectRatioImage } from "@/components/common/AspectRatioImage";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { H3 } from "@/components/common/ui/H3";
import { Typography } from "@/components/common/ui/Typography";
import { ArticleLexicalRenderer } from "@/components/utils/LexicalRenderer/ArticleLexicalRenderer";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Api } from "@/lib/api";
import { Author, Category, Media } from "@/payload-types";
import { formatDate } from "@/utils/Formatting";
import React from "react";

const LIMIT = 5;

export const ArticleContainer = async ({
  slug,
  draft,
}: {
  slug: string;
  draft?: boolean;
}) => {
  const api = await Api();
  const article = await api.getArticleBySlug(decodeURIComponent(slug), {
    draft,
  });

  if (!article) {
    return <Container>Article non trouvé</Container>;
  }

  const categoryObject =
    article.category && typeof article.category === "object"
      ? (article.category as Category)
      : null;
  const otherArticles = categoryObject?.name
    ? await api.getArticlesByCategory(categoryObject.name, LIMIT)
    : [];

  const firstAuthor =
    article.authors?.[0] && typeof article.authors[0] === "object"
      ? (article.authors[0] as Author)
      : null;
  const authorName = firstAuthor?.name || "Anonyme";
  const thumbnail =
    article.photoPrincipale && typeof article.photoPrincipale === "object"
      ? (article.photoPrincipale as Media)
      : null;
  const thumbnailUrl = thumbnail?.url || thumbnail?.sizes?.card?.url;
  const articleAuthors = (article.authors || []).filter(
    author => typeof author === "object"
  ) as Author[];
  return (
    <>
      <Container>
        <div className="px-3 md:px-24 w-full">
          <H1>{article.titre}</H1>
          <Typography center classAdd="my-2.5">
            {formatDate(article.date)} - par {authorName} -{" "}
            {categoryObject?.name || "Non catégorisé"}
          </Typography>
          <LexicalRenderer content={article.presentation} />
          {thumbnailUrl && (
            <>
              <AspectRatioImage
                src={thumbnailUrl}
                alt={thumbnail?.alt || ""}
                className="my-2.5"
                sizes="(min-width: 1024px) 768px, 100vw"
                priority
                quality={85}
              />
              <Typography center classAdd="italic">
                {thumbnail.legend}
              </Typography>
            </>
          )}
          <ArticleLexicalRenderer content={article.article} />
        </div>
        {articleAuthors.map(author => {
          return <AuthorCard key={author.id} author={author} />;
        })}
        {otherArticles.length > 0 && categoryObject && (
          <div>
            <H3 center>{categoryObject.name}</H3>
            <ArticlesList articles={otherArticles} />
          </div>
        )}
      </Container>
    </>
  );
};
