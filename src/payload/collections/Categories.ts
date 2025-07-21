import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de la catégorie',
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      label: 'Ordre',
      defaultValue: 0,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
  ],
}