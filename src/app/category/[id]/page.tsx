import { CategoryContainer } from "@/containers/category";
import React from "react";

export default async function Category({ params }: { params: { id: string } }) {
  return <CategoryContainer id={params.id} />;
}
