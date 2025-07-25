import type { GlobalConfig } from "payload";

export const Links: GlobalConfig = {
  slug: "links",
  label: "Liens",
  admin: {
    description: "Tous les liens sur les différentes pages",
  },
  fields: [
    {
      name: "instagramUrl",
      type: "text",
      label: "Instagram",
    },
    {
      name: "facebookUrl",
      type: "text",
      label: "Facebook",
    },
    {
      name: "mediapartUrl",
      type: "text",
      label: "Mediapart",
    },
    {
      name: "cagnotteUrl",
      type: "text",
      label: "Cagnotte",
    },
  ],
  access: {
    read: () => true, // Public en lecture
    update: ({ req: { user } }) => Boolean(user), // Seuls les utilisateurs connect�s peuvent modifier
  },
};
