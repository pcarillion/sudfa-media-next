import { AuthorCard } from "@/components/authors/AuthorCard";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { Api } from "@/lib/api";
import React from "react";

export default async function AuteursContainer() {
  const api = await Api();
  const authors = await api.getAuthors();
  return (
    <Container>
      <H1 center>Les Auteur-e-s</H1>
      <ul className="py-">
        {authors.map((author) => {
          return <AuthorCard key={author.id} author={author} />;
        })}
      </ul>
    </Container>
  );
}
