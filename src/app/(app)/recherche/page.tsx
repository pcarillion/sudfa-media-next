import React from "react";
import SearchPageClient from "@/components/search/SearchPageClient";

export const revalidate = 300;

export default function SearchPage() {
  return <SearchPageClient />;
}
