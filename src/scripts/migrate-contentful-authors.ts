import { createContentfulClient } from './utils/contentful-client'
import {
  initializePayloadForMigration,
  closePayloadConnections,
  logEnvironmentStatus,
  logMigrationStats,
  addDelay,
  checkIfExists,
  generateSlug,
  findMediaByContentfulId,
  MigrationStats,
  MigrationOptions
} from './utils/migration-helpers'

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

async function migrateContentfulAuthors(options: MigrationOptions = {}) {
  const { isProduction = false, batchSize = 100, delay = 100 } = options
  const envLabel = isProduction ? 'PRODUCTION' : 'LOCAL'
  
  console.log(`🚀 Démarrage de la migration des auteurs Contentful vers Payload (${envLabel})`)
  
  // Afficher le statut des variables d'environnement
  logEnvironmentStatus(isProduction)
  
  // Initialiser les clients
  const contentful = createContentfulClient()
  const payload = await initializePayloadForMigration(options)
  
  const stats: MigrationStats = { processed: 0, skipped: 0, errors: 0 }
  
  try {
    let skip = 0
    
    while (true) {
      console.log(`📄 Récupération des auteurs ${skip + 1} à ${skip + batchSize}...`)
      
      // Récupérer les auteurs de Contentful
      const response = await contentful.getEntries({
        content_type: 'auteur', // Confirmé dans contentful.ts ligne 155
        skip,
        limit: batchSize,
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
          const exists = await checkIfExists(payload, 'authors', 'contentfulId', sys.id)
          
          if (exists) {
            console.log(`⏭️  Auteur déjà migré: ${fields.nom}`)
            stats.skipped++
            continue
          }
          
          // Chercher l'image correspondante si elle existe
          let photoId = null
          if (fields.photo?.sys?.id) {
            // @ts-expect-error
            photoId = await findMediaByContentfulId(payload, fields.photo.sys.id)
            
            if (photoId) {
              console.log(`🖼️  Photo trouvée pour ${fields.nom}`)
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
          stats.processed++
          
          // Pause pour éviter de surcharger les APIs
          await addDelay(delay)
          
        } catch (error) {
          console.error(`❌ Erreur lors de la migration de l'auteur ${author.sys.id}:`, error)
          stats.errors++
          continue
        }
      }
      
      skip += batchSize
      
      // Éviter de surcharger l'API
      if (response.items.length < batchSize) {
        break
      }
    }
    
    // Afficher les statistiques finales
    logMigrationStats(stats, 'auteurs', isProduction)
    
  } catch (error) {
    console.error(`❌ Erreur lors de la migration ${envLabel}:`, error)
    throw error
  } finally {
    // Fermer les connexions
    await closePayloadConnections(payload)
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const isProduction = process.argv.includes('--prod')
  
  migrateContentfulAuthors({ isProduction })
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