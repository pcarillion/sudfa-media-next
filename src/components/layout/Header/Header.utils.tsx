import { Category } from "@/payload-types";
import { NavItem } from "./Navbar/NavBar.types";

/**
 * Convertit les catégories en éléments de navigation
 * @param {Category[]} rawCategories - Tableau des catégories depuis Payload
 * @returns {NavItem[]} Tableau d'éléments de navigation formatés
 */
export const mapCategoriesToNavItems = (
  rawCategories: Category[]
): NavItem[] => {
  return Object.values(rawCategories).map(({ name, id, order }) => {
    return {
      label: name,
      order,
      id,
    };
  });
};
