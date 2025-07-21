import { getPayload } from 'payload'
import config from '@payload-config'

let payloadInstance: any = null
let initPromise: Promise<any> | null = null

export async function getPayloadInstance() {
  // Si on a déjà une instance, on la retourne
  if (payloadInstance) {
    return payloadInstance
  }
  
  // Si l'initialisation est en cours, on attend qu'elle se termine
  if (initPromise) {
    return await initPromise
  }
  
  // Sinon on démarre l'initialisation
  initPromise = initializePayload()
  payloadInstance = await initPromise
  
  return payloadInstance
}

async function initializePayload() {
  try {
    console.log('🚀 Initialisation de Payload...')
    
    const payload = await getPayload({ config })
    
    console.log('✅ Payload initialisé avec succès')
    return payload
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Payload:', error)
    throw error
  }
}