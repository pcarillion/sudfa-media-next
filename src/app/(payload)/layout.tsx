/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

// Configuration pour Vercel avec push forcé
const vercelConfig = {
  ...config,
  db: {
    ...config.db,
    push: true,
  }
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config: vercelConfig,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={vercelConfig} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout