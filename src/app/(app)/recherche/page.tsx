import React from "react";
import SearchPageClient from "@/components/search/SearchPageClient";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SearchPage() {
  return <SearchPageClient />;
}
