import type { GlobalConfig } from "payload";

type CategoryDoc = {
  id: number | string;
  name?: string | null;
  order?: number | null;
};

type OrdreMenuItem = {
  itemType:
    | "accueil"
    | "categorie"
    | "auteurs"
    | "a-propos"
    | "recherche";
  category?: number | string | CategoryDoc | null;
};

const normalizeCategoryId = (
  value: OrdreMenuItem["category"]
): number | string | null => {
  if (!value) return null;
  if (typeof value === "object") {
    return value.id ?? null;
  }
  return value;
};

const buildKey = (item: OrdreMenuItem) => {
  if (item.itemType === "categorie") {
    const categoryId = normalizeCategoryId(item.category);
    return categoryId ? `category:${categoryId}` : null;
  }
  return `static:${item.itemType}`;
};

const buildOrderedItems = async (
  data: unknown,
  req: { payload: any }
) => {
  const categories = await req.payload.find({
    collection: "categories",
    pagination: false,
    limit: 0,
    sort: "name",
  });

  const sortedCategories = [...(categories.docs as CategoryDoc[])].sort(
    (a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.name || "").localeCompare(b.name || "");
    }
  );

  const desired: OrdreMenuItem[] = [];
  desired.push({ itemType: "accueil" });

  for (const category of sortedCategories) {
    desired.push({ itemType: "categorie", category: category.id });
  }

  desired.push({ itemType: "auteurs" });
  desired.push({ itemType: "a-propos" });
  desired.push({ itemType: "recherche" });

  const desiredByKey = new Map<string, OrdreMenuItem>();
  for (const item of desired) {
    const key = buildKey(item);
    if (key) desiredByKey.set(key, item);
  }

  const existing = Array.isArray((data as { items?: unknown })?.items)
    ? ((data as { items?: OrdreMenuItem[] }).items as OrdreMenuItem[])
    : [];

  const orderedKeys: string[] = [];
  const seen = new Set<string>();
  for (const item of existing) {
    const key = buildKey(item);
    if (!key || !desiredByKey.has(key) || seen.has(key)) continue;
    orderedKeys.push(key);
    seen.add(key);
  }

  for (const item of desired) {
    const key = buildKey(item);
    if (!key || seen.has(key)) continue;
    orderedKeys.push(key);
    seen.add(key);
  }

  const items = orderedKeys
    .map((key) => desiredByKey.get(key))
    .filter((item): item is OrdreMenuItem => Boolean(item));

  return {
    ...(data as Record<string, unknown>),
    items,
  };
};

export const OrdreMenu: GlobalConfig = {
  slug: "ordre-menu",
  label: "Ordre menu",
  admin: {
    description: "Ordonnez les items du menu par glisser-deposer.",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        return buildOrderedItems(doc, req);
      },
    ],
    beforeValidate: [
      async ({ data, req }) => {
        return buildOrderedItems(data ?? {}, req);
      },
    ],
  },
  fields: [
    {
      name: "items",
      label: "Items du menu",
      type: "array",
      admin: {
        className: "ordre-menu-list",
      },
      fields: [
        {
          name: "itemType",
          label: "Type",
          type: "select",
          required: true,
          options: [
            { label: "Accueil", value: "accueil" },
            { label: "Categorie", value: "categorie" },
            { label: "Contributeurs", value: "auteurs" },
            { label: "A propos", value: "a-propos" },
            { label: "Recherche", value: "recherche" },
          ],
        },
        {
          name: "category",
          label: "Categorie",
          type: "relationship",
          relationTo: "categories",
          admin: {
            condition: (_data, siblingData) =>
              siblingData?.itemType === "categorie",
          },
        },
      ],
    },
  ],
};
