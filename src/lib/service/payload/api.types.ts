import { Apropo, Article, Author, Category, Link } from "@/payload-types";
import { PaginatedDocs } from "payload";

export type OrdreAuteursGlobal = {
  equipe?: Array<Author | number | string>;
  horsEquipe?: Array<Author | number | string>;
};

export type OrdreMenuItem = {
  itemType?:
    | "accueil"
    | "categorie"
    | "auteurs"
    | "a-propos"
    | "recherche";
  category?: Category | number | string;
};

export type OrdreMenuGlobal = {
  items?: OrdreMenuItem[];
};

/**
 * Interface définissant les méthodes de l'API handler
 * Abstraction pour les opérations CRUD sur les collections Payload
 */
export interface APIHandler {
  // Articles
  getHomeArticles(): Promise<Article[]>;
  getArticleBySlug(
    slug: string,
    options?: { draft?: boolean }
  ): Promise<Article | null>;
  getArticlesByCategory(
    categoryName: string,
    limit?: number,
    notInUne?: boolean
  ): Promise<Article[]>;
  getPaginatedArticlesByCateogry(
    categoryId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedDocs<Article>>;
  getPaginatedArticlesByAuthor(
    authorId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedDocs<Article>>;

  // Authors
  getAuthors(): Promise<Author[]>;
  getAuthorById(id: string): Promise<Author | null>;
  getOrdreAuteurs(): Promise<OrdreAuteursGlobal | null>;
  getOrdreMenu(): Promise<OrdreMenuGlobal | null>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;

  getLinksGlobal(): Promise<Link>;
  getAPropos(): Promise<Apropo>;

  // Search
  searchArticles(query: string, limit?: number): Promise<Article[]>;
  searchArticlesAutocomplete(query: string): Promise<Article[]>;
}
