import { CategoryContainer } from "@/containers/category";
import React from "react";

export const revalidate = 300;

export default async function Category({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryContainer id={id} />;
}
