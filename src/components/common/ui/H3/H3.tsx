import React from "react";

/**
 * Composant de titre H3 stylisé
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du titre
 * @param {boolean} [props.center=false] - Si true, centre le titre
 * @param {string} [props.classAdd=""] - Classes CSS additionnelles
 * @returns {JSX.Element} Le composant titre H3
 */
export const H3 = ({
  children,
  center = false,
  classAdd = "",
}: Readonly<{
  children: React.ReactNode;
  center?: boolean;
  classAdd?: string;
}>) => {
  return (
    <h3
      className={`text-2xl text-bold ${classAdd} ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </h3>
  );
};
