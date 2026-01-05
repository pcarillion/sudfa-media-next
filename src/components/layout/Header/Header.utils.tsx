import { Category } from "@/payload-types";
import {
  MenuItem,
} from "./Navbar/NavBar.types";
import { OrdreMenuGlobal } from "@/lib/service/payload/api.types";

type StaticMenuType = Exclude<MenuItem["type"], "category">;
type StaticMenuItem = Extract<MenuItem, { type: StaticMenuType }>;

const normalizeCategoryId = (
  value: Category | number | string | null | undefined
): number | null => {
  if (!value) return null;
  if (typeof value === "object") {
    return typeof value.id === "number" ? value.id : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return value;
};

/**
 * Construit la liste ordonnée des items du menu (categories + items fixes).
 * @param {Category[]} rawCategories - Tableau des catégories depuis Payload
 * @param {OrdreMenuGlobal | null} ordreMenu - Ordre personnalisé du menu
 * @returns {MenuItem[]} Tableau d'éléments de navigation formatés
 */
export const buildMenuItems = (
  rawCategories: Category[],
  ordreMenu: OrdreMenuGlobal | null
): MenuItem[] => {
  const categories = [...rawCategories].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );
  const categoriesById = new Map(
    categories.map(category => [category.id, category])
  );

  const staticItems: Record<StaticMenuType, StaticMenuItem> = {
    accueil: { type: "accueil", label: "Accueil", href: "/" },
    auteurs: { type: "auteurs", label: "Contributeurs", href: "/auteurs" },
    "a-propos": { type: "a-propos", label: "A propos", href: "/a-propos" },
    recherche: { type: "recherche", label: "Recherche", href: "/recherche" },
  };

  const items: MenuItem[] = [];
  const seen = new Set<string>();

  const pushStatic = (type: StaticMenuType) => {
    if (seen.has(type)) return;
    items.push(staticItems[type]);
    seen.add(type);
  };

  const pushCategory = (id: number) => {
    const key = `category:${id}`;
    if (seen.has(key)) return;
    const category = categoriesById.get(id);
    if (!category) return;
    items.push({
      type: "category",
      id: category.id,
      label: category.name ?? "Categorie",
      href: `/category/${category.id}`,
    });
    seen.add(key);
  };

  const ordered = ordreMenu?.items ?? [];
  for (const item of ordered) {
    if (item?.itemType === "categorie") {
      const id = normalizeCategoryId(item.category);
      if (id !== null) pushCategory(id);
      continue;
    }
    if (item?.itemType && item.itemType in staticItems) {
      pushStatic(item.itemType as StaticMenuType);
    }
  }

  pushStatic("accueil");
  for (const category of categories) {
    pushCategory(category.id);
  }
  pushStatic("auteurs");
  pushStatic("a-propos");
  pushStatic("recherche");

  return items;
};
