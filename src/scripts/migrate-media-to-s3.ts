import fs from 'fs'
import path from 'path'
import https from 'https'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { 
  initializePayloadForMigration, 
  closePayloadConnections,
  logEnvironmentStatus 
} from './utils/migration-helpers'

// Configuration S3
const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

const BUCKET_NAME = process.env.S3_BUCKET!

// Types pour les médias
interface MediaDocument {
  id: string
  filename: string
  url: string
  alt?: string
  legend?: string
  mimeType?: string
  width?: number
  height?: number
  filesize?: number
  contentfulId?: string
  createdAt: string
  updatedAt: string
  // Champs Cloudinary possibles
  cloudinary?: {
    url?: string
    secure_url?: string
    public_id?: string
    version?: string
    resource_type?: string
    format?: string
  }
  // Autres champs possibles
  [key: string]: any
}

// Fonction utilitaire pour télécharger un fichier depuis une URL
async function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

// Fonction pour uploader vers S3
async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `payload/${key}`,
    Body: buffer,
    ContentType: contentType,
  })

  await s3Client.send(command)
  return `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/payload/${key}`
}

// Fonction pour déterminer le Content-Type
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// Fonction principale de migration
async function migrateMediaToS3() {
  console.log('🚀 Début de la migration media → media_s3...')
  
  // Afficher le statut des variables d'environnement
  logEnvironmentStatus()
  
  // Initialiser Payload avec les helpers (validation pour Cloudinary ET S3)
  const payload = await initializePayloadForMigration({
    isProduction: false,
    enablePush: false,
    useS3: false // On valide Cloudinary car on lit depuis media (Cloudinary)
  })

  // Vérifier aussi les variables S3
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
    console.error('❌ Variables S3 manquantes (S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY)')
    process.exit(1)
  }

  console.log('✅ Variables S3 vérifiées')
  console.log(`   - S3_BUCKET: ${process.env.S3_BUCKET}`)

  const stats = {
    processed: 0,
    skipped: 0,
    errors: 0
  }

  // Mapping entre anciens IDs (media) et nouveaux IDs (media_s3)
  const idMapping: Record<string, string> = {}

  try {
    // 1. Lire les médias depuis le fichier JSON
    console.log('\n📁 Lecture des médias depuis media.json...')
    
    const mediaJsonPath = path.join(process.cwd(), 'src/scripts/media.json')
    
    if (!fs.existsSync(mediaJsonPath)) {
      throw new Error(`Fichier media.json non trouvé à: ${mediaJsonPath}`)
    }
    
    const mediaData = JSON.parse(fs.readFileSync(mediaJsonPath, 'utf8'))
    console.log(`📊 ${mediaData.length} médias trouvés dans media.json`)
    
    // Traiter tous les médias (retirer .slice(0, 1) pour traiter tout)
    const mediaItems = { docs: mediaData }
    
    // Afficher le premier média pour debug
    if (mediaItems.docs.length > 0) {
      console.log('\n🔍 PREMIER MÉDIA DU JSON:')
      console.log(JSON.stringify(mediaItems.docs[0], null, 2))
    }

    // 2. Vérifier quels médias existent déjà dans media_s3
    const existingS3Media = await payload.find({
      collection: 'media_s3',
      limit: 1000,
    })

    const existingS3Ids = new Set(existingS3Media.docs.map(doc => doc.id))
    console.log(`📊 ${existingS3Media.docs.length} médias déjà présents dans media_s3`)

    // 3. Migrer chaque média depuis le JSON
    for (const media of mediaItems.docs as MediaDocument[]) {
      try {
        // Vérifier si le média existe déjà dans media_s3
        if (existingS3Ids.has(media.id)) {
          console.log(`⏭️  Média déjà migré: ${media.filename} (ID: ${media.id})`)
          stats.skipped++
          continue
        }

        console.log(`\n🔄 Migration du média: ${media.filename} (ID: ${media.id})`)
        
        // Utiliser l'URL directement depuis le JSON (données brutes de la DB)
        if (!media.url) {
          console.log(`   ❌ Pas d'URL pour le média: ${media.filename}`)
          stats.errors++
          continue
        }
        
        let cleanUrl = media.url
        
        // Si l'URL contient des paramètres, les supprimer
        if (cleanUrl.includes('?')) {
          cleanUrl = cleanUrl.split('?')[0]
          console.log(`   🔧 URL nettoyée (paramètres supprimés): ${media.url} → ${cleanUrl}`)
        }
        
        console.log(`   ⬇️  Téléchargement depuis: ${cleanUrl}`)
        
        const buffer = await downloadFile(cleanUrl)
        
        // Créer un fichier temporaire et laisser Payload gérer l'upload vers S3
        console.log(`   💾 Création dans media_s3 avec upload automatique vers S3`)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }
        
        const tempFilePath = path.join(tempDir, media.filename)
        fs.writeFileSync(tempFilePath, buffer)
        
        try {
          // Laisser Payload créer le média et uploader vers S3 automatiquement
          const uploadedMedia = await payload.create({
            collection: 'media_s3',
            data: {
              alt: media.alt || '',
              legend: media.legend || '',
              contentfulId: media.contentfulId,
            },
            filePath: tempFilePath,
          })
          
          console.log(`   ✅ Média créé avec ID: ${uploadedMedia.id}, URL: ${uploadedMedia.url}`)
          
          // Enregistrer le mapping ancien ID → nouveau ID
          idMapping[media.id] = uploadedMedia.id
          console.log(`   📝 Mapping: ${media.id} → ${uploadedMedia.id}`)
          
        } finally {
          // Nettoyer le fichier temporaire
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath)
          }
        }

        console.log(`   ✅ Média migré avec succès: ${media.filename}`)
        stats.processed++
        
        // Pause entre les uploads pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`   ❌ Erreur lors de la migration de ${media.filename}:`, error)
        stats.errors++
      }
    }

    // Résumé final
    console.log('\n🎉 Migration terminée!')
    console.log(`📊 Résumé:`)
    console.log(`   ✅ Médias migrés: ${stats.processed}`)
    console.log(`   ⏭️  Médias déjà présents: ${stats.skipped}`)
    console.log(`   ❌ Erreurs: ${stats.errors}`)
    console.log(`   📁 Source: collection media (Cloudinary)`)
    console.log(`   📁 Destination: collection media_s3 (S3)`)

    // Sauvegarder les statistiques et le mapping
    const statsFile = path.join(process.cwd(), 'migration-media-to-s3-stats.json')
    fs.writeFileSync(statsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      source: 'media (Cloudinary)',
      destination: 'media_s3 (S3)',
      bucket: BUCKET_NAME,
      idMapping
    }, null, 2))
    console.log(`💾 Statistiques sauvegardées dans: ${statsFile}`)

    // Sauvegarder le mapping séparément
    const mappingFile = path.join(process.cwd(), 'id-mapping-media-to-s3.json')
    fs.writeFileSync(mappingFile, JSON.stringify(idMapping, null, 2))
    console.log(`💾 Mapping des IDs sauvegardé dans: ${mappingFile}`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    // Fermer les connexions Payload
    await closePayloadConnections(payload)
  }
}

// Fonction de validation post-migration
async function validateMigration() {
  console.log('\n🔍 Validation post-migration...')
  
  // Initialiser Payload
  const payload = await initializePayloadForMigration({
    isProduction: false,
    enablePush: false,
    useS3: false
  })

  try {
    // Compter les médias dans chaque collection
    const mediaCount = await payload.find({
      collection: 'media',
      limit: 1,
    })

    const mediaS3Count = await payload.find({
      collection: 'media_s3',
      limit: 1,
    })

    console.log(`📊 Comparaison des collections:`)
    console.log(`   📁 media (Cloudinary): ${mediaCount.totalDocs} éléments`)
    console.log(`   📁 media_s3 (S3): ${mediaS3Count.totalDocs} éléments`)

    // Vérifier quelques médias S3
    const s3Sample = await payload.find({
      collection: 'media_s3',
      limit: 5,
    })

    console.log(`\n✅ Échantillon de médias S3:`)
    s3Sample.docs.forEach((media: any) => {
      console.log(`   - ${media.filename} (ID: ${media.id}): ${media.url}`)
    })

    // Lire le mapping si il existe
    const mappingFile = path.join(process.cwd(), 'id-mapping-media-to-s3.json')
    if (fs.existsSync(mappingFile)) {
      const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'))
      console.log(`\n📋 Mapping des IDs (${Object.keys(mapping).length} correspondances):`)
      Object.entries(mapping).slice(0, 5).forEach(([oldId, newId]) => {
        console.log(`   ${oldId} → ${newId}`)
      })
      if (Object.keys(mapping).length > 5) {
        console.log(`   ... et ${Object.keys(mapping).length - 5} autres`)
      }
    }

    console.log(`\n✅ Migration réussie !`)
    console.log(`   - Les médias sont stockés sur S3`)
    console.log(`   - Les URLs sont générées dynamiquement par l'adapteur`)
    console.log(`   - Le mapping des IDs est disponible dans id-mapping-media-to-s3.json`)

  } finally {
    // Fermer les connexions
    await closePayloadConnections(payload)
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--validate')) {
    await validateMigration()
  } else {
    await migrateMediaToS3()
    await validateMigration()
  }
  
  process.exit(0)
}

// Exécution directe du script
main().catch((error) => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})

export { migrateMediaToS3, validateMigration }