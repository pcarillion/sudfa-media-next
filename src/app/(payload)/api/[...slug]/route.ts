/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'
import { getPayloadInstance } from '@/lib/payload-init'

// Initialisation pour Vercel - force la création des tables au premier appel
const initConfig = {
  ...config,
  db: {
    ...config.db,
    push: true,
  }
}

export const GET = REST_GET(initConfig)
export const POST = REST_POST(initConfig)  
export const DELETE = REST_DELETE(initConfig)
export const PATCH = REST_PATCH(initConfig)
export const PUT = REST_PUT(initConfig)
export const OPTIONS = REST_OPTIONS(initConfig)