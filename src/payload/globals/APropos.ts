import type { GlobalConfig } from "payload";

export const APropos: GlobalConfig = {
  slug: "apropos",
  label: "A propos",
  fields: [
    {
      name: "content",
      type: "richText",
      label: "Contenu de la page « A propos »",
    },
  ],
  access: {
    read: () => true, // Public en lecture
    update: ({ req: { user } }) => Boolean(user), // Seuls les utilisateurs connect�s peuvent modifier
  },
};
