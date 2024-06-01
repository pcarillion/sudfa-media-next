import { AspectRatioImage } from "@/components/common/AspectRatioImage";
import { H4 } from "@/components/common/ui/H4";
import { Typography } from "@/components/common/ui/Typography";
import { Article } from "@/types/api.types";
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
  return (
    <div
      className={`w-full p-3 ${
        border === "none" ? "" : `border-${border} border-slate-300`
      }
      `}
    >
      <AspectRatioImage
        className={`block pb-3 ${hasPicture ? "" : "md:hidden"}`}
        src={article.photoPrincipale.url}
        alt={article.photoPrincipale.alt}
      />
      <div>
        <Link href={`/article/${article.slug}`}>
          <H4>{article.titre}</H4>
        </Link>
        <Typography classAdd="py-2" small>
          {formatDate(article.date)} - par{" "}
          <Link href={`/auteur/${article.authors[0].id}`}>
            {article.authors[0].name}
          </Link>
        </Typography>

        <Typography
          classAdd={`py-2 ${hasDescription ? "" : "md:hidden"}`}
          small
        >
          {article.presentation}
        </Typography>
      </div>
    </div>
  );
};
