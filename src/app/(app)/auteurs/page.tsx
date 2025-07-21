import AuteursContainer from "@/containers/auteurs/Auteurs.container";
import React from "react";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Auteurs() {
  return <AuteursContainer />;
}
