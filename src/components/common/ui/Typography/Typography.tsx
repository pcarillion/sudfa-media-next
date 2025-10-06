import React from "react";

/**
 * Composant de typographie générique
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du composant
 * @param {string} [props.classAdd] - Classes CSS additionnelles
 * @param {boolean} [props.center=false] - Si true, centre le texte
 * @param {boolean} [props.small=false] - Si true, utilise une taille de police plus petite
 * @returns {JSX.Element} Le composant typographie
 */
export const Typography = ({
  children,
  classAdd,
  center = false,
  small = false,
}: Readonly<{
  children: React.ReactNode;
  center?: boolean;
  classAdd?: string;
  small?: boolean;
}>) => {
  let className = "w-full ";
  if (classAdd) className += classAdd;
  if (center) className += " text-center";
  className += small ? " text-base" : " text-lg ";
  return <div className={className}>{children}</div>;
};
