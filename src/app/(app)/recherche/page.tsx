import React from "react";
import SearchPageClient from "@/components/search/SearchPageClient";
import { Suspense } from "react";

export const revalidate = 300;

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageClient />
    </Suspense>
  );
}
