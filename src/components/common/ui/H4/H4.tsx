import React from "react";

/**
 * Composant de titre H4 stylisé
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du titre
 * @returns {JSX.Element} Le composant titre H4
 */
export const H4 = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <h4 className="text-xl text-bold">{children}</h4>;
};
