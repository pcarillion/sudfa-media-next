"use server";

import { ContentfulAPIActions } from "../service/contentful/contentful";

export const Api = ContentfulAPIActions;

/**
 * To do
 */
// export const Api = process.env.ENABLE_CONTENTFUL === "true" ? ContentfulAPIActions : ApiActions;
