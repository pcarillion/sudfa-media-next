import { cn } from "@/components/utils";
import React from "react";

/**
 * Composant de titre H4 stylisé
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du titre
 * @returns {JSX.Element} Le composant titre H4
 */
export const H4 = ({
  children,
  classAdd,
}: Readonly<{
  children: React.ReactNode;
  classAdd?: string;
}>) => {
  return <h4 className={cn("text-xl text-bold", classAdd)}>{children}</h4>;
};
