import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de l\'auteur',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Type d\'auteur',
      options: [
        {
          label: 'Équipe',
          value: 'equipe',
        },
        {
          label: 'Contributeur',
          value: 'contributeur',
        },
        {
          label: 'Auteur',
          value: 'auteur',
        },
      ],
      defaultValue: 'auteur',
      admin: {
        description: 'Sélectionnez le type d\'auteur',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly version du nom',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Photo de l\'auteur',
    },
    {
      name: 'contentfulId',
      type: 'text',
      label: 'ID Contentful',
      admin: {
        description: 'ID de l\'auteur Contentful d\'origine (pour traçabilité)',
        readOnly: true,
      },
      index: true,
    },
  ],
}