import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force dynamic rendering globally - disable static optimization
  output: 'standalone',
  
  publicRuntimeConfig: {
    // Will be available on both server and client
    SUDFA_BACKEND_BASE_URL: process.env.SUDFA_BACKEND_BASE_URL,
    // NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
      },
    ],
  },
  experimental: {
    reactCompiler: false ?? false,
  },
}

export default withPayload(nextConfig)
