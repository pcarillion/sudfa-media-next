import fs from 'fs'
import path from 'path'
import https from 'https'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { 
  initializePayloadForMigration, 
  closePayloadConnections,
  logEnvironmentStatus 
} from './utils/migration-helpers'

// Variables d'environnement chargées automatiquement par migration-helpers

// Configuration S3
const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

const BUCKET_NAME = process.env.S3_BUCKET!
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`

// Types pour les contenus Lexical
interface LexicalNode {
  type: string
  children?: LexicalNode[]
  url?: string
  src?: string
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

// Fonction pour extraire le nom de fichier d'une URL Cloudinary
function extractFilenameFromCloudinaryUrl(url: string): string {
  const matches = url.match(/\/([^\/]+\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx))/)
  return matches ? matches[1] : `file_${Date.now()}`
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

// Fonction pour mettre à jour les URLs dans le contenu Lexical
function updateLexicalContent(content: any, urlMappings: Map<string, string>): any {
  if (!content || typeof content !== 'object') return content

  if (Array.isArray(content)) {
    return content.map(item => updateLexicalContent(item, urlMappings))
  }

  const updatedContent = { ...content }

  // Mettre à jour les URLs dans les nœuds d'image
  if (updatedContent.type === 'upload' && updatedContent.value?.url) {
    const oldUrl = updatedContent.value.url
    const newUrl = urlMappings.get(oldUrl)
    if (newUrl) {
      updatedContent.value.url = newUrl
      console.log(`✅ Lexical image URL mise à jour: ${oldUrl} → ${newUrl}`)
    }
  }

  // Mettre à jour les URLs dans les nœuds de lien
  if (updatedContent.type === 'link' && updatedContent.url) {
    const oldUrl = updatedContent.url
    const newUrl = urlMappings.get(oldUrl)
    if (newUrl) {
      updatedContent.url = newUrl
      console.log(`✅ Lexical link URL mise à jour: ${oldUrl} → ${newUrl}`)
    }
  }

  // Parcourir récursivement les enfants
  if (updatedContent.children) {
    updatedContent.children = updateLexicalContent(updatedContent.children, urlMappings)
  }

  // Parcourir toutes les autres propriétés
  for (const [key, value] of Object.entries(updatedContent)) {
    if (key !== 'children' && typeof value === 'object') {
      updatedContent[key] = updateLexicalContent(value, urlMappings)
    }
  }

  return updatedContent
}

// Fonction principale de migration
async function migrateCloudinaryToS3() {
  console.log('🚀 Début de la migration Cloudinary vers S3...')
  
  // Afficher le statut des variables d'environnement
  logEnvironmentStatus()
  
  // Initialiser Payload avec les helpers
  const payload = await initializePayloadForMigration({
    isProduction: false,
    enablePush: false,
    useS3: true // Utiliser la validation S3
  })
  
  const urlMappings = new Map<string, string>()

  try {
    // 1. Migrer les médias de la collection Media
    console.log('\n📁 Migration des médias...')
    const mediaItems = await payload.find({
      collection: 'media',
      limit: 1000,
    })

    for (const media of mediaItems.docs) {
      if (media.url && media.url.includes('cloudinary.com')) {
        try {
          console.log(`⬇️  Téléchargement: ${media.filename}`)
          const buffer = await downloadFile(media.url)
          
          const filename = media.filename || extractFilenameFromCloudinaryUrl(media.url)
          const contentType = getContentType(filename)
          
          console.log(`⬆️  Upload vers S3: ${filename}`)
          const newUrl = await uploadToS3(buffer, filename, contentType)
          
          // Mettre à jour le document media
          await payload.update({
            collection: 'media',
            id: media.id,
            data: {
              url: newUrl,
            },
          })

          urlMappings.set(media.url, newUrl)
          console.log(`✅ Média migré: ${media.filename}`)
          
        } catch (error) {
          console.error(`❌ Erreur lors de la migration de ${media.filename}:`, error)
        }
      }
    }

    console.log(`\n📊 ${urlMappings.size} médias migrés avec succès`)

    // 2. Mettre à jour les références dans les articles
    console.log('\n📝 Mise à jour des références dans les articles...')
    const articles = await payload.find({
      collection: 'articles',
      limit: 1000,
    })

    let articlesUpdated = 0
    for (const article of articles.docs) {
      let hasUpdates = false
      const updateData: any = {}

      // Mettre à jour le contenu Lexical
      if (article.content) {
        const updatedContent = updateLexicalContent(article.content, urlMappings)
        if (JSON.stringify(updatedContent) !== JSON.stringify(article.content)) {
          updateData.content = updatedContent
          hasUpdates = true
        }
      }

      // Mettre à jour l'image featured si c'est une URL Cloudinary
      if (article.featuredImage && typeof article.featuredImage === 'object' && article.featuredImage.url) {
        const newUrl = urlMappings.get(article.featuredImage.url)
        if (newUrl) {
          // L'image sera automatiquement mise à jour via la relation
          hasUpdates = true
        }
      }

      if (hasUpdates) {
        await payload.update({
          collection: 'articles',
          id: article.id,
          data: updateData,
        })
        articlesUpdated++
        console.log(`✅ Article mis à jour: ${article.title}`)
      }
    }

    // 3. Mettre à jour les références dans les auteurs
    console.log('\n👥 Mise à jour des références dans les auteurs...')
    const authors = await payload.find({
      collection: 'authors',
      limit: 1000,
    })

    let authorsUpdated = 0
    for (const author of authors.docs) {
      // Les photos d'auteurs seront automatiquement mises à jour via les relations
      // Pas besoin de mise à jour manuelle
    }

    // 4. Mettre à jour les références dans les présentations
    console.log('\n📄 Mise à jour des références dans les présentations...')
    const presentations = await payload.find({
      collection: 'presentations',
      limit: 1000,
    })

    let presentationsUpdated = 0
    for (const presentation of presentations.docs) {
      let hasUpdates = false
      const updateData: any = {}

      // Mettre à jour le contenu Lexical dans shortVersion
      if (presentation.shortVersion) {
        const updatedShortVersion = updateLexicalContent(presentation.shortVersion, urlMappings)
        if (JSON.stringify(updatedShortVersion) !== JSON.stringify(presentation.shortVersion)) {
          updateData.shortVersion = updatedShortVersion
          hasUpdates = true
        }
      }

      // Mettre à jour le contenu Lexical dans longVersion
      if (presentation.longVersion) {
        const updatedLongVersion = updateLexicalContent(presentation.longVersion, urlMappings)
        if (JSON.stringify(updatedLongVersion) !== JSON.stringify(presentation.longVersion)) {
          updateData.longVersion = updatedLongVersion
          hasUpdates = true
        }
      }

      if (hasUpdates) {
        await payload.update({
          collection: 'presentations',
          id: presentation.id,
          data: updateData,
        })
        presentationsUpdated++
        console.log(`✅ Présentation mise à jour: ${presentation.id}`)
      }
    }

    // Résumé final
    console.log('\n🎉 Migration terminée avec succès!')
    console.log(`📊 Résumé:`)
    console.log(`   - ${urlMappings.size} médias migrés`)
    console.log(`   - ${articlesUpdated} articles mis à jour`)
    console.log(`   - ${authorsUpdated} auteurs mis à jour`)
    console.log(`   - ${presentationsUpdated} présentations mises à jour`)

    // Sauvegarder le mapping des URLs pour référence
    const mappingFile = path.join(process.cwd(), 'migration-url-mappings.json')
    fs.writeFileSync(mappingFile, JSON.stringify(Object.fromEntries(urlMappings), null, 2))
    console.log(`💾 Mapping des URLs sauvegardé dans: ${mappingFile}`)

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
  
  // Initialiser Payload avec les helpers
  const payload = await initializePayloadForMigration({
    isProduction: false,
    enablePush: false,
    useS3: true // Utiliser la validation S3
  })
  
  // Vérifier qu'aucun média n'a encore d'URL Cloudinary
  const mediaWithCloudinary = await payload.find({
    collection: 'media',
    where: {
      url: {
        contains: 'cloudinary.com'
      }
    },
    limit: 10,
  })

  if (mediaWithCloudinary.docs.length > 0) {
    console.log(`⚠️  ${mediaWithCloudinary.docs.length} médias ont encore des URLs Cloudinary`)
    mediaWithCloudinary.docs.forEach(media => {
      console.log(`   - ${media.filename}: ${media.url}`)
    })
  } else {
    console.log('✅ Aucun média avec URL Cloudinary trouvé')
  }

  // Vérifier quelques médias S3
  const s3Media = await payload.find({
    collection: 'media',
    where: {
      url: {
        contains: 's3.eu-north-1.amazonaws.com'
      }
    },
    limit: 5,
  })

  console.log(`✅ ${s3Media.totalDocs} médias avec URLs S3 trouvés`)
  s3Media.docs.forEach(media => {
    console.log(`   - ${media.filename}: ${media.url}`)
  })
  
  // Fermer les connexions
  await closePayloadConnections(payload)
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--validate')) {
    await validateMigration()
  } else {
    await migrateCloudinaryToS3()
    await validateMigration()
  }
  
  process.exit(0)
}

// Exécution directe du script
main().catch((error) => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})

export { migrateCloudinaryToS3, validateMigration }