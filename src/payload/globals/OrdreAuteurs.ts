import type { GlobalConfig } from "payload";

type AuthorDoc = {
  id: number | string;
  name?: string | null;
  type?: "equipe" | "contributeur" | "auteur" | null;
};

const normalizeIds = (value: unknown): Array<number | string> => {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      if (item && typeof item === "object") {
        const record = item as { id?: number | string };
        return record.id;
      }
      return item as number | string;
    })
    .filter(
      (id): id is number | string =>
        typeof id === "string" || typeof id === "number"
    );
};

const orderWithAppend = (
  existing: Array<number | string>,
  desired: Array<number | string>
) => {
  const desiredSet = new Set(desired);
  const kept = existing.filter(id => desiredSet.has(id));
  const keptSet = new Set(kept);
  const missing = desired.filter(id => !keptSet.has(id));
  return [...kept, ...missing];
};

const buildOrderedLists = async (data: unknown, req: { payload: any }) => {
  const authors = await req.payload.find({
    collection: "authors",
    pagination: false,
    limit: 0,
    sort: "name",
  });

  const equipe = [];
  const horsEquipe = [];
  for (const author of authors.docs as AuthorDoc[]) {
    if (author.type === "equipe") {
      equipe.push(author.id);
    } else {
      horsEquipe.push(author.id);
    }
  }

  const currentEquipe = normalizeIds((data as { equipe?: unknown })?.equipe);
  const currentHorsEquipe = normalizeIds(
    (data as { horsEquipe?: unknown })?.horsEquipe
  );

  return {
    ...(data as Record<string, unknown>),
    equipe: orderWithAppend(currentEquipe, equipe),
    horsEquipe: orderWithAppend(currentHorsEquipe, horsEquipe),
  };
};

export const OrdreAuteurs: GlobalConfig = {
  slug: "ordre-auteurs",
  label: "Ordre des auteurs",
  admin: {
    description:
      "Mettez les auteurs dans l'ordre pour l'equipe et les contributeurs.",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        return buildOrderedLists(doc, req);
      },
    ],
    beforeValidate: [
      async ({ data, req }) => {
        return buildOrderedLists(data ?? {}, req);
      },
    ],
  },
  fields: [
    {
      name: "equipe",
      label: "Equipe",
      type: "relationship",
      relationTo: "authors",
      hasMany: true,
    },
    {
      name: "horsEquipe",
      label: "Contributeurs",
      type: "relationship",
      relationTo: "authors",
      hasMany: true,
    },
  ],
};
