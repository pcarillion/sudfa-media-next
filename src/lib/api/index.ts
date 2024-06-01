"use server";

import { ContentfulAPIHandler } from "../service/contentful";
import { APIHandler } from "./api";

export const Api = async (): Promise<APIHandler | ContentfulAPIHandler> => {
  if (process.env.ENABLE_CONTENTFUL === "true") {
    return new ContentfulAPIHandler();
  } else {
    const backendBaseUrl = process.env.SUDFA_BACKEND_BASE_URL;
    if (!backendBaseUrl) throw new Error("Backend url is undefined");
    return new APIHandler(backendBaseUrl);
  }
};
