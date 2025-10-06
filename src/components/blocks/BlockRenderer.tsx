import React from "react";
import { VideoBlock } from "./VideoBlock";

interface BlockRendererProps {
  blockType: string;
  blockData: any;
}

/**
 * Composant de rendu générique pour les blocs de contenu
 * @param {BlockRendererProps} props - Les propriétés du composant
 * @param {string} props.blockType - Type de bloc à rendre
 * @param {any} props.blockData - Données du bloc
 * @returns {JSX.Element} Bloc rendu ou message d'erreur si non supporté
 */
export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blockType,
  blockData,
}) => {
  switch (blockType) {
    case "video":
      return <VideoBlock {...blockData} />;
    
    default:
      console.warn(`Block type "${blockType}" not supported in renderer`);
      return (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-md my-4">
          <p className="text-gray-600 text-sm">
            Block non supporté: {blockType}
          </p>
        </div>
      );
  }
};