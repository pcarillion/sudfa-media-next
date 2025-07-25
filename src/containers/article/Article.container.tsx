import { ArticlesList } from "@/components/articles/ArticlesList";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { AspectRatioImage } from "@/components/common/AspectRatioImage";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { H3 } from "@/components/common/ui/H3";
import { Typography } from "@/components/common/ui/Typography";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Api } from "@/lib/api";
import { Author, Category, Media } from "@/payload-types";
import { formatDate } from "@/utils/Formatting";
import React from "react";

const LIMIT = 5;

export const ArticleContainer = async ({ slug }: { slug: string }) => {
  const api = await Api();
  const article = await api.getArticleBySlug(decodeURIComponent(slug));

  if (!article) {
    return <Container>Article non trouvé</Container>;
  }

  const otherArticles = article.category
    ? await api.getArticlesByCategory(
        (article.category as Category).name,
        LIMIT
      )
    : [];

  const auteur = article.authors[0] as Author;
  const thumbnail = article.photoPrincipale as Media;
  return (
    <>
      <Container>
        <div className="px-3 md:px-24 w-full">
          <H1>{article.titre}</H1>
          <Typography center classAdd="my-2.5">
            {formatDate(article.date)} - par {auteur?.name || "Anonyme"} -{" "}
            {auteur?.name || "Non catégorisé"}
          </Typography>
          <LexicalRenderer content={article.presentation} />
          {article.photoPrincipale && (
            <>
              <AspectRatioImage
                src={thumbnail.url!}
                alt={thumbnail.alt}
                className="my-2.5"
              />
              <Typography center classAdd="italic">
                {thumbnail.legend}
              </Typography>
            </>
          )}
          <LexicalRenderer content={article.article} />
        </div>
        {(article.authors as Author[]).map(author => {
          return <AuthorCard key={author.id} author={author} />;
        })}
        {otherArticles.length > 0 && article.category && (
          <div>
            <H3 center>{(article.category as Category).name}</H3>
            <ArticlesList articles={otherArticles} />
          </div>
        )}
      </Container>
    </>
  );
};
