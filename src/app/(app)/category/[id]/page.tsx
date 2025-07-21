import { CategoryContainer } from "@/containers/category";
import React from "react";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Category({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryContainer id={id} />;
}
