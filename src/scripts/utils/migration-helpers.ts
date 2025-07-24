import { getPayload } from 'payload'
import { createPayloadConfig, validateEnvironmentVariables } from './payload-config'
import { validateContentfulEnvironment } from './contentful-client'
import dotenv from 'dotenv'
import path from 'path'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

/**
 * Statistiques de migration
 */
export interface MigrationStats {
  processed: number
  skipped: number
  errors: number
}

/**
 * Options de migration
 */
export interface MigrationOptions {
  isProduction?: boolean
  enablePush?: boolean
  batchSize?: number
  delay?: number
}

/**
 * Initialise Payload pour la migration
 * @param options - Options de migration
 * @returns Instance Payload configurée
 */
export async function initializePayloadForMigration(options: MigrationOptions = {}) {
  const { isProduction = false, enablePush = false } = options
  const envLabel = isProduction ? 'PRODUCTION' : 'LOCAL'
  
  console.log(`🚀 Initialisation de Payload pour la migration (${envLabel})`)
  
  // Valider les variables d'environnement
  validateEnvironmentVariables(isProduction)
  validateContentfulEnvironment()
  
  // Créer la configuration Payload
  const payloadConfig = await createPayloadConfig(isProduction, enablePush)
  
  // Initialiser Payload
  const payload = await getPayload({ config: payloadConfig })
  
  console.log(`✅ Payload initialisé pour l'environnement ${envLabel}`)
  
  return payload
}

/**
 * Ferme proprement les connexions Payload
 * @param payload - Instance Payload
 */
export async function closePayloadConnections(payload: any) {
  if (payload.db && typeof payload.db.destroy === 'function') {
    await payload.db.destroy()
    console.log('🔌 Connexions Payload fermées')
  }
}

/**
 * Affiche les variables d'environnement validées
 * @param isProduction - Si true, affiche les variables de production
 */
export function logEnvironmentStatus(isProduction = false) {
  console.log('🔍 Variables d\'environnement:')
  console.log('CONTENTFUL_SPACE_ID:', process.env.CONTENTFUL_SPACE_ID ? 'Défini' : 'Manquant')
  console.log('CONTENTFUL_ACCESS_TOKEN:', process.env.CONTENTFUL_ACCESS_TOKEN ? 'Défini' : 'Manquant')
  console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Défini' : 'Manquant')
  
  if (isProduction) {
    console.log('NETLIFY_DATABASE_URL:', process.env.NETLIFY_DATABASE_URL ? 'Défini' : 'Manquant')
  } else {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : 'Manquant')
  }
  
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Défini' : 'Manquant')
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Défini' : 'Manquant')
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Défini' : 'Manquant')
}

/**
 * Affiche les statistiques finales de migration
 * @param stats - Statistiques de migration
 * @param type - Type de contenu migré
 * @param isProduction - Si true, indique l'environnement de production
 */
export function logMigrationStats(stats: MigrationStats, type: string, isProduction = false) {
  const envLabel = isProduction ? 'PRODUCTION' : 'LOCAL'
  
  console.log(`\n🎉 MIGRATION ${type.toUpperCase()} ${envLabel} TERMINÉE !`)
  console.log(`📊 Statistiques:`)
  console.log(`   ✅ ${type} migrés: ${stats.processed}`)
  console.log(`   ⏭️  ${type} déjà présents: ${stats.skipped}`)
  console.log(`   ❌ Erreurs: ${stats.errors}`)
  console.log(`   🌍 Destination: BASE DE DONNÉES ${envLabel}`)
  
  if (isProduction) {
    console.log(`   ☁️  Stockage: Cloudinary`)
  }
}

/**
 * Ajoute une pause entre les opérations
 * @param ms - Millisecondes de pause
 */
export async function addDelay(ms: number = 100) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Génère un slug à partir d'un texte
 * @param text - Texte à convertir en slug
 * @returns Slug généré
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim()
}

/**
 * Vérifie si un élément existe déjà dans Payload
 * @param payload - Instance Payload
 * @param collection - Nom de la collection
 * @param field - Champ à vérifier
 * @param value - Valeur à rechercher
 * @returns True si l'élément existe
 */
export async function checkIfExists(
  payload: any,
  collection: string,
  field: string,
  value: string
): Promise<boolean> {
  const existing = await payload.find({
    collection,
    where: {
      [field]: {
        equals: value
      }
    }
  })
  
  return existing.docs.length > 0
}

/**
 * Trouve un média par son contentfulId
 * @param payload - Instance Payload
 * @param contentfulId - ID Contentful de l'image
 * @returns ID du média Payload ou null
 */
export async function findMediaByContentfulId(
  payload: any,
  contentfulId: string
): Promise<string | null> {
  const mediaResult = await payload.find({
    collection: 'media',
    where: {
      'contentfulId': {
        equals: contentfulId
      }
    }
  })
  
  if (mediaResult.docs.length > 0) {
    return mediaResult.docs[0].id
  }
  
  return null
}