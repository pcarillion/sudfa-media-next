"use client";

import React from "react";
import Image from "next/image";

interface ContainedImageWithSkeletonProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  loading?: "lazy" | "eager";
  quality?: number;
  decoding?: "async" | "auto" | "sync";
}

export const ContainedImageWithSkeleton = ({
  src,
  alt,
  width,
  height,
  sizes,
  loading = "lazy",
  quality = 70,
  decoding = "async",
}: ContainedImageWithSkeletonProps) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="relative w-full max-h-[60vh] flex justify-center">
      <div
        className={`absolute inset-0 image-skeleton transition-opacity duration-300 pointer-events-none ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain max-w-full max-h-[60vh] h-auto relative z-10"
        style={{
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "60vh",
        }}
        sizes={sizes}
        loading={loading}
        quality={quality}
        decoding={decoding}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
};
