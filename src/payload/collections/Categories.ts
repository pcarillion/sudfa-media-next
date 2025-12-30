import type { CollectionConfig } from "payload";

/**
 * Configuration de la collection Categories pour Payload CMS
 * Définit la structure des catégories d'articles avec nom et description
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "updatedAt"],
  },
  labels: {
    singular: "Catégorie",
    plural: "Catégories",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Nom de la catégorie",
    },
    {
      name: "order",
      type: "number",
      required: true,
      label: "Ordre",
      defaultValue: 0,
      // Deprecated: use the global "ordre menu" instead.
      admin: {
        hidden: true,
        description: "Deprecated: utilisez le global 'ordre menu'.",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
    },
    {
      name: "contentfulId",
      type: "text",
      label: "ID Contentful",
      admin: {
        description:
          "ID de la catégorie Contentful d'origine (pour traçabilité)",
        readOnly: true,
      },
      index: true,
    },
  ],
};
