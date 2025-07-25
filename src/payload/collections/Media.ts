import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Média",
    plural: "Médias",
  },
  upload: {
    staticDir: "media_s3",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: [
      "image/*",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texte alternatif",
      required: true,
    },
    {
      name: "legend",
      type: "text",
      label: "Légende",
    },
    {
      name: "contentfulId",
      type: "text",
      label: "ID Contentful",
      admin: {
        description: "ID de l'asset Contentful d'origine (pour traçabilité)",
        readOnly: true,
      },
      index: true,
    },
    {
      name: "migratedFrom",
      type: "text",
      label: "Migré depuis",
      defaultValue: "cloudinary",
      admin: {
        description: "Source de migration (cloudinary, local, etc.)",
        readOnly: true,
      },
    },
    {
      name: "migrationDate",
      type: "date",
      label: "Date de migration",
      defaultValue: () => new Date(),
      admin: {
        description: "Date de migration vers S3",
        readOnly: true,
      },
    },
  ],
  admin: {
    description: "Collection de médias stockés sur AWS S3",
  },
};
