import { createContentfulClient, downloadImageFromContentful } from './utils/contentful-client'
import {
  initializePayloadForMigration,
  closePayloadConnections,
  logEnvironmentStatus,
  logMigrationStats,
  addDelay,
  checkIfExists,
  MigrationStats,
  MigrationOptions
} from './utils/migration-helpers'

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

async function migrateContentfulImages(options: MigrationOptions = {}) {
  const { isProduction = false, batchSize = 100, delay = 100 } = options
  const envLabel = isProduction ? 'PRODUCTION' : 'LOCAL'
  
  console.log(`🚀 Démarrage de la migration des images Contentful vers Payload (${envLabel})`)
  
  // Afficher le statut des variables d'environnement
  logEnvironmentStatus(isProduction)
  
  // Initialiser les clients
  const contentful = createContentfulClient()
  const payload = await initializePayloadForMigration(options)
  
  const stats: MigrationStats = { processed: 0, skipped: 0, errors: 0 }
  
  try {
    let skip = 0
    
    while (true) {
      console.log(`📄 Récupération des assets ${skip + 1} à ${skip + batchSize}...`)
      
      // Récupérer les assets de Contentful
      const response = await contentful.getAssets({
        skip,
        limit: batchSize,
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
          
          // Vérifier si l'image existe déjà dans Payload
          const exists = await checkIfExists(payload, 'media', 'contentfulId', sys.id)
          
          if (exists) {
            console.log(`⏭️  Image déjà migrée: ${fields.title}`)
            stats.skipped++
            continue
          }
          
          // Télécharger l'image
          const imageBuffer = await downloadImageFromContentful(file.url, file.fileName)
          
          // Créer le média dans Payload
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
          
          console.log(`✅ Image migrée: ${fields.title} → ${payloadMedia.id}`)
          stats.processed++
          
          // Pause pour éviter de surcharger les APIs
          await addDelay(delay)
          
        } catch (error) {
          console.error(`❌ Erreur lors de la migration de l'asset ${asset.sys.id}:`, error)
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
    logMigrationStats(stats, 'images', isProduction)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    // Fermer les connexions
    await closePayloadConnections(payload)
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const isProduction = process.argv.includes('--prod')
  
  migrateContentfulImages({ isProduction })
    .then(() => {
      console.log(`✅ Script de migration images ${isProduction ? 'PRODUCTION' : 'LOCAL'} terminé`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error)
      process.exit(1)
    })
}

export default migrateContentfulImages