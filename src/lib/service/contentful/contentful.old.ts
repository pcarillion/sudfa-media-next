// /****
//  * deprecated
//  */

// import { createClient, ContentfulClientApi } from "contentful";
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
// } from "@/types/api.types";

// export class ContentfulAPIHandler {
//   private client: ContentfulClientApi<undefined>;
//   constructor() {
//     this.client = createClient({
//       space: process.env.CONTENTFUL_SPACE_ID || "",
//       accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
//     });
//   }

//   // articles
//   public getArticles = async (
//     query: unknown,
//     sortField?: string,
//     limit?: number
//   ): Promise<Articles> => {
//     const params = {
//       content_type: "article",
//       ...(sortField
//         ? { order: sortField }
//         : { order: "fields.dateDePublication" }),
//       ...(limit ? { limit } : {}),
//       ...(query ? { ...query } : {}),
//     };
//     const res = (await this.client.getEntries(params)) as unknown as {
//       items: ContentfulArticles;
//     };
//     return res.items.map((article) => mapContentfulArticle(article));
//   };

//   public getFilteredArticles = async (
//     queryObject: object,
//     limit?: number,
//     sortField?: string
//   ): Promise<Articles> => {
//     return this.getArticles(queryObject, sortField, limit);
//   };

//   public getHomeArticles = async (limit: number): Promise<Articles> => {
//     return this.getFilteredArticles(
//       {
//         "fields.categorie[nin]": "Culture,Politique",
//       },
//       limit,
//       "-fields.dateDePublication"
//     );
//   };

//   public getArticlesByCategory = async (
//     categoryName: string,
//     limit: number,
//     currentArticleId?: string
//   ): Promise<Articles> =>
//     this.getFilteredArticles(
//       {
//         "fields.categorie": categoryName,
//         ...(currentArticleId ? { "sys.id": currentArticleId } : {}),
//       },
//       limit,
//       "-fields.dateDePublication"
//     );

//   public getPaginatedArticlesByCateogry = async (
//     categoryName: string,
//     limit: number
//   ): Promise<{ articles: Articles; nbResults: number }> => {
//     const articles = await this.getFilteredArticles(
//       {
//         "fields.categorie": categoryName,
//       },
//       limit,
//       "-fields.dateDePublication"
//     );
//     return {
//       articles,
//       nbResults: articles.length,
//     };
//   };

//   public getPaginatedArticlesByAuthor = async (
//     author: Author,
//     limit: number
//   ): Promise<{ articles: Articles; nbResults: number }> => {
//     const articles = await this.getFilteredArticles(
//       {
//         "fields.auteur.sys.id": author.id,
//       },
//       limit,
//       "-fields.dateDePublication"
//     );
//     return {
//       articles,
//       nbResults: articles.length,
//     };
//   };

//   public getArticleBySlug = async (slug: string): Promise<Article> => {
//     const articles = await this.getFilteredArticles({
//       "fields.slug": slug,
//     });
//     return articles[0];
//   };

//   // presentation
//   public getPresentation = async (): Promise<Presentation> => {
//     const res = (await this.client.getEntry(
//       "2BbEwPvQYLShxT5cgNgvZW"
//     )) as unknown as ContentfulPresentation;
//     return mapContentfulPresentation(res);
//   };

//   // auteurs

//   public getAuthors = async (): Promise<Authors> => {
//     const params = {
//       content_type: "auteur",
//     };
//     const res = (await this.client.getEntries(params)) as unknown as {
//       items: ContentfulAuthors;
//     };
//     return res.items.map((author) => mapContentfulAuthor(author));
//   };

//   public getAuthorById = async (id: string): Promise<Author> => {
//     const res = (await this.client.getEntry(id)) as unknown as ContentfulAuthor;
//     return mapContentfulAuthor(res);
//   };

//   // catégories
//   public getCategories = async (): Promise<Categories> => {
//     return ContentfulCategories;
//   };

//   public getCategoryById = async (id: string): Promise<Category> => {
//     const presentation = (await this.client.getEntry(
//       "2BbEwPvQYLShxT5cgNgvZW"
//     )) as unknown as { fields: CategoriesPresentation };
//     const category =
//       ContentfulCategories.find((cat) => cat.id === id) ||
//       ContentfulCategories[0];
//     const categoryPresentation = mapCategoryPresentation(
//       presentation.fields,
//       id
//     );
//     return {
//       ...category,
//       ...(categoryPresentation ? { description: categoryPresentation } : {}),
//     };
//   };
// }
