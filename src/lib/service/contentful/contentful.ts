// import { createClient } from "contentful";
// import {
//   ContentfulCategories,
//   mapCategoryPresentation,
//   mapContentfulArticle,
//   mapContentfulAuthor,
//   mapContentfulPresentation,
// } from "./contentful.utils";
// import {
//   CategoriesPresentation,
//   ContentfulArticles,
//   ContentfulAuthor,
//   ContentfulAuthors,
//   ContentfulPresentation,
// } from "@/types/contentful.types";
// import {
//   Article,
//   Articles,
//   Author,
//   Authors,
//   Categories,
//   Category,
//   Presentation,
//   PaginatedData,
// } from "@/types/api.types";

// const createContentfulClient = () =>
//   createClient({
//     space: process.env.CONTENTFUL_SPACE_ID || "",
//     accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
//   });
// // articles
// const getArticles = async (
//   query: unknown,
//   sortField?: string,
//   limit?: number,
//   offset?: number
// ): Promise<Articles> => {
//   "use server";
//   const client = createContentfulClient();
//   const params = {
//     content_type: "article",
//     ...(sortField
//       ? { order: sortField }
//       : { order: "fields.dateDePublication" }),
//     ...(limit ? { limit } : {}),
//     ...(offset ? { skip: offset } : {}),
//     ...(query ? { ...query } : {}),
//   };
//   const res = (await client.getEntries(params)) as unknown as {
//     items: ContentfulArticles;
//   };
//   return res.items.map((article) => mapContentfulArticle(article));
// };

// const getFilteredArticles = async (
//   queryObject: object,
//   limit?: number,
//   sortField?: string,
//   offset?: number
// ): Promise<Articles> => {
//   "use server";
//   return getArticles(queryObject, sortField, limit, offset);
// };

// const getHomeArticles = async (limit: number): Promise<Articles> => {
//   "use server";
//   return getFilteredArticles(
//     {
//       "fields.categorie[nin]": "Culture,Politique",
//     },
//     limit,
//     "-fields.dateDePublication"
//   );
// };

// const getArticlesByCategory = async (
//   categoryName: string,
//   limit: number,
//   currentArticleId?: string
// ): Promise<Articles> => {
//   "use server";
//   return getFilteredArticles(
//     {
//       "fields.categorie": categoryName,
//       ...(currentArticleId ? { "sys.id": currentArticleId } : {}),
//     },
//     limit,
//     "-fields.dateDePublication"
//   );
// };

// const getPaginatedArticlesByCateogry = async (
//   categoryId: string,
//   page: number = 1,
//   limit: number = 10
// ): Promise<PaginatedData<Article>> => {
//   "use server";
//   const offset = (page - 1) * limit;
//   // Convert categoryId to categoryName for Contentful
//   const category = ContentfulCategories.find(cat => cat.id === categoryId);
//   const categoryName = category?.name || "";

//   const articles = await getFilteredArticles(
//     {
//       "fields.categorie": categoryName,
//     },
//     limit,
//     "-fields.dateDePublication",
//     offset
//   );
//   return {
//     data: articles,
//     totalCount: articles.length,
//     currentPage: page,
//     totalPages: Math.ceil(articles.length / limit),
//     hasNextPage: articles.length >= limit,
//     hasPrevPage: page > 1
//   };
// };

// const getPaginatedArticlesByAuthor = async (
//   authorId: string,
//   page: number = 1,
//   limit: number = 10
// ): Promise<PaginatedData<Article>> => {
//   "use server";
//   const offset = (page - 1) * limit;
//   const articles = await getFilteredArticles(
//     {
//       "fields.auteur.sys.id": authorId,
//     },
//     limit,
//     "-fields.dateDePublication",
//     offset
//   );
//   return {
//     data: articles,
//     totalCount: articles.length,
//     currentPage: page,
//     totalPages: Math.ceil(articles.length / limit),
//     hasNextPage: articles.length >= limit,
//     hasPrevPage: page > 1
//   };
// };

// const getArticleBySlug = async (slug: string): Promise<Article | null> => {
//   "use server";
//   const articles = await getFilteredArticles({
//     "fields.slug": slug,
//   });
//   return articles.length > 0 ? articles[0] : null;
// };

// // presentation
// const getPresentation = async (): Promise<Presentation | null> => {
//   "use server";
//   const client = createContentfulClient();
//   try {
//     const res = (await client.getEntry(
//       "2BbEwPvQYLShxT5cgNgvZW"
//     )) as unknown as ContentfulPresentation;
//     return mapContentfulPresentation(res);
//   } catch (error) {
//     return null;
//   }
// };

// // auteurs
// const getAuthors = async (): Promise<Authors> => {
//   "use server";
//   const client = createContentfulClient();
//   const params = {
//     content_type: "auteur",
//   };
//   const res = (await client.getEntries(params)) as unknown as {
//     items: ContentfulAuthors;
//   };
//   return res.items.map((author) => mapContentfulAuthor(author));
// };

// const getAuthorById = async (id: string): Promise<Author | null> => {
//   "use server";
//   const client = createContentfulClient();
//   try {
//     const res = (await client.getEntry(id)) as unknown as ContentfulAuthor;
//     return mapContentfulAuthor(res);
//   } catch (error) {
//     return null;
//   }
// };

// // catégories
// const getCategories = async (): Promise<Categories> => {
//   "use server";
//   return ContentfulCategories;
// };

// const getCategoryById = async (id: string): Promise<Category | null> => {
//   "use server";
//   const client = createContentfulClient();
//   try {
//     const presentation = (await client.getEntry(
//       "2BbEwPvQYLShxT5cgNgvZW"
//     )) as unknown as { fields: CategoriesPresentation };
//     const category = ContentfulCategories.find((cat) => cat.id === id);
//     if (!category) return null;

//     const categoryPresentation = mapCategoryPresentation(presentation.fields, id);
//     return {
//       ...category,
//       ...(categoryPresentation ? { description: categoryPresentation } : {}),
//     };
//   } catch (error) {
//     return null;
//   }
// };

// const getMediaById = async (id: string): Promise<any | null> => {
//   "use server";
//   // Contentful doesn't have a separate media endpoint, return null
//   return null;
// };

// export const ContentfulAPIActions = async () => {
//   return {
//     getArticles,
//     getFilteredArticles,
//     getHomeArticles,
//     getArticlesByCategory,
//     getPaginatedArticlesByCateogry,
//     getPaginatedArticlesByAuthor,
//     getArticleBySlug,
//     getPresentation,
//     getAuthors,
//     getAuthorById,
//     getCategories,
//     getCategoryById,
//     getMediaById,
//   };
// };
