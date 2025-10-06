import React from "react";

/**
 * Composant conteneur avec largeur maximale et padding responsive
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du conteneur
 * @param {string} [props.addClass=""] - Classes CSS additionnelles
 * @returns {JSX.Element} Le composant conteneur
 */
export const Container = ({
  children,
  addClass = "",
}: Readonly<{
  children: React.ReactNode;
  addClass?: string;
}>) => {
  return (
    <div className={`container-xl mx-auto px-3 md:px-8 ${addClass}`}>
      {children}
    </div>
  );
};
