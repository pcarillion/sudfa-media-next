import React from "react";
import Image from "next/image";

interface AspectRatioImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClass?: string;
  aspectRatio?: "aspect-ratio-16-9" | "aspect-ratio-4-3" | "aspect-ratio-1-1";
}

export const AspectRatioImage = ({
  src,
  alt,
  className,
  imageClass,
  aspectRatio = "aspect-ratio-16-9",
}: AspectRatioImageProps) => {
  return (
    <div className={`${className} w-full`}>
      {" "}
      <div className={`aspect-ratio ${aspectRatio}`}>
        <Image
          src={src}
          alt={alt}
          className={imageClass}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
};
