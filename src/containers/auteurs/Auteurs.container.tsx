import { AuthorCard } from "@/components/authors/AuthorCard";
import { Container } from "@/components/common/Container";
import { H1 } from "@/components/common/ui/H1";
import { H3 } from "@/components/common/ui/H3";
import { Api } from "@/lib/api";
import React from "react";

export default async function AuteursContainer() {
  const api = await Api();
  const authors = await api.getAuthors();
  const ordreAuteurs = await api.getOrdreAuteurs();
  const authorsById = new Map(authors.map(author => [author.id, author]));

  const normalizeId = (
    value: typeof authors[number] | number | string
  ): number | null => {
    if (value && typeof value === "object") {
      return value.id;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return typeof value === "number" ? value : null;
  };

  const orderAuthors = (
    orderedList: Array<typeof authors[number] | number | string> | undefined,
    predicate: (author: typeof authors[number]) => boolean
  ) => {
    const orderedIds = (orderedList ?? [])
      .map(normalizeId)
      .filter((id): id is number => id !== null);
    const ordered = orderedIds
      .map(id => authorsById.get(id))
      .filter((author): author is typeof authors[number] => Boolean(author))
      .filter(predicate);
    const orderedSet = new Set(ordered.map(author => author.id));
    const remaining = authors.filter(
      author => predicate(author) && !orderedSet.has(author.id)
    );
    return [...ordered, ...remaining];
  };

  const equipeAuthors = orderAuthors(
    ordreAuteurs?.equipe,
    author => author.type === "equipe"
  );
  const horsEquipeAuthors = orderAuthors(
    ordreAuteurs?.horsEquipe,
    author => author.type !== "equipe"
  );
  return (
    <Container>
      <H1 center>Contributeurs</H1>
      <H3 classAdd="md:px-36 px-3">L&apos;Equipe</H3>
      <ul className="py-">
        {equipeAuthors.map(author => {
          return <AuthorCard key={author.id} author={author} />;
        })}
      </ul>
      <H3 classAdd="md:px-36 px-3">Les contributeurs</H3>
      <ul className="py-">
        {horsEquipeAuthors.map(author => {
          return <AuthorCard key={author.id} author={author} />;
        })}
      </ul>
    </Container>
  );
}
