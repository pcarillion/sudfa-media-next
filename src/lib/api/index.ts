"use server";

import { PayloadAPIActions } from "../service/payload/payload";
// import { ContentfulAPIActions } from "../service/contentful/contentful";

/**
 * Interface API principale pour l'application
 * Utilise Payload CMS comme source de données principale
 * Anciennement configuré pour supporter Contentful en fallback
 */
// Migration vers Payload - utilise Payload par défaut, fallback sur Contentful si nécessaire
// export const Api = process.env.ENABLE_CONTENTFUL === "true" ? ContentfulAPIActions : PayloadAPIActions;
export const Api = PayloadAPIActions;
