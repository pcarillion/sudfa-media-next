import { AspectRatioImage } from "@/components/common/AspectRatioImage";
import { H4 } from "@/components/common/ui/H4";
import { Typography } from "@/components/common/ui/Typography";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Article, Author, Media } from "@/payload-types";
import { formatDate } from "@/utils/Formatting";
import Link from "next/link";
import React from "react";

interface ArticleCardType {
  article: Article;
  hasPicture?: boolean;
  hasDescription?: boolean;
  hasPictureMobile?: boolean;
  border?: "none" | "l" | "r" | "b" | "t";
}

export const ArticleCard = ({
  article,
  hasPicture = false,
  hasDescription = false,
  border = "none",
}: ArticleCardType) => {
  if (!article) return null;
  const thumbnail = article.photoPrincipale as Media;
  return (
    <div
      className={`w-full p-3 ${
        border === "none" ? "" : `border-${border} border-slate-300`
      }
      `}
    >
      {thumbnail && (
        <AspectRatioImage
          className={`block pb-3 ${hasPicture ? "" : "md:hidden"}`}
          src={thumbnail.url!}
          alt={thumbnail.alt}
        />
      )}
      <div>
        <Link href={`/article/${article.slug}`}>
          <H4>{article.titre}</H4>
        </Link>
        <Typography classAdd="py-2" small>
          {formatDate(article.date)} - par{" "}
          <Link href={`/auteur/${(article.authors as Author[])[0].id}`}>
            {(article.authors as Author[])[0].name}
          </Link>
        </Typography>

        <Typography
          classAdd={`py-2 ${hasDescription ? "" : "md:hidden"}`}
          small
        >
          <LexicalRenderer content={article.presentation} />
        </Typography>
      </div>
    </div>
  );
};
