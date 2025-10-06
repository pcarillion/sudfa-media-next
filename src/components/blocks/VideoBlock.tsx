import React from "react";
import { VideoIframe } from "@/components/ui/VideoIframe";

// Utilisons directement le type Video généré par Payload
interface VideoBlockProps {
  videoType: string;
  youtubeID: string;
  vimeoID: string;
  title: string;
}

/**
 * Composant de bloc vidéo pour YouTube et Vimeo
 * @param {VideoBlockProps} props - Les propriétés du composant
 * @param {string} props.videoType - Type de vidéo ('youtube' ou 'vimeo')
 * @param {string} props.youtubeID - ID de la vidéo YouTube
 * @param {string} props.vimeoID - ID de la vidéo Vimeo
 * @param {string} props.title - Titre de la vidéo
 * @returns {JSX.Element} Bloc vidéo intégré avec titre
 */
export const VideoBlock: React.FC<VideoBlockProps> = props => {
  const { videoType, youtubeID, vimeoID, title } = props;

  /**
   * Rend la vidéo selon son type
   * @returns {JSX.Element|null} Iframe vidéo ou null si pas de données
   */
  const renderVideo = () => {
    switch (videoType) {
      case "youtube":
        if (!youtubeID) return null;
        const youtubeUrl = `https://www.youtube-nocookie.com/embed/${youtubeID}`;

        return (
          <VideoIframe
            src={youtubeUrl}
            title={title || "Vidéo YouTube"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        );

      case "vimeo":
        if (!vimeoID) return null;
        const vimeoUrl = `https://player.vimeo.com/video/${vimeoID}`;

        return (
          <VideoIframe
            src={vimeoUrl}
            title={title || "Vidéo Vimeo"}
            allow="autoplay; fullscreen; picture-in-picture"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="my-6 w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      )}

      <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-sm">
        {renderVideo()}
      </div>
    </div>
  );
};
