import { getPayload, PaginatedDocs } from "payload";
import type {
  Article,
  Author,
  Category,
  // Media,
  Presentation,
} from "@/payload-types";
import {} from // formatPayloadArticle,
// formatPayloadAuthor,
// formatPayloadCategory,
// formatPayloadMedia,
"./payload.utils";
import configPromise from "../../../payload.config";
import { APIHandler } from "@/types/api.types";

export const PayloadAPIActions = async (): Promise<APIHandler> => {
  const payload = await getPayload({ config: configPromise });

  return {
    // Articles
    async getHomeArticles(): Promise<Article[]> {
      // Récupérer les articles à la une depuis le global "Une"
      const une = await payload.findGlobal({
        slug: "une",
        depth: 2,
      });

      // Si le global Une existe et contient des articles, les retourner
      if (une && une.articles && Array.isArray(une.articles)) {
        return une.articles as Article[];
      }

      // Fallback: récupérer les 6 derniers articles si aucun article à la une n'est configuré
      const { docs } = await payload.find({
        collection: "articles",
        sort: "-date",
        limit: 6,
        depth: 2,
      });

      return docs;
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

    // Presentations
    async getPresentation(): Promise<Presentation[]> {
      const { docs } = await payload.find({
        collection: "presentations",
        limit: 1,
      });

      return docs;
    },
  };
};
