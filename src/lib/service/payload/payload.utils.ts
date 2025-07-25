import { Article, Author, Category, Media } from "@/payload-types";
import { renderLexicalToHTML } from "../../../utils/Formatting";

/**
 * Formate un article Payload vers le format API attendu
 */
// export function formatPayloadArticle(article: any): Article {
//   return {
//     id: article.id,
//     titre: article.titre,
//     slug: article.slug,
//     date: article.date,
//     category: article.category ? formatPayloadCategory(article.category) : null,
//     authors: Array.isArray(article.authors)
//       ? article.authors.map(formatPayloadAuthor)
//       : [],
//     photoPrincipale: article.photoPrincipale
//       ? formatPayloadMedia(article.photoPrincipale)
//       : null,
//     presentation: article.presentation
//       ? renderLexicalToHTML(article.presentation)
//       : {},
//     article: article.article ? renderLexicalToHTML(article.article) : "",
//     content_html: article.content_html || "",
//   };
// }

/**
 * Formate un auteur Payload vers le format API attendu
 */
// export function formatPayloadAuthor(author: any): Author {
//   return {
//     id: author.id,
//     name: author.name,
//     type: author.type || "auteur",
//     slug: author.slug,
//     description: author.description || "",
//     photo: author.photo ? formatPayloadMedia(author.photo) : null,
//   };
// }

/**
 * Formate une catégorie Payload vers le format API attendu
 */
// export function formatPayloadCategory(category: any): Category {
//   return {
//     id: category.id,
//     name: category.name,
//     order: category.order || 0,
//     description: category.description || "",
//   };
// }

/**
 * Formate un média Payload vers le format API attendu
 */
// export function formatPayloadMedia(media: any): Media {
//   if (typeof media === "string") {
//     // Si c'est juste un ID, on ne peut pas construire l'objet complet
//     return {
//       id: media,
//       url: "",
//       alt: "",
//       legend: "",
//       width: 0,
//       height: 0,
//       thumbnailURL: "",
//       sizes: {},
//     };
//   }

// Construction de l'URL de base
// const baseUrl = media.url || "";

// Construction des sizes basées sur les tailles d'image configurées
// const sizes: {
//   [key: string]: { url: string; width: number; height: number };
// } = {};

//   if (media.sizes) {
//     Object.keys(media.sizes).forEach(sizeName => {
//       const size = media.sizes[sizeName];
//       if (size && size.url) {
//         sizes[sizeName] = {
//           url: size.url,
//           width: size.width || 0,
//           height: size.height || 0,
//         };
//       }
//     });
//   }

//   return {
//     id: media.id,
//     url: baseUrl,
//     alt: media.alt || "",
//     legend: media.legend || "",
//     width: media.width || 0,
//     height: media.height || 0,
//     thumbnailURL: sizes.thumbnail?.url || baseUrl,
//     sizes,
//   };
// }
