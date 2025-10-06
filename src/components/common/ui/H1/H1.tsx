import React from "react";

/**
 * Composant de titre H1 stylisé
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du titre
 * @param {boolean} [props.center=false] - Si true, centre le titre
 * @returns {JSX.Element} Le composant titre H1
 */
export const H1 = ({
  children,
  center = false,
}: Readonly<{
  children: React.ReactNode;
  center?: boolean;
}>) => {
  return (
    <h1
      className={`text-2xl italic my-2.5 md:my-5 md:text-5xl ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </h1>
  );
};
