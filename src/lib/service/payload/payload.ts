import { getPayload, PaginatedDocs } from "payload";
import type { Article, Author, Category } from "@/payload-types";
import configPromise from "../../../payload.config";
import { APIHandler } from "@/lib/service/payload/api.types";

export const PayloadAPIActions = async (): Promise<APIHandler> => {
  const payload = await getPayload({ config: configPromise });

  return {
    // Articles
    async getHomeArticles(): Promise<Article[]> {
      // Récupérer les articles à la une depuis le global "Une"
      const articles: Article[] = [];
      const une = await payload.findGlobal({
        slug: "une",
        depth: 2,
      });

      // Si le global Une existe et contient des articles, les retourner
      if (une && une.articles && Array.isArray(une.articles)) {
        articles.push(...(une.articles as Article[]));
      }

      const limit = 14 - articles.length;
      const { docs } = await payload.find({
        collection: "articles",
        sort: "-date",
        where: {
          id: { not_in: articles.map(article => article.id) },
        },
        limit,
        depth: 2,
      });
      articles.push(...docs);

      return articles;
    },

    async getArticleBySlug(slug: string): Promise<Article | null> {
      const { docs } = await payload.find({
        collection: "articles",
        where: {
          slug: {
            equals: slug,
          },
        },
        depth: 2,
        limit: 1,
      });

      return docs.length > 0 ? docs[0] : null;
    },

    async getArticlesByCategory(
      categoryName: string,
      limit: number = 5,
      notInUne: boolean = false
    ): Promise<Article[]> {
      // First find the category by name to get its ID
      const { docs: categories } = await payload.find({
        collection: "categories",
        where: {
          name: {
            equals: categoryName,
          },
        },
        limit: 1,
      });

      if (categories.length === 0) {
        return [];
      }

      const categoryId = categories[0].id;

      let listOfUneIds: number[] = [];

      if (notInUne) {
        const une = await payload.findGlobal({
          slug: "une",
          depth: 0,
        });
        console.log(une);

        if (une && une.articles && Array.isArray(une.articles)) {
          listOfUneIds = [
            // ...(une.articles as number[]).map(id => id.toString()),
            ...(une.articles as number[]),
          ];
        }
      }

      // Then find articles by category ID
      const { docs } = await payload.find({
        collection: "articles",
        where: {
          and: [
            {
              category: {
                equals: categoryId,
              },
              id: {
                not_in: listOfUneIds,
              },
            },
          ],
        },
        sort: "-date",
        limit,
        depth: 2,
      });

      return docs;
    },

    async getPaginatedArticlesByCateogry(
      categoryId: string,
      page: number = 1,
      limit: number = 10
    ): Promise<PaginatedDocs<Article>> {
      const result = await payload.find({
        collection: "articles",
        where: {
          category: {
            equals: categoryId,
          },
        },
        sort: "-date",
        page,
        limit,
        depth: 2,
      });

      return result;
    },

    async getPaginatedArticlesByAuthor(
      authorId: string,
      page: number = 1,
      limit: number = 10
    ): Promise<PaginatedDocs<Article>> {
      const result = await payload.find({
        collection: "articles",
        where: {
          authors: {
            contains: authorId,
          },
        },
        sort: "-date",
        page,
        limit,
        depth: 2,
      });

      return result;
    },

    // Authors
    async getAuthors(): Promise<Author[]> {
      const res = await payload.find({
        collection: "authors",
        sort: "name",
        depth: 1,
        limit: -1,
      });

      return res.docs;
    },

    async getAuthorById(id: string): Promise<Author | null> {
      try {
        const author = await payload.findByID({
          collection: "authors",
          id,
          depth: 1,
        });

        return author;
      } catch (error) {
        return null;
      }
    },

    // Categories
    async getCategories(): Promise<Category[]> {
      const { docs } = await payload.find({
        collection: "categories",
        sort: "order",
      });

      return docs;
    },

    async getCategoryById(id: string): Promise<Category | null> {
      try {
        const category = await payload.findByID({
          collection: "categories",
          id,
        });

        return category;
      } catch (error) {
        return null;
      }
    },

    async getLinksGlobal() {
      const links = await payload.findGlobal({
        slug: "links",
      });

      return links;
    },

    async getAPropos() {
      const apropos = await payload.findGlobal({
        slug: "apropos",
      });

      return apropos;
    },

    // Search
    async searchArticles(query: string, limit: number = 10): Promise<Article[]> {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const { docs } = await payload.find({
        collection: "articles",
        where: {
          titre: {
            contains: query.trim(),
          },
        },
        sort: "-date",
        limit,
        depth: 2,
      });

      return docs;
    },

    async searchArticlesAutocomplete(query: string): Promise<Article[]> {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const { docs } = await payload.find({
        collection: "articles",
        where: {
          titre: {
            contains: query.trim(),
          },
        },
        sort: "-date",
        limit: 5,
        depth: 1, // Moins de profondeur pour l'autocomplétion
      });

      return docs;
    },
  };
};
