"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number | string;
  url?: string;
  tag?: string;
  listType?: "bullet" | "number";
  value?: {
    id?: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    legent?: string;
    legend?: string;
  };
  fields?: {
    url?: string;
    // Video block fields
    videoType?: "youtube" | "vimeo";
    youtubeID?: string;
    vimeoID?: string;
    title?: string;
    blockType?: string;
  };
  direction?: string;
  indent?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  blockName?: string;
}

interface LexicalContent {
  root: {
    children: LexicalNode[];
    direction?: string;
    format?: string;
    indent?: number;
    type: string;
    version: number;
  };
}

export const ArticleLexicalRenderer = ({
  content,
  small,
}: {
  content: any;
  small?: boolean;
}) => {
  // Si le contenu est une string (HTML), utiliser l'ancienne méthode
  if (typeof content === "string") {
    return (
      <div
        className={`rich-text-renderer ${small ? "small" : ""}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Si le contenu est null ou undefined
  if (!content) {
    return null;
  }

  // Traitement du contenu Lexical JSON
  const lexicalContent = content as LexicalContent;

  if (!lexicalContent?.root?.children) {
    return null;
  }

  const getTextAlignClass = (node: LexicalNode): string => {
    // Vérifier si l'alignement est défini dans textAlign
    if (node.textAlign) {
      switch (node.textAlign) {
        case "center":
          return "text-center";
        case "right":
          return "text-right";
        case "justify":
          return "text-justify";
        case "left":
        default:
          return "text-left";
      }
    }

    // Vérifier si l'alignement est défini dans format (pour compatibilité)
    if (typeof node.format === "string") {
      if (node.format.includes("center")) return "text-center";
      if (node.format.includes("right")) return "text-right";
      if (node.format.includes("justify")) return "text-justify";
    }

    return "text-left"; // alignement par défaut
  };

  const renderNode = (node: LexicalNode, index: number): React.ReactNode => {
    switch (node.type) {
      case "paragraph":
        const alignClass = getTextAlignClass(node);
        if (!node.children || node.children.length === 0) {
          return (
            <p key={index} className={`mb-4 ${alignClass}`}>
              &nbsp;
            </p>
          );
        }
        return (
          <p key={index} className={`mb-4 ${alignClass}`}>
            {node.children.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </p>
        );

      case "heading":
        const HeadingTag = (node.tag || "h2") as
          | "h1"
          | "h2"
          | "h3"
          | "h4"
          | "h5"
          | "h6";
        const headingClasses = {
          h1: "text-4xl font-bold mb-6",
          h2: "text-3xl font-bold mb-5",
          h3: "text-2xl font-bold mb-4",
          h4: "text-xl font-bold mb-3",
          h5: "text-lg font-bold mb-2",
          h6: "text-base font-bold mb-2",
        };
        const headingAlignClass = getTextAlignClass(node);
        return (
          <HeadingTag
            key={index}
            className={`${headingClasses[node.tag as keyof typeof headingClasses] || headingClasses.h2} ${headingAlignClass}`}
          >
            {node.children?.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </HeadingTag>
        );

      case "list":
        const ListTag = node.listType === "number" ? "ol" : "ul";
        const baseListClasses =
          node.listType === "number"
            ? "list-decimal list-inside mb-4 ml-4"
            : "list-disc list-inside mb-4 ml-4";
        const listAlignClass = getTextAlignClass(node);
        return (
          <ListTag
            key={index}
            className={`${baseListClasses} ${listAlignClass}`}
          >
            {node.children?.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </ListTag>
        );

      case "listitem":
        return (
          <li key={index} className="mb-1">
            {node.children?.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </li>
        );

      case "quote":
        const quoteAlignClass = getTextAlignClass(node);
        return (
          <blockquote
            key={index}
            className={`border-l-4 border-gray-300 pl-4 italic mb-4 text-gray-600 ${quoteAlignClass}`}
          >
            {node.children?.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </blockquote>
        );

      case "text":
        let text = node.text || "";

        // Appliquer les formats (format est un bitmask)
        if (typeof node.format === "number" && node.format) {
          if (node.format & 1) {
            // Bold
            text = `<strong>${text}</strong>`;
          }
          if (node.format & 2) {
            // Italic
            text = `<em>${text}</em>`;
          }
          if (node.format & 4) {
            // Strikethrough
            text = `<s>${text}</s>`;
          }
          if (node.format & 8) {
            // Underline
            text = `<u>${text}</u>`;
          }
          if (node.format & 16) {
            // Code
            text = `<code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${text}</code>`;
          }
        }

        return <span key={index} dangerouslySetInnerHTML={{ __html: text }} />;

      case "link":
        const url = node?.fields?.url || "#";
        return (
          <Link
            key={index}
            href={url}
            className="hover:opacity-70 underline"
            target={url.startsWith("http") ? "_blank" : undefined}
            rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {node.children?.map((child, childIndex) =>
              renderNode(child, childIndex)
            )}
          </Link>
        );

      case "upload":
        // Pour les images uploadées
        if (node.value?.url) {
          const imageWidth = node.value.width || 800;
          const imageHeight = node.value.height || 600;

          return (
            <div key={index} className="my-6 flex flex-col items-center w-full">
              <div className="relative w-full max-h-[60vh] flex justify-center">
                <Image
                  src={node.value.url}
                  alt={node.value.alt || "Image"}
                  width={imageWidth}
                  height={imageHeight}
                  className="object-contain max-w-full max-h-[60vh] h-auto"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "60vh",
                  }}
                />
              </div>
              {(node.value.legend || node.value.legent) && (
                <p className="text-sm text-gray-600 italic mt-2 text-center max-w-full">
                  {node.value.legend || node.value.legent}
                </p>
              )}
            </div>
          );
        }
        return null;

      case "horizontalrule":
        return <hr key={index} className="my-8 border-gray-300" />;

      case "code":
        return (
          <pre
            key={index}
            className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-4"
          >
            <code>
              {node.children?.map((child, childIndex) =>
                renderNode(child, childIndex)
              )}
            </code>
          </pre>
        );

      case "block":
        // Gestion des blocks personnalisés
        if (node.type === "block" && node.fields) {
          return (
            <BlockRenderer
              key={index}
              blockType={node.fields.blockType!}
              blockData={node.fields}
            />
          );
        }
        return null;

      default:
        // Type non géré, essayer de traiter les enfants
        if (node.children && Array.isArray(node.children)) {
          return (
            <div key={index}>
              {node.children.map((child, childIndex) =>
                renderNode(child, childIndex)
              )}
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div
      className={`lexical-renderer leading-[1.7] ${small ? "text-sm" : "text-lg"}`}
    >
      {lexicalContent.root.children.map((node, index) =>
        renderNode(node, index)
      )}
    </div>
  );
};
