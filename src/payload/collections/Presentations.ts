import type { CollectionConfig } from 'payload'

export const Presentations: CollectionConfig = {
  slug: 'presentations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titre',
    },
    {
      name: 'shortVersion',
      type: 'richText',
      label: 'Version courte',
      admin: {
        description: 'Version courte de la présentation',
      },
    },
    {
      name: 'longVersion',
      type: 'richText',
      label: 'Version longue',
      admin: {
        description: 'Version détaillée de la présentation',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'shortVersion_html',
      type: 'textarea',
      label: 'Version courte HTML',
      admin: {
        description: 'Version HTML de la version courte (généré automatiquement)',
        readOnly: true,
      },
    },
    {
      name: 'longVersion_html',
      type: 'textarea',
      label: 'Version longue HTML',
      admin: {
        description: 'Version HTML de la version longue (généré automatiquement)',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate HTML versions from richText if needed
        if (data.shortVersion && !data.shortVersion_html) {
          data.shortVersion_html = 'Generated short HTML content'
        }
        if (data.longVersion && !data.longVersion_html) {
          data.longVersion_html = 'Generated long HTML content'
        }
        return data
      },
    ],
  },
}