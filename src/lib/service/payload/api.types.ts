import { Article, Author, Category, Link, Presentation } from "@/payload-types";
import { PaginatedDocs } from "payload";

// Interface pour l'API Handler
export interface APIHandler {
  // Articles
  getHomeArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
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

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;

  // Presentations
  getPresentation(): Promise<Presentation[]>;
  getLinksGlobal(): Promise<Link>;
}
