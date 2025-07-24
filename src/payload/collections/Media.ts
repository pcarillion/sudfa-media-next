import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
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