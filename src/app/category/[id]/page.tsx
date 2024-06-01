import { CategoryContainer } from "@/containers/category";
import React from "react";

export default async function Category({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { p: string };
}) {
  return <CategoryContainer id={params.id} page={searchParams.p} />;
}
