import type { CollectionConfig, Field } from 'payload'



export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
      required: true,
    },
    {
      name: 'legend',
      type: 'text',
      label: 'Légende',
    },
    {
      name: 'contentfulId',
      type: 'text',
      label: 'ID Contentful',
      admin: {
        description: 'ID de l\'asset Contentful d\'origine (pour traçabilité)',
        readOnly: true,
      },
      index: true,
    },
  ],
}