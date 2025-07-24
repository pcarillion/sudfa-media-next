import type { CollectionConfig } from 'payload'

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
    {
      name: 'originalUrl',
      type: 'text',
      label: 'URL d\'origine',
      admin: {
        description: 'URL originale de l\'image dans Contentful',
        readOnly: true,
      },
    },
    // Champs ajoutés automatiquement par payload-storage-cloudinary
    {
      name: 'cloudinaryPublicId',
      type: 'text',
      label: 'Cloudinary Public ID',
      admin: {
        description: 'ID public Cloudinary de l\'image',
        readOnly: true,
      },
    },
    {
      name: 'cloudinaryUrl', 
      type: 'text',
      label: 'Cloudinary URL',
      admin: {
        description: 'URL Cloudinary de l\'image',
        readOnly: true,
      },
    },
    {
      name: 'cloudinaryResourceType',
      type: 'text',
      label: 'Cloudinary Resource Type',
      admin: {
        description: 'Type de ressource Cloudinary',
        readOnly: true,
      },
    },
    {
      name: 'cloudinaryFormat',
      type: 'text', 
      label: 'Cloudinary Format',
      admin: {
        description: 'Format de l\'image sur Cloudinary',
        readOnly: true,
      },
    },
    {
      name: 'cloudinaryVersion',
      type: 'text',
      label: 'Cloudinary Version',
      admin: {
        description: 'Version de l\'image sur Cloudinary',
        readOnly: true,
      },
    },
    {
      name: 'transformedUrl',
      type: 'text',
      label: 'URL transformée',
      admin: {
        description: 'URL de l\'image transformée',
        readOnly: true,
      },  
    },
    // Champs standards d'upload Payload
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      admin: {
        description: 'URL de l\'image',
        readOnly: true,
      },
    },
    {
      name: 'thumbnailURL',
      type: 'text',
      label: 'URL thumbnail',
      admin: {
        description: 'URL de la miniature',
        readOnly: true,
      },
    },
    {
      name: 'filename',
      type: 'text',
      label: 'Nom du fichier',
      admin: {
        description: 'Nom du fichier uploadé',
        readOnly: true,
      },
    },
    {
      name: 'mimeType',
      type: 'text',
      label: 'Type MIME',
      admin: {
        description: 'Type MIME du fichier',
        readOnly: true,
      },
    },
    {
      name: 'filesize',
      type: 'number',
      label: 'Taille du fichier',
      admin: {
        description: 'Taille du fichier en octets',
        readOnly: true,
      },
    },
    {
      name: 'width',
      type: 'number',
      label: 'Largeur',
      admin: {
        description: 'Largeur de l\'image en pixels',
        readOnly: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Hauteur',
      admin: {
        description: 'Hauteur de l\'image en pixels',
        readOnly: true,
      },
    },
    {
      name: 'focalX',
      type: 'number',
      label: 'Point focal X',
      admin: {
        description: 'Coordonnée X du point focal',
        readOnly: true,
      },
    },
    {
      name: 'focalY',
      type: 'number',
      label: 'Point focal Y',
      admin: {
        description: 'Coordonnée Y du point focal',
        readOnly: true,
      },
    },
  ],
}