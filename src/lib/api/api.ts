/**
 * To be updated to export async function returning object of functions
 * see contentful service
 */

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { buildQueryString } from "./api.utils";
import { retrieveDataFromRequest } from "./api.utils";
import {
  Article,
  Articles,
  Author,
  Authors,
  Categories,
  Category,
  Presentation,
} from "@/types/api.types";

export class APIHandler {
  private name: string;
  private api: AxiosInstance;

  constructor(backendBseUrl?: string) {
    this.name = "APIHandler";
    this.api = axios.create({
      baseURL: backendBseUrl || process.env.SUDFA_BACKEND_BASE_URL,
    });
  }

  private get(route: string, query: object = {}): Promise<AxiosResponse> {
    if (query && typeof query !== "object") {
      throw new Error(
        `${this.name} get() function expects query argument to be of type Object`
      );
    }
    return this.api.get(route, {
      params: {
        // access_token: process.env.ACCESS_TOKEN,
        ...query,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  private async getMedia(route: string): Promise<AxiosResponse> {
    const response = await this.api.get(route, {
      responseType: "stream",
    });

    return response;
  }

  // medias
  public getMedias = (slug: string) => {
    return this.getMedia(`medias/${slug}`);
  };

  // articles

  public getArticles = async (search?: string): Promise<Articles> => {
    const res = await this.get(`articles${search ? search : ""}`);
    return retrieveDataFromRequest(res) as Articles;
  };

  public getFilteredArticles = async (
    queryObject: object,
    sortField?: string,
    limit?: number
  ): Promise<Articles> => {
    const queryString = buildQueryString(queryObject, sortField, limit);
    return this.getArticles(queryString);
  };

  public getPaginatedArticles = async (
    queryObject: object,
    limit?: number
  ): Promise<{ articles: Articles; nbResults: number }> => {
    const queryString = buildQueryString(queryObject, "date", limit);
    const articles = (await this.getArticles(queryString)) as Articles;
    return {
      articles,
      nbResults: articles.length,
    };
  };

  public getPaginatedArticlesByCateogry = async (
    categoryName: string,
    limit: number
  ): Promise<{ articles: Articles; nbResults: number }> => {
    return this.getPaginatedArticles(
      {
        "category.name": { equals: categoryName },
      },
      limit
    );
  };

  public getPaginatedArticlesByAuthor = async (
    author: Author,
    limit: number
  ): Promise<{ articles: Articles; nbResults: number }> => {
    return this.getPaginatedArticles(
      {
        "authors.name": { equals: author.name },
      },
      limit
    );
  };

  public getArticleBySlug = async (slug: string): Promise<Article> => {
    const query = {
      slug: { equals: slug },
    };
    const allArticles = (await this.getFilteredArticles(query)) as Articles;
    return allArticles[0];
  };

  public getHomeArticles = async (limit: number) =>
    this.getFilteredArticles(
      {
        and: [
          {
            "category.name": {
              not_equals: "Culture",
            },
          },

          {
            "category.name": {
              not_equals: "Politique",
            },
          },
        ],
      },
      "-date",
      limit
    );

  public getArticlesByCategory = async (
    categoryName: string,
    limit: number,
    currentArticleId?: string
  ) =>
    this.getFilteredArticles(
      {
        "category.name": { equals: categoryName },
        ...(currentArticleId ? { id: { not_equals: currentArticleId } } : {}),
      },
      "-date",
      limit
    );

  // authors

  public getAuthors = async (): Promise<Authors> => {
    const res = await this.get(`auteurs`);
    return retrieveDataFromRequest(res) as Authors;
  };

  public getAuthorById = async (id: string): Promise<Author> => {
    const res = await this.get(`auteurs/${id}`);
    return res.data;
  };

  // categories

  public getCategories = async (): Promise<Categories> => {
    const res = await this.get(`categories`);
    return retrieveDataFromRequest(res) as Categories;
  };

  public getCategoryById = async (id: string): Promise<Category> => {
    const res = await this.get(`categories/${id}`);
    return res.data;
  };

  // presentation

  public getPresentation = async (): Promise<Presentation> => {
    const res = await this.get(`presentation`);
    return retrieveDataFromRequest(res)[0] as Presentation;
  };
}
