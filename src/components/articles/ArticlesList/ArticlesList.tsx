import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { H3 } from "@/components/common/ui/H3";
import { Typography } from "@/components/common/ui/Typography";
import { Articles } from "@/types/api.types";

import { formatDate } from "@/utils/Formatting";
import Link from "next/link";
import React from "react";

export const ArticlesList = ({ articles }: { articles: Articles }) => {
  return (
    <ul>
      {articles.map((article) => {
        return (
          <li className="py-6 flex flex-row w-full" key={article.id}>
            <ResponsiveImage
              className="hidden md:block min-w-96 min-h-52 mr-8"
              src={article.photoPrincipale.url}
              alt={article.photoPrincipale.alt}
            />
            <div>
              <Link href={`/article/${article.slug}`}>
                <H3>{article.titre}</H3>
              </Link>
              <Typography classAdd="py-2" small>
                {formatDate(article.date)} - par {article.authors[0].name}
              </Typography>
              <Typography classAdd="py-2" small>
                {article.presentation}
              </Typography>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
