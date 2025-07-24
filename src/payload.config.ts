import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

// Import collections
import { Users } from './payload/collections/Users'
import { Categories } from './payload/collections/Categories'
import { Authors } from './payload/collections/Authors'
import { Articles } from './payload/collections/Articles'
import { Presentations } from './payload/collections/Presentations'
import { Media } from './payload/collections/Media'
import { cloudinaryStorage } from 'payload-storage-cloudinary'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)


export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Categories,
    Authors,
    Articles,
    Presentations,
    Media,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false, // Temporarily enabled to recreate media table
    // logger: process.env.NODE_ENV === 'development',
  }),
  sharp,
  plugins: [
    cloudinaryStorage({
      cloudConfig: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      },
      collections: {
        media: true, // Simple config - just works!
      },
    }),
  // ],
  ],
})