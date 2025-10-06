import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { H3 } from "@/components/common/ui/H3";
import { Typography } from "@/components/common/ui/Typography";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Article, Author, Media } from "@/payload-types";

import { formatDate } from "@/utils/Formatting";
import Link from "next/link";
import React from "react";

/**
 * Composant liste d'articles avec image et présentation
 * @param {Object} props - Les propriétés du composant
 * @param {Article[]} props.articles - Tableau des articles à afficher
 * @returns {JSX.Element} Liste des articles formatés
 */
export const ArticlesList = ({ articles }: { articles: Article[] }) => {
  return (
    <ul>
      {articles.map(article => {
        const thumbnail = article.photoPrincipale as Media;
        return (
          <li className="py-6 flex flex-row w-full" key={article.id}>
            {article.photoPrincipale && (
              <ResponsiveImage
                className="hidden md:block min-w-96 min-h-52 mr-8"
                src={thumbnail.url!}
                alt={thumbnail.alt}
              />
            )}
            <div>
              <Link href={`/article/${article.slug}`}>
                <H3>{article.titre}</H3>
              </Link>
              <Typography classAdd="py-2" small>
                {formatDate(article.date)} - par{" "}
                {(article.authors[0] as Author).name}
              </Typography>
              <Typography classAdd="py-2" small>
                <LexicalRenderer content={article.presentation} />
              </Typography>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
