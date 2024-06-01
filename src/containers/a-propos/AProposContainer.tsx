import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Api } from "@/lib/api";
import React from "react";

export const AProposContainer = async () => {
  const api = await Api();
  const presentation = await api.getPresentation();
  return (
    <Container>
      <H1 center>{presentation.title}</H1>
      <div className="px-3">
        <LexicalRenderer small content={presentation.longVersion_html} />
      </div>
    </Container>
  );
};
