import React from "react";
import Image from "next/image";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClass?: string;
}

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
