import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filename = path[path.length - 1]
    
    const payload = await getPayload({ config })
    
    // Chercher l'image par nom de fichier
    const result = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: filename
        }
      },
      limit: 1
    })
    
    if (result.docs.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    const media = result.docs[0]
    
    // Si l'image a une URL externe (Cloudinary, etc.)
    if (media.url) {
      return NextResponse.redirect(media.url)
    }
    
    // Sinon, essayer de servir depuis le système de fichiers local
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const imagePath = path.join(process.cwd(), 'media', filename)
      const imageBuffer = await fs.readFile(imagePath)
      
      // Déterminer le type MIME
      const ext = filename.toLowerCase().split('.').pop()
      let contentType = 'image/jpeg'
      
      switch (ext) {
        case 'png':
          contentType = 'image/png'
          break
        case 'gif':
          contentType = 'image/gif'
          break
        case 'webp':
          contentType = 'image/webp'
          break
        case 'avif':
          contentType = 'image/avif'
          break
        case 'svg':
          contentType = 'image/svg+xml'
          break
      }
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
      
    } catch (fsError) {
      console.error('Erreur lecture fichier:', fsError)
      return NextResponse.json({ error: 'File not accessible' }, { status: 404 })
    }
    
  } catch (error) {
    console.error('Erreur proxy media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}