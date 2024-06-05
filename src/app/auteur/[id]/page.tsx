import { AuteurContainer } from "@/containers/auteur";
import { Api } from "@/lib/api";
import { Metadata } from "next";
import React from "react";

interface AuteurPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: AuteurPageProps): Promise<Metadata> {
  const id = params.id;
  const api = await Api();
  const author = await api.getAuthorById(id);
  return {
    title: `Sudfa média - ${author.name}`,
    description: author.description,
    openGraph: {
      images: [author.photo],
    },
  };
}

export default async function Auteur({ params }: AuteurPageProps) {
  return <AuteurContainer id={params.id} />;
}
