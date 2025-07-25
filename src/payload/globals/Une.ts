import type { GlobalConfig } from "payload";

export const Une: GlobalConfig = {
  slug: "une",
  label: "A la Une",
  admin: {
    description: "Gérez les articles de la Une (6 articles maximum)",
  },
  fields: [
    {
      name: "articles",
      type: "relationship",
      relationTo: "articles",
      hasMany: true,
      maxRows: 6,
      required: true,
      admin: {
        description: "Sélectionnez les 6 articles à afficher sur la Une",
      },
      validate: value => {
        if (!value || value.length === 0) {
          return "Au moins un article est requis";
        }
        if (value.length > 6) {
          return "Maximum 6 articles autorisés";
        }
        return true;
      },
    },
  ],
  access: {
    read: () => true, // Public en lecture
    update: ({ req: { user } }) => Boolean(user), // Seuls les utilisateurs connect�s peuvent modifier
  },
};
