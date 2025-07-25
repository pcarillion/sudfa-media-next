import { Category } from "@/payload-types";
import { NavItem } from "./Navbar/NavBar.types";

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
