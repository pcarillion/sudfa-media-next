"use client";

import React from "react";
import Image from "next/image";

interface AspectRatioImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClass?: string;
  aspectRatio?: "aspect-ratio-16-9" | "aspect-ratio-4-3" | "aspect-ratio-1-1";
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  quality?: number;
  decoding?: "async" | "auto" | "sync";
}

/**
 * Composant d'image avec ratio d'aspect fixe
 * @param {AspectRatioImageProps} props - Les propriétés du composant
 * @param {string} props.src - URL de l'image
 * @param {string} props.alt - Texte alternatif pour l'accessibilité
 * @param {string} [props.className] - Classes CSS pour le conteneur
 * @param {string} [props.imageClass] - Classes CSS pour l'image
 * @param {string} [props.aspectRatio="aspect-ratio-16-9"] - Ratio d'aspect de l'image
 * @returns {JSX.Element} Le composant image avec ratio fixe
 */
export const AspectRatioImage = ({
  src,
  alt,
  className,
  imageClass,
  aspectRatio = "aspect-ratio-16-9",
  sizes = "100vw",
  priority,
  loading,
  quality = 75,
  decoding = "async",
}: AspectRatioImageProps) => {
  const [loaded, setLoaded] = React.useState(false);
  const resolvedLoading = priority ? undefined : loading ?? "lazy";
  return (
    <div className={`${className} w-full`}>
      {" "}
      <div className={`aspect-ratio ${aspectRatio}`}>
        <div
          className={`absolute inset-0 image-skeleton transition-opacity duration-300 pointer-events-none ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        />
        <Image
          src={src}
          alt={alt}
          className={imageClass}
          fill
          style={{ objectFit: "cover" }}
          sizes={sizes}
          priority={priority}
          loading={resolvedLoading}
          quality={quality}
          decoding={decoding}
          fetchPriority={priority ? "high" : undefined}
          onLoadingComplete={() => setLoaded(true)}
        />
      </div>
    </div>
  );
};
