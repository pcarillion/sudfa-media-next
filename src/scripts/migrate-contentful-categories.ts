import {
  initializePayloadForMigration,
  closePayloadConnections,
  logMigrationStats,
  addDelay,
  checkIfExists,
  MigrationStats,
  MigrationOptions
} from './utils/migration-helpers'

// Import des catégories Contentful
import { ContentfulCategories } from '../lib/service/contentful/contentful.utils'

async function migrateContentfulCategories(options: MigrationOptions = {}) {
  const { isProduction = false, delay = 50 } = options
  const envLabel = isProduction ? 'PRODUCTION' : 'LOCAL'
  
  console.log(`🚀 Démarrage de la migration des catégories Contentful vers Payload (${envLabel})`)
  
  // Afficher le statut des variables d'environnement (pas besoin de Contentful pour les catégories)
  console.log('🔍 Variables d\'environnement:')
  console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Défini' : 'Manquant')
  
  if (isProduction) {
    console.log('NETLIFY_DATABASE_URL:', process.env.NETLIFY_DATABASE_URL ? 'Défini' : 'Manquant')
  } else {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : 'Manquant')
  }
  
  // Initialiser Payload (pas besoin de Contentful pour les catégories)
  const payload = await initializePayloadForMigration(options)
  
  const stats: MigrationStats = { processed: 0, skipped: 0, errors: 0 }
  
  try {
    console.log(`🌍 Migration vers la base de données ${envLabel}`)
    console.log(`📄 ${ContentfulCategories.length} catégories trouvées dans contentful.utils.ts`)
    
    // Traiter chaque catégorie
    for (const category of ContentfulCategories) {
      try {
        const { id, name, order } = category
        
        // Vérifier si la catégorie existe déjà dans Payload (par nom)
        const exists = await checkIfExists(payload, 'categories', 'name', name)
        
        if (exists) {
          console.log(`⏭️  Catégorie déjà migrée: ${name}`)
          stats.skipped++
          continue
        }
        
        // Créer la catégorie dans Payload
        const payloadCategory = await payload.create({
          collection: 'categories',
          data: {
            name: name,
            order: order,
            description: `Catégorie ${name} migrée depuis Contentful le ${new Date().toLocaleDateString('fr-FR')}`,
            // Champ personnalisé pour traçabilité
            contentfulId: id,
          }
        })
        
        console.log(`✅ Catégorie migrée: ${name} (ordre: ${order}) → ${payloadCategory.id}`)
        stats.processed++
        
        // Pause pour éviter de surcharger la base
        await addDelay(delay)
        
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la catégorie ${category.name}:`, error)
        stats.errors++
        continue
      }
    }
    
    // Afficher les statistiques finales
    logMigrationStats(stats, 'catégories', isProduction)
    
    console.log(`📋 Catégories disponibles:`)
    ContentfulCategories.forEach(cat => {
      console.log(`      ${cat.order}. ${cat.name}`)
    })
    
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
  
  migrateContentfulCategories({ isProduction })
    .then(() => {
      console.log(`✅ Script de migration catégories ${isProduction ? 'PRODUCTION' : 'LOCAL'} terminé`)
      process.exit(0)
    })
    .catch((error) => {
      console.error(`❌ Erreur fatale lors de la migration catégories:`, error)
      process.exit(1)
    })
}

export default migrateContentfulCategories