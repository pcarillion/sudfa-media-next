import React from "react";

interface VideoIframeProps {
  src: string;
  title: string;
  allow?: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export const VideoIframe: React.FC<VideoIframeProps> = ({
  src,
  title,
  allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  className = "w-full h-full",
  loading = "lazy",
}) => {
  console.log(src);
  return (
    <iframe
      src={src}
      title={title}
      frameBorder="0"
      allow={allow}
      allowFullScreen
      loading={loading}
      className={className}
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      style={{
        border: "none",
        overflow: "hidden",
      }}
    />
  );
};
