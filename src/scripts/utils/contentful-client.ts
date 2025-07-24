import { createClient, ContentfulClientApi } from 'contentful'

/**
 * Crée un client Contentful configuré avec les variables d'environnement
 * @returns Client Contentful configuré
 */
export function createContentfulClient(): ContentfulClientApi<undefined> {
  if (!process.env.CONTENTFUL_SPACE_ID) {
    throw new Error('Variable d\'environnement manquante: CONTENTFUL_SPACE_ID')
  }
  
  if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
    throw new Error('Variable d\'environnement manquante: CONTENTFUL_ACCESS_TOKEN')
  }
  
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  })
}

/**
 * Valide les variables d'environnement Contentful
 */
export function validateContentfulEnvironment() {
  const required = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ACCESS_TOKEN']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement Contentful manquantes: ${missing.join(', ')}`)
  }
  
  return true
}

/**
 * Télécharge une image depuis une URL Contentful
 * @param url - URL de l'image (peut commencer par //)
 * @param filename - Nom du fichier pour les logs
 * @returns Buffer de l'image
 */
export async function downloadImageFromContentful(url: string, filename: string): Promise<Buffer> {
  console.log(`📥 Téléchargement de l'image: ${filename}`)
  
  // Ajouter https: si l'URL commence par //
  const fullUrl = url.startsWith('//') ? `https:${url}` : url
  
  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`Erreur lors du téléchargement de ${filename}: ${response.statusText}`)
  }
  
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}