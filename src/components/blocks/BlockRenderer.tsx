import React from "react";
import { VideoBlock } from "./VideoBlock";

interface BlockRendererProps {
  blockType: string;
  blockData: any;
}

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