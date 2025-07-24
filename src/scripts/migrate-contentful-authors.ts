import { createClient } from 'contentful'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
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

// Types pour Contentful Authors (basé sur contentful.types.ts)
interface ContentfulAuthor {
  sys: {
    id: string
    createdAt: string
    updatedAt: string
  }
  fields: {
    nom: string
    description: string
    slug: string
    photo: {
      sys: {
        id: string
      }
      fields?: {
        file: {
          url: string
          fileName: string
        }
        description: string
      }
    }
  }
}

interface ContentfulResponse {
  items: ContentfulAuthor[]
  total: number
  skip: number
  limit: number
}

// Fonction pour générer un slug à partir du nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim()
}

async function migrateContentfulAuthors(isProduction = false) {
  const dbUrl = isProduction ? process.env.NETLIFY_DATABASE_URL : process.env.DATABASE_URL
  const envLabel = isProduction ? 'PRODUCTION' : 'LOCAL'
  
  console.log(`🚀 Démarrage de la migration des auteurs Contentful vers Payload (${envLabel})`)
  
  // Vérifier les variables d'environnement
  console.log('🔍 Variables d\'environnement:')
  console.log('CONTENTFUL_SPACE_ID:', process.env.CONTENTFUL_SPACE_ID ? 'Défini' : 'Manquant')
  console.log('CONTENTFUL_ACCESS_TOKEN:', process.env.CONTENTFUL_ACCESS_TOKEN ? 'Défini' : 'Manquant')
  console.log(`${isProduction ? 'NETLIFY_DATABASE_URL' : 'DATABASE_URL'}:`, dbUrl ? 'Défini' : 'Manquant')
  console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Défini' : 'Manquant')
  
  // Dynamic import for cloudinary storage
  const { cloudinaryStorage } = await import('payload-storage-cloudinary')
  
  // Configuration Contentful
  const contentful = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  })
  
  // Configuration Payload
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
        connectionString: dbUrl!,
      },
      push: isProduction, // Push seulement en production si nécessaire
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
    
    console.log(`🌍 Migration vers la base de données ${envLabel}`)
    console.log('📊 Connexion à la base...')
    
    while (true) {
      console.log(`📄 Récupération des auteurs ${skip + 1} à ${skip + limit}...`)
      
      // Récupérer les auteurs de Contentful
      const response = await contentful.getEntries({
        content_type: 'auteur', // Confirmé dans contentful.ts ligne 155
        skip,
        limit,
      }) as any as ContentfulResponse
      
      if (response.items.length === 0) {
        break
      }
      
      console.log(`✅ ${response.items.length} auteurs trouvés`)
      
      // Traiter chaque auteur
      for (const author of response.items) {
        try {
          const { fields, sys } = author
          
          if (!fields.nom) {
            console.log(`⚠️  Pas de nom pour l'auteur ${sys.id}`)
            continue
          }
          
          // Vérifier si l'auteur existe déjà dans Payload
          const existing = await payload.find({
            collection: 'authors',
            where: {
              'contentfulId': {
                equals: sys.id
              }
            }
          })
          
          if (existing.docs.length > 0) {
            console.log(`⏭️  Auteur déjà migré: ${fields.nom}`)
            skippedCount++
            continue
          }
          
          // Chercher l'image correspondante si elle existe
          let photoId = null
          if (fields.photo?.sys?.id) {
            const mediaResult = await payload.find({
              collection: 'media',
              where: {
                'contentfulId': {
                  equals: fields.photo.sys.id
                }
              }
            })
            
            if (mediaResult.docs.length > 0) {
              // @ts-expect-error expects error here
              photoId = mediaResult.docs[0].id
              console.log(`🖼️  Photo trouvée pour ${fields.nom}: ${mediaResult.docs[0].alt}`)
            } else {
              console.log(`⚠️  Photo non trouvée pour ${fields.nom} (Contentful ID: ${fields.photo.sys.id})`)
            }
          }
          
          // Utiliser le slug de Contentful ou en générer un
          const slug = fields.slug || generateSlug(fields.nom)
          
          // Créer l'auteur dans Payload
          const payloadAuthor = await payload.create({
            collection: 'authors',
            data: {
              name: fields.nom,
              type: 'auteur', // Type par défaut, pas de typeAuteur dans Contentful
              slug: slug,
              description: fields.description || `Auteur migré depuis Contentful le ${new Date().toLocaleDateString('fr-FR')}`,
              photo: photoId,
              // Champ personnalisé pour traçabilité
              contentfulId: sys.id,
            }
          })
          
          console.log(`✅ Auteur migré: ${fields.nom} → ${payloadAuthor.id}`)
          processedCount++
          
          // Pause courte pour éviter de surcharger les APIs
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`❌ Erreur lors de la migration de l'auteur ${author.sys.id}:`, error)
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
    
    console.log(`\n🎉 MIGRATION ${envLabel} TERMINÉE !`)
    console.log(`📊 Statistiques:`)
    console.log(`   ✅ Auteurs migrés: ${processedCount}`)
    console.log(`   ⏭️  Auteurs déjà présents: ${skippedCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    console.log(`   🌍 Destination: BASE DE DONNÉES ${envLabel}`)
    
  } catch (error) {
    console.error(`❌ Erreur lors de la migration ${envLabel}:`, error)
    throw error
  } finally {
    // Fermer les connexions
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  }
}

// Fonction pour migration locale
export async function migrateAuthorsLocal() {
  return migrateContentfulAuthors(false)
}

// Fonction pour migration production
export async function migrateAuthorsProd() {
  return migrateContentfulAuthors(true)
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const isProduction = process.argv.includes('--prod')
  
  migrateContentfulAuthors(isProduction)
    .then(() => {
      console.log(`✅ Script de migration auteurs ${isProduction ? 'PRODUCTION' : 'LOCAL'} terminé`)
      process.exit(0)
    })
    .catch((error) => {
      console.error(`❌ Erreur fatale lors de la migration auteurs:`, error)
      process.exit(1)
    })
}

export default migrateContentfulAuthors