import AuteursContainer from "@/containers/auteurs/Auteurs.container";
import React from "react";

export const revalidate = 300;

export default async function Auteurs() {
  return <AuteursContainer />;
}
