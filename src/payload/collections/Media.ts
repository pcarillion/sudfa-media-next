import type { CollectionConfig, Field } from 'payload'

// Champs techniques nécessaires pour éviter les warnings de déploiement
const technicalFields: Field[] = process.env.NODE_ENV === 'production' || process.env.VERCEL ? [
  // Champs Cloudinary (évite les warnings de suppression)
  { name: 'cloudinaryPublicId', type: 'text', admin: { hidden: true } },
  { name: 'cloudinaryUrl', type: 'text', admin: { hidden: true } },
  { name: 'cloudinaryResourceType', type: 'text', admin: { hidden: true } },
  { name: 'cloudinaryFormat', type: 'text', admin: { hidden: true } },
  { name: 'cloudinaryVersion', type: 'text', admin: { hidden: true } },
  { name: 'originalUrl', type: 'text', admin: { hidden: true } },
  { name: 'transformedUrl', type: 'text', admin: { hidden: true } },
  // Champs standards d'upload Payload
  { name: 'url', type: 'text', admin: { hidden: true } },
  { name: 'thumbnailURL', type: 'text', admin: { hidden: true } },
  { name: 'filename', type: 'text', admin: { hidden: true } },
  { name: 'mimeType', type: 'text', admin: { hidden: true } },
  { name: 'filesize', type: 'number', admin: { hidden: true } },
  { name: 'width', type: 'number', admin: { hidden: true } },
  { name: 'height', type: 'number', admin: { hidden: true } },
  { name: 'focalX', type: 'number', admin: { hidden: true } },
  { name: 'focalY', type: 'number', admin: { hidden: true } },
] : [
  
]

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
    ...technicalFields,
  ],
}