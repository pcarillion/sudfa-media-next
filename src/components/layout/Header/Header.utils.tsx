import { Categories } from "@/types/api.types";
import { NavItem } from "./Navbar/NavBar.types";

export const mapCategoriesToNavItems = (
  rawCategories: Categories
): NavItem[] => {
  return Object.values(rawCategories).map(({ name, id, order }) => {
    return {
      label: name,
      order,
      id,
    };
  });
};
