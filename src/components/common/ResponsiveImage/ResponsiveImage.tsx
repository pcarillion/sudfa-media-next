import React from "react";
import Image from "next/image";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClass?: string;
}

/**
 * Composant d'image responsive
 * @param {ResponsiveImageProps} props - Les propriétés du composant
 * @param {string} props.src - URL de l'image
 * @param {string} props.alt - Texte alternatif pour l'accessibilité
 * @param {string} [props.className] - Classes CSS pour le conteneur
 * @param {string} [props.imageClass] - Classes CSS pour l'image
 * @returns {JSX.Element} Le composant image responsive
 */
export const ResponsiveImage = ({
  src,
  alt,
  className,
  imageClass,
}: ResponsiveImageProps) => {
  return (
    <div className={className}>
      <div className="w-full h-full relative">
        <Image
          src={src}
          alt={alt}
          fill
          className={imageClass}
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
};
