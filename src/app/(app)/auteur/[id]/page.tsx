import { AuteurContainer } from "@/containers/auteur";
import { Api } from "@/lib/api";
import { Metadata } from "next";
import React from "react";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AuteurPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AuteurPageProps): Promise<Metadata> {
  const { id } = await params;
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
  const { id } = await params;
  return <AuteurContainer id={id} />;
}
