/**
 * Type définissant un élément de navigation
 */
export type NavItem = {
  /** Libellé à afficher dans la navigation */
  label: string;
  /** Ordre d'affichage dans le menu */
  order: number;
  /** Identifiant unique de l'élément */
  id: number;
};
