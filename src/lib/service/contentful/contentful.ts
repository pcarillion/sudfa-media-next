import { createClient } from "contentful";
import {
  ContentfulCategories,
  mapCategoryPresentation,
  mapContentfulArticle,
  mapContentfulAuthor,
  mapContentfulPresentation,
} from "./contentful.utils";
import {
  CategoriesPresentation,
  ContentfulArticles,
  ContentfulAuthor,
  ContentfulAuthors,
  ContentfulPresentation,
} from "@/types/contentful.types";
import {
  Article,
  Articles,
  Author,
  Authors,
  Categories,
  Category,
  Presentation,
} from "@/types/api.types";

const createContentfulClient = () =>
  createClient({
    space: process.env.CONTENTFUL_SPACE_ID || "",
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
  });
// articles
const getArticles = async (
  query: unknown,
  sortField?: string,
  limit?: number,
  offset?: number
): Promise<Articles> => {
  "use server";
  const client = createContentfulClient();
  const params = {
    content_type: "article",
    ...(sortField
      ? { order: sortField }
      : { order: "fields.dateDePublication" }),
    ...(limit ? { limit } : {}),
    ...(offset ? { skip: offset } : {}),
    ...(query ? { ...query } : {}),
  };
  const res = (await client.getEntries(params)) as unknown as {
    items: ContentfulArticles;
  };
  return res.items.map((article) => mapContentfulArticle(article));
};

const getFilteredArticles = async (
  queryObject: object,
  limit?: number,
  sortField?: string,
  offset?: number
): Promise<Articles> => {
  "use server";
  return getArticles(queryObject, sortField, limit, offset);
};

const getHomeArticles = async (limit: number): Promise<Articles> => {
  "use server";
  return getFilteredArticles(
    {
      "fields.categorie[nin]": "Culture,Politique",
    },
    limit,
    "-fields.dateDePublication"
  );
};

const getArticlesByCategory = async (
  categoryName: string,
  limit: number,
  currentArticleId?: string
): Promise<Articles> => {
  "use server";
  return getFilteredArticles(
    {
      "fields.categorie": categoryName,
      ...(currentArticleId ? { "sys.id": currentArticleId } : {}),
    },
    limit,
    "-fields.dateDePublication"
  );
};

const getPaginatedArticlesByCateogry = async (
  categoryName: string,
  limit: number,
  offset: number
): Promise<{ articles: Articles; nbResults: number }> => {
  "use server";
  const articles = await getFilteredArticles(
    {
      "fields.categorie": categoryName,
    },
    limit,
    "-fields.dateDePublication",
    offset
  );
  return {
    articles,
    nbResults: articles.length,
  };
};

const getPaginatedArticlesByAuthor = async (
  author: Author,
  limit: number,
  offset: number
): Promise<{ articles: Articles; nbResults: number }> => {
  "use server";
  const articles = await getFilteredArticles(
    {
      "fields.auteur.sys.id": author.id,
    },
    limit,
    "-fields.dateDePublication",
    offset
  );
  return {
    articles,
    nbResults: articles.length,
  };
};

const getArticleBySlug = async (slug: string): Promise<Article> => {
  "use server";
  const articles = await getFilteredArticles({
    "fields.slug": slug,
  });
  return articles[0];
};

// presentation
const getPresentation = async (): Promise<Presentation> => {
  "use server";
  const client = createContentfulClient();
  const res = (await client.getEntry(
    "2BbEwPvQYLShxT5cgNgvZW"
  )) as unknown as ContentfulPresentation;
  return mapContentfulPresentation(res);
};

// auteurs
const getAuthors = async (): Promise<Authors> => {
  "use server";
  const client = createContentfulClient();
  const params = {
    content_type: "auteur",
  };
  const res = (await client.getEntries(params)) as unknown as {
    items: ContentfulAuthors;
  };
  return res.items.map((author) => mapContentfulAuthor(author));
};

const getAuthorById = async (id: string): Promise<Author> => {
  "use server";
  const client = createContentfulClient();
  const res = (await client.getEntry(id)) as unknown as ContentfulAuthor;
  return mapContentfulAuthor(res);
};

// catégories
const getCategories = async (): Promise<Categories> => {
  "use server";
  return ContentfulCategories;
};

const getCategoryById = async (id: string): Promise<Category> => {
  "use server";
  const client = createContentfulClient();
  const presentation = (await client.getEntry(
    "2BbEwPvQYLShxT5cgNgvZW"
  )) as unknown as { fields: CategoriesPresentation };
  const category =
    ContentfulCategories.find((cat) => cat.id === id) ||
    ContentfulCategories[0];
  const categoryPresentation = mapCategoryPresentation(presentation.fields, id);
  return {
    ...category,
    ...(categoryPresentation ? { description: categoryPresentation } : {}),
  };
};

export const ContentfulAPIActions = async () => {
  return {
    getArticles,
    getFilteredArticles,
    getHomeArticles,
    getArticlesByCategory,
    getPaginatedArticlesByCateogry,
    getPaginatedArticlesByAuthor,
    getArticleBySlug,
    getPresentation,
    getAuthors,
    getAuthorById,
    getCategories,
    getCategoryById,
  };
};
