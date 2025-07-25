import { createClient } from 'contentful'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Collections
import { Users } from '../payload/collections/Users'
import { Categories } from '../payload/collections/Categories'
import { Authors } from '../payload/collections/Authors'
import { Articles } from '../payload/collections/Articles'
import { Presentations } from '../payload/collections/Presentations'
import { Media } from '../payload/collections/Media'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Types pour Contentful Assets
interface ContentfulAsset {
  sys: {
    id: string
    createdAt: string
    updatedAt: string
  }
  fields: {
    title: string
    description?: string
    file: {
      url: string
      details: {
        size: number
        image?: {
          width: number
          height: number
        }
      }
      fileName: string
      contentType: string
    }
  }
}

interface ContentfulResponse {
  items: ContentfulAsset[]
  total: number
  skip: number
  limit: number
}

async function downloadImage(url: string, filename: string): Promise<Buffer> {
  console.log(`📥 Téléchargement de l'image: ${filename}`)
  
  // Ajouter https: si l'URL commence par //
  const fullUrl = url.startsWith('//') ? `https:${url}` : url
  
  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`Erreur lors du téléchargement: ${response.statusText}`)
  }
  
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function migrateContentfulImagesToProd() {
  console.log('🚀 Démarrage de la migration des images Contentful vers la base de données de PRODUCTION')
  
  // Vérifier les variables d'environnement
  console.log('🔍 Variables d\'environnement:')
  console.log('CONTENTFUL_SPACE_ID:', process.env.CONTENTFUL_SPACE_ID ? 'Défini' : 'Manquant')
  console.log('CONTENTFUL_ACCESS_TOKEN:', process.env.CONTENTFUL_ACCESS_TOKEN ? 'Défini' : 'Manquant')
  console.log('NETLIFY_DATABASE_URL:', process.env.NETLIFY_DATABASE_URL ? 'Défini' : 'Manquant')
  console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Défini' : 'Manquant')
  
  // Dynamic import for cloudinary storage
  const { cloudinaryStorage } = await import('payload-storage-cloudinary')
  
  // Configuration Contentful
  const contentful = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  })
  
  // Configuration Payload pour la PRODUCTION avec Cloudinary
  const payloadConfig = buildConfig({
    admin: {
      user: 'users',
      importMap: {
        baseDir: path.resolve(__dirname, '..'),
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
    secret: process.env.PAYLOAD_SECRET!,
    typescript: {
      outputFile: path.resolve(__dirname, '..', 'payload-types.ts'),
    },
    db: postgresAdapter({
      pool: {
        connectionString: process.env.NETLIFY_DATABASE_URL!, // URL de production
      },
      push: true, // Activé temporairement pour créer les colonnes Cloudinary
    }),
    plugins: [
      cloudinaryStorage({
        cloudConfig: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        },
        collections: {
          media: true,
        },
      }),
    ],
    sharp,
  })

  // Initialiser Payload
  const payload = await getPayload({ config: payloadConfig })
  
  try {
    let skip = 0
    const limit = 100
    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    console.log('🌍 ATTENTION: Migration vers la base de données de PRODUCTION')
    console.log('📊 Connexion à la base de production...')
    
    while (true) {
      console.log(`📄 Récupération des assets ${skip + 1} à ${skip + limit}...`)
      
      // Récupérer les assets de Contentful
      const response = await contentful.getAssets({
        skip,
        limit,
        'fields.file.contentType[match]': 'image'
      }) as any as ContentfulResponse
      
      if (response.items.length === 0) {
        break
      }
      
      console.log(`✅ ${response.items.length} images trouvées`)
      
      // Traiter chaque asset
      for (const asset of response.items) {
        try {
          const { fields, sys } = asset
          const file = fields.file
          
          if (!file) {
            console.log(`⚠️  Pas de fichier pour l'asset ${sys.id}`)
            continue
          }
          
          // Vérifier si l'image existe déjà dans Payload (base de production)
          const existing = await payload.find({
            collection: 'media',
            where: {
              'contentfulId': {
                equals: sys.id
              }
            }
          })
          
          if (existing.docs.length > 0) {
            console.log(`⏭️  Image déjà migrée en prod: ${fields.title}`)
            skippedCount++
            continue
          }
          
          // Télécharger l'image depuis Contentful
          const imageBuffer = await downloadImage(file.url, file.fileName)
          
          // Créer le média dans Payload PRODUCTION avec upload Cloudinary
          const payloadMedia = await payload.create({
            collection: 'media',
            data: {
              alt: fields.title || file.fileName,
              legend: fields.description || '',
              // Champs personnalisés pour traçabilité
              contentfulId: sys.id,
            },
            file: {
              data: imageBuffer,
              mimetype: file.contentType,
              name: file.fileName,
              size: file.details.size
            }
          })
          
          console.log(`✅ Image migrée en PROD: ${fields.title} → ${payloadMedia.id}`)
          processedCount++
          
          // Pause courte pour éviter de surcharger les APIs
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`❌ Erreur lors de la migration de l'asset ${asset.sys.id}:`, error)
          errorCount++
          continue
        }
      }
      
      skip += limit
      
      // Éviter de surcharger l'API
      if (response.items.length < limit) {
        break
      }
    }
    
    console.log('\n🎉 MIGRATION PRODUCTION TERMINÉE !')
    console.log(`📊 Statistiques:`)
    console.log(`   ✅ Images migrées: ${processedCount}`)
    console.log(`   ⏭️  Images déjà présentes: ${skippedCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    console.log(`   🌍 Destination: BASE DE DONNÉES DE PRODUCTION`)
    console.log(`   ☁️  Stockage: Cloudinary`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration vers la production:', error)
    throw error
  } finally {
    // Fermer les connexions
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateContentfulImagesToProd()
    .then(() => {
      console.log('✅ Script de migration vers la PRODUCTION terminé')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur fatale lors de la migration PRODUCTION:', error)
      process.exit(1)
    })
}

export default migrateContentfulImagesToProd