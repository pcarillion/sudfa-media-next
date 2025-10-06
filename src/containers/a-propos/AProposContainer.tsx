import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { ArticleLexicalRenderer } from "@/components/utils/LexicalRenderer/ArticleLexicalRenderer";
import { Api } from "@/lib/api";
import React from "react";

/**
 * Conteneur de la page "À propos"
 * @returns {Promise<JSX.Element>} Page à propos avec contenu Lexical
 */
export const AProposContainer = async () => {
  const api = await Api();
  const presentation = await api.getAPropos();
  return (
    <Container>
      <div className="px-3 md:px-24 w-full">
        <ArticleLexicalRenderer content={presentation?.content} />
      </div>
    </Container>
  );
};
