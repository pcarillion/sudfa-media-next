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

// Interface pour les images locales
interface LocalImageFile {
  filename: string
  filePath: string
  stats: {
    size: number
    mtime: Date
  }
}

async function getLocalImages(): Promise<LocalImageFile[]> {
  const mediaDir = path.resolve(process.cwd(), 'media')
  
  try {
    const files = await fs.readdir(mediaDir, { withFileTypes: true })
    const imageFiles: LocalImageFile[] = []
    
    for (const file of files) {
      if (file.isFile() && /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(file.name)) {
        const filePath = path.join(mediaDir, file.name)
        const stats = await fs.stat(filePath)
        
        imageFiles.push({
          filename: file.name,
          filePath,
          stats: {
            size: stats.size,
            mtime: stats.mtime
          }
        })
      }
    }
    
    return imageFiles
  } catch (error) {
    console.log('📁 Dossier media non trouvé, aucune image à migrer')
    return []
  }
}

async function migrateLocalImagesToProd() {
  console.log('🚀 Démarrage de la migration des images locales vers la base de données de production')
  
  // Vérifier les variables d'environnement
  console.log('🔍 Variables d\'environnement:')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : 'Manquant')
  console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Défini' : 'Manquant')
  
  // Configuration Payload pour la production
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
        connectionString: process.env.DATABASE_URL!,
      },
    }),
    sharp,
  })

  // Initialiser Payload
  const payload = await getPayload({ config: payloadConfig })
  
  try {
    // Récupérer les images locales
    const localImages = await getLocalImages()
    
    if (localImages.length === 0) {
      console.log('📂 Aucune image trouvée dans le dossier media/')
      return
    }
    
    console.log(`📄 ${localImages.length} images trouvées dans le dossier media/`)
    let processedCount = 0
    
    // Traiter chaque image
    for (const imageFile of localImages) {
      try {
        const { filename, filePath, stats } = imageFile
        
        // Vérifier si l'image existe déjà dans Payload (par nom de fichier)
        const existing = await payload.find({
          collection: 'media',
          where: {
            'filename': {
              equals: filename
            }
          }
        })
        
        if (existing.docs.length > 0) {
          console.log(`⏭️  Image déjà migrée: ${filename}`)
          continue
        }
        
        // Lire le fichier image
        console.log(`📥 Migration de l'image: ${filename}`)
        const imageBuffer = await fs.readFile(filePath)
        
        // Déterminer le type MIME
        const ext = path.extname(filename).toLowerCase()
        let mimeType = 'image/jpeg'
        
        switch (ext) {
          case '.png':
            mimeType = 'image/png'
            break
          case '.gif':
            mimeType = 'image/gif'
            break
          case '.webp':
            mimeType = 'image/webp'
            break
          case '.avif':
            mimeType = 'image/avif'
            break
          case '.svg':
            mimeType = 'image/svg+xml'
            break
          default:
            mimeType = 'image/jpeg'
        }
        
        // Créer le média dans Payload
        const payloadMedia = await payload.create({
          collection: 'media',
          data: {
            alt: path.parse(filename).name,
            legend: `Image migrée depuis le dossier local le ${new Date().toLocaleDateString('fr-FR')}`,
          },
          file: {
            data: imageBuffer,
            mimetype: mimeType,
            name: filename,
            size: stats.size
          }
        })
        
        console.log(`✅ Image migrée: ${filename} → ${payloadMedia.id}`)
        processedCount++
        
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de ${imageFile.filename}:`, error)
        continue
      }
    }
    
    console.log(`🎉 Migration terminée ! ${processedCount} images migrées avec succès`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
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
  migrateLocalImagesToProd()
    .then(() => {
      console.log('✅ Script de migration terminé')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error)
      process.exit(1)
    })
}

export default migrateLocalImagesToProd