import type { CollectionConfig } from "payload";

/**
 * Configuration de la collection Articles pour Payload CMS
 * Définit la structure des articles avec titre, contenu, auteurs, catégories, etc.
 */
export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "titre",
    defaultColumns: ["titre", "date", "category", "authors", "updatedAt"],
    preview: ({ slug }) => {
      if (!slug) return null;
      const params = new URLSearchParams({
        slug: slug as string,
        collection: "articles",
        path: `/article/${slug}`,
        previewSecret: process.env.PREVIEW_SECRET || "",
      });
      return `/preview?${params.toString()}`;
    },
  },
  labels: {
    singular: "Article",
    plural: "Articles",
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "titre",
      type: "text",
      required: true,
      label: "Titre de l'article",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Slug",
      admin: {
        description: "URL-friendly version du titre",
      },
    },
    {
      name: "date",
      type: "date",
      required: true,
      label: "Date de publication",
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      label: "Catégorie",
    },
    {
      name: "authors",
      type: "relationship",
      relationTo: "authors",
      hasMany: true,
      required: true,
      label: "Auteurs",
    },
    {
      name: "photoPrincipale",
      type: "upload",
      relationTo: "media",
      required: false,
      label: "Photo principale",
    },
    {
      name: "presentation",
      type: "richText",
      label: "Présentation",
      admin: {
        description: "Courte présentation de l'article",
      },
    },
    {
      name: "article",
      type: "richText",
      label: "Contenu de l'article",
      admin: {
        description: "Contenu principal de l'article",
      },
    },
    {
      name: "content_html",
      type: "textarea",
      label: "Contenu HTML",
      admin: {
        description: "Version HTML du contenu (généré automatiquement)",
        readOnly: true,
      },
    },
    {
      name: "contentfulId",
      type: "text",
      label: "ID Contentful",
      admin: {
        description: "ID de l'article Contentful d'origine (pour traçabilité)",
        readOnly: true,
      },
      index: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate content_html from richText if needed
        if (data.article && !data.content_html) {
          // This would need proper rich text to HTML conversion
          data.content_html = "Generated HTML content";
        }
        return data;
      },
    ],
  },
};
