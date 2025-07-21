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

async function checkPayloadProduction() {
  console.log('🔍 Diagnostic Payload en production')
  
  // Vérifier les variables d'environnement
  console.log('\n📋 Variables d\'environnement:')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante')
  console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? '✅ Définie' : '❌ Manquante')
  console.log('NODE_ENV:', process.env.NODE_ENV || 'non définie')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL est requis')
    return
  }
  
  if (!process.env.PAYLOAD_SECRET) {
    console.error('❌ PAYLOAD_SECRET est requis')
    return
  }
  
  try {
    console.log('\n🚀 Test de connexion à la base de données...')
    
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
          connectionString: process.env.DATABASE_URL!,
        },
        push: true,
      }),
      sharp,
    })

    // Initialiser Payload
    console.log('🔧 Initialisation de Payload...')
    const payload = await getPayload({ config: payloadConfig })
    
    console.log('✅ Payload initialisé avec succès')
    
    // Test de requête simple
    console.log('\n📊 Test de requête sur les collections...')
    
    try {
      const users = await payload.find({
        collection: 'users',
        limit: 1
      })
      console.log('✅ Collection users:', users.totalDocs, 'utilisateur(s)')
    } catch (error) {
      console.error('❌ Erreur collection users:', error)
    }
    
    try {
      const media = await payload.find({
        collection: 'media',
        limit: 5
      })
      console.log('✅ Collection media:', media.totalDocs, 'image(s)')
    } catch (error) {
      console.error('❌ Erreur collection media:', error)
    }
    
    try {
      const articles = await payload.find({
        collection: 'articles',
        limit: 5
      })
      console.log('✅ Collection articles:', articles.totalDocs, 'article(s)')
    } catch (error) {
      console.error('❌ Erreur collection articles:', error)
    }
    
    console.log('\n🎉 Diagnostic terminé avec succès')
    
    // Fermer les connexions
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic Payload:')
    console.error(error)
    
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  checkPayloadProduction()
    .then(() => {
      console.log('\n✅ Script de diagnostic terminé')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale lors du diagnostic:', error)
      process.exit(1)
    })
}

export default checkPayloadProduction