import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { Typography } from "@/components/common/ui/Typography";
import { Author, Media } from "@/payload-types";
import Link from "next/link";
import React from "react";

/**
 * Composant carte d'auteur avec photo et description
 * @param {Object} props - Les propriétés du composant
 * @param {Author} props.author - Données de l'auteur à afficher
 * @returns {JSX.Element} Carte d'auteur avec photo, nom et description
 */
export const AuthorCard = ({ author }: { author: Author }) => {
  return (
    <div className="w-full flex mx-auto box-border flex-col items-center px-3 py-12 mx-3 md:px-36 md:flex-row">
      {author.photo && (
        <ResponsiveImage
          className="w-44 h-44 min-w-44 min-h-44"
          src={(author.photo as Media).url!}
          alt={(author.photo as Media).alt}
          imageClass="rounded-full"
        />
      )}
      <div className="w-full flex flex-col items-center my-6 md:ml-20">
        <Link href={`/auteur/${author.id}`} className="w-full">
          <Typography classAdd="font-bold" small>
            {author.name}
          </Typography>
        </Link>
        <Typography small>{author.description}</Typography>
      </div>
    </div>
  );
};
