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

/**
 * Composant carte d'article avec options d'affichage configurables
 * @param {ArticleCardType} props - Les propriétés du composant
 * @param {Article} props.article - Données de l'article
 * @param {boolean} [props.hasPicture=false] - Si true, affiche l'image sur desktop
 * @param {boolean} [props.hasDescription=false] - Si true, affiche la description sur desktop
 * @param {string} [props.border="none"] - Type de bordure à appliquer
 * @returns {JSX.Element|null} Le composant carte d'article ou null si pas d'article
 */
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
      className={`group w-full p-3 ${
        border === "none" ? "" : `border-${border} border-slate-300`
      }
      `}
    >
      <Link
        href={`/article/${article.slug}`}
        className="block no-underline hover:no-underline"
      >
        {thumbnail && (
          <AspectRatioImage
            className={`block pb-3 ${hasPicture ? "" : "md:hidden"}`}
            src={thumbnail.url!}
            alt={thumbnail.alt}
          />
        )}
        <div>
          <H4 classAdd="group-hover:underline">{article.titre}</H4>
          <Typography classAdd="py-2" small>
            {formatDate(article.date)} - par{" "}
            <Link
              href={`/auteur/${(article.authors as Author[])[0].id}`}
              className="hover:underline"
            >
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
      </Link>
    </div>
  );
};
