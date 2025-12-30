import { AuthorCard } from "@/components/authors/AuthorCard";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { H3 } from "@/components/common/ui/H3";
import { Api } from "@/lib/api";
import React from "react";

export default async function AuteursContainer() {
  const api = await Api();
  const authors = await api.getAuthors();
  return (
    <Container>
      <H1 center>Contributeurs</H1>
      <H3 classAdd="md:px-36 px-3">L&apos;Equipe</H3>
      <ul className="py-">
        {authors
          .filter(author => author.type === "equipe")
          .map(author => {
            return <AuthorCard key={author.id} author={author} />;
          })}
      </ul>
      <H3 classAdd="md:px-36 px-3">Les contributeurs</H3>
      <ul className="py-">
        {authors
          .filter(author => author.type !== "equipe")
          .map(author => {
            return <AuthorCard key={author.id} author={author} />;
          })}
      </ul>
    </Container>
  );
}
