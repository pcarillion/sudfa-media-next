import { getPayload } from "payload";
import {
  createPayloadConfig,
  validateEnvironmentVariables,
} from "./payload-config";
import { validateContentfulEnvironment } from "./contentful-client";
import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Statistiques de migration
 */
export interface MigrationStats {
  processed: number;
  skipped: number;
  errors: number;
}

/**
 * Options de migration
 */
export interface MigrationOptions {
  isProduction?: boolean;
  enablePush?: boolean;
  batchSize?: number;
  delay?: number;
}

/**
 * Initialise Payload pour la migration
 * @param options - Options de migration
 * @returns Instance Payload configurée
 */
export async function initializePayloadForMigration(
  options: MigrationOptions = {}
) {
  const { isProduction = false, enablePush = false } = options;
  const envLabel = isProduction ? "PRODUCTION" : "LOCAL";

  console.log(`🚀 Initialisation de Payload pour la migration (${envLabel})`);

  // Valider les variables d'environnement
  validateEnvironmentVariables(isProduction);
  validateContentfulEnvironment();

  // Créer la configuration Payload
  const payloadConfig = await createPayloadConfig(isProduction, enablePush);

  // Initialiser Payload
  const payload = await getPayload({ config: payloadConfig });

  console.log(`✅ Payload initialisé pour l'environnement ${envLabel}`);

  return payload;
}

/**
 * Ferme proprement les connexions Payload
 * @param payload - Instance Payload
 */
export async function closePayloadConnections(payload: any) {
  if (payload.db && typeof payload.db.destroy === "function") {
    await payload.db.destroy();
    console.log("🔌 Connexions Payload fermées");
  }
}

/**
 * Affiche les variables d'environnement validées
 * @param isProduction - Si true, affiche les variables de production
 */
export function logEnvironmentStatus(isProduction = false) {
  console.log("🔍 Variables d'environnement:");
  console.log(
    "CONTENTFUL_SPACE_ID:",
    process.env.CONTENTFUL_SPACE_ID ? "Défini" : "Manquant"
  );
  console.log(
    "CONTENTFUL_ACCESS_TOKEN:",
    process.env.CONTENTFUL_ACCESS_TOKEN ? "Défini" : "Manquant"
  );
  console.log(
    "PAYLOAD_SECRET:",
    process.env.PAYLOAD_SECRET ? "Défini" : "Manquant"
  );

  if (isProduction) {
    console.log(
      "NETLIFY_DATABASE_URL:",
      process.env.NETLIFY_DATABASE_URL ? "Défini" : "Manquant"
    );
  } else {
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "Défini" : "Manquant"
    );
  }

  console.log(
    "CLOUDINARY_CLOUD_NAME:",
    process.env.CLOUDINARY_CLOUD_NAME ? "Défini" : "Manquant"
  );
  console.log(
    "CLOUDINARY_API_KEY:",
    process.env.CLOUDINARY_API_KEY ? "Défini" : "Manquant"
  );
  console.log(
    "CLOUDINARY_API_SECRET:",
    process.env.CLOUDINARY_API_SECRET ? "Défini" : "Manquant"
  );
}

/**
 * Affiche les statistiques finales de migration
 * @param stats - Statistiques de migration
 * @param type - Type de contenu migré
 * @param isProduction - Si true, indique l'environnement de production
 */
export function logMigrationStats(
  stats: MigrationStats,
  type: string,
  isProduction = false
) {
  const envLabel = isProduction ? "PRODUCTION" : "LOCAL";

  console.log(`\n🎉 MIGRATION ${type.toUpperCase()} ${envLabel} TERMINÉE !`);
  console.log(`📊 Statistiques:`);
  console.log(`   ✅ ${type} migrés: ${stats.processed}`);
  console.log(`   ⏭️  ${type} déjà présents: ${stats.skipped}`);
  console.log(`   ❌ Erreurs: ${stats.errors}`);
  console.log(`   🌍 Destination: BASE DE DONNÉES ${envLabel}`);

  if (isProduction) {
    console.log(`   ☁️  Stockage: Cloudinary`);
  }
}

/**
 * Ajoute une pause entre les opérations
 * @param ms - Millisecondes de pause
 */
export async function addDelay(ms: number = 100) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Génère un slug à partir d'un texte
 * @param text - Texte à convertir en slug
 * @returns Slug généré
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/-+/g, "-") // Supprimer les tirets multiples
    .trim();
}

/**
 * Vérifie si un élément existe déjà dans Payload
 * @param payload - Instance Payload
 * @param collection - Nom de la collection
 * @param field - Champ à vérifier
 * @param value - Valeur à rechercher
 * @returns True si l'élément existe
 */
export async function checkIfExists(
  payload: any,
  collection: string,
  field: string,
  value: string
): Promise<boolean> {
  const existing = await payload.find({
    collection,
    where: {
      [field]: {
        equals: value,
      },
    },
  });

  return existing.docs.length > 0;
}

/**
 * Trouve un média par son contentfulId
 * @param payload - Instance Payload
 * @param contentfulId - ID Contentful de l'image
 * @returns ID du média Payload ou null
 */
export async function findMediaByContentfulId(
  payload: any,
  contentfulId: string
): Promise<string | null> {
  const mediaResult = await payload.find({
    collection: "media",
    where: {
      contentfulId: {
        equals: contentfulId,
      },
    },
  });

  if (mediaResult.docs.length > 0) {
    return mediaResult.docs[0].id;
  }

  return null;
}

/**
 * Trouve un auteur par son contentfulId
 * @param payload - Instance Payload
 * @param contentfulId - ID Contentful de l'auteur
 * @returns ID de l'auteur Payload ou null
 */
export async function findAuthorByContentfulId(
  payload: any,
  contentfulId: string
): Promise<string | null> {
  const authorResult = await payload.find({
    collection: "authors",
    where: {
      contentfulId: {
        equals: contentfulId,
      },
    },
  });

  if (authorResult.docs.length > 0) {
    return authorResult.docs[0].id;
  }

  return null;
}

/**
 * Trouve une catégorie par son contentfulId
 * @param payload - Instance Payload
 * @param contentfulId - ID Contentful de la catégorie
 * @returns ID de la catégorie Payload ou null
 */
export async function findCategoryByContentfulId(
  payload: any,
  contentfulId: string
): Promise<string | null> {
  const categoryResult = await payload.find({
    collection: "categories",
    where: {
      contentfulId: {
        equals: contentfulId,
      },
    },
  });

  if (categoryResult.docs.length > 0) {
    return categoryResult.docs[0].id;
  }

  return null;
}

/**
 * Trouve une catégorie par son nom
 * @param payload - Instance Payload
 * @param categoryName - Nom de la catégorie
 * @returns ID de la catégorie Payload ou null
 */
export async function findCategoryByName(
  payload: any,
  categoryName: string
): Promise<string | null> {
  const categoryResult = await payload.find({
    collection: "categories",
    where: {
      name: {
        equals: categoryName,
      },
    },
  });

  if (categoryResult.docs.length > 0) {
    return categoryResult.docs[0].id;
  }

  return null;
}

/**
 * Convertit le rich text Contentful en format HTML simple
 * @param richTextNode - Nœud rich text de Contentful
 * @returns HTML converti
 */
export function convertContentfulRichTextToHtml(richTextNode: any): string {
  if (!richTextNode || !richTextNode.content) {
    return "";
  }

  let html = "";

  for (const node of richTextNode.content) {
    switch (node.nodeType) {
      case "paragraph":
        html += "<p>" + processInlineNodes(node.content || []) + "</p>\n";
        break;
      case "heading-1":
        html += "<h1>" + processInlineNodes(node.content || []) + "</h1>\n";
        break;
      case "heading-2":
        html += "<h2>" + processInlineNodes(node.content || []) + "</h2>\n";
        break;
      case "heading-3":
        html += "<h3>" + processInlineNodes(node.content || []) + "</h3>\n";
        break;
      case "unordered-list":
        html += "<ul>\n";
        for (const listItem of node.content || []) {
          if (listItem.nodeType === "list-item") {
            html +=
              "<li>" + processInlineNodes(listItem.content || []) + "</li>\n";
          }
        }
        html += "</ul>\n";
        break;
      case "ordered-list":
        html += "<ol>\n";
        for (const listItem of node.content || []) {
          if (listItem.nodeType === "list-item") {
            html +=
              "<li>" + processInlineNodes(listItem.content || []) + "</li>\n";
          }
        }
        html += "</ol>\n";
        break;
      case "blockquote":
        html +=
          "<blockquote>" +
          processInlineNodes(node.content || []) +
          "</blockquote>\n";
        break;
      case "hr":
        html += "<hr>\n";
        break;
      default:
        // Node type non géré, on traite comme du texte
        html += processInlineNodes(node.content || []);
        break;
    }
  }

  return html.trim();
}

/**
 * Traite les nœuds inline (texte, liens, etc.)
 * @param inlineNodes - Nœuds inline de Contentful
 * @returns Texte HTML avec formatting inline
 */
function processInlineNodes(inlineNodes: any[]): string {
  let text = "";

  for (const node of inlineNodes) {
    switch (node.nodeType) {
      case "text":
        let nodeText = node.value || "";

        // Appliquer les marques de formatting
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case "bold":
                nodeText = `<strong>${nodeText}</strong>`;
                break;
              case "italic":
                nodeText = `<em>${nodeText}</em>`;
                break;
              case "underline":
                nodeText = `<u>${nodeText}</u>`;
                break;
              case "code":
                nodeText = `<code>${nodeText}</code>`;
                break;
            }
          }
        }

        text += nodeText;
        break;
      case "hyperlink":
        const linkText = processInlineNodes(node.content || []);
        const linkUrl = node.data?.uri || "#";
        text += `<a href="${linkUrl}">${linkText}</a>`;
        break;
      default:
        // Node type non géré, on traite récursivement le contenu
        text += processInlineNodes(node.content || []);
        break;
    }
  }

  return text;
}

/**
 * Convertit le rich text Contentful au format Lexical
 * @param richTextNode - Nœud rich text de Contentful
 * @param payload - Instance Payload pour chercher les médias (optionnel)
 * @returns Objet Lexical EditorState
 */
export async function convertContentfulRichTextToLexical(
  richTextNode: any,
  payload?: any
): Promise<any> {
  if (!richTextNode || !richTextNode.content) {
    return {
      root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };
  }

  const children = await convertContentfulNodesToLexical(
    richTextNode.content,
    payload
  );

  return {
    root: {
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/**
 * Convertit un tableau de nœuds Contentful en nœuds Lexical
 * @param nodes - Nœuds Contentful
 * @param payload - Instance Payload pour chercher les médias (optionnel)
 * @returns Nœuds Lexical
 */
async function convertContentfulNodesToLexical(
  nodes: any[],
  payload?: any
): Promise<any[]> {
  const lexicalNodes: any[] = [];

  for (const node of nodes) {
    const lexicalNode = await convertSingleContentfulNodeToLexical(
      node,
      payload
    );
    if (lexicalNode) {
      lexicalNodes.push(lexicalNode);
    }
  }

  return lexicalNodes;
}

/**
 * Convertit un seul nœud Contentful en nœud Lexical
 * @param node - Nœud Contentful
 * @param payload - Instance Payload pour chercher les médias (optionnel)
 * @returns Nœud Lexical ou null
 */
async function convertSingleContentfulNodeToLexical(
  node: any,
  payload?: any
): Promise<any | null> {
  switch (node.nodeType) {
    case "paragraph":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      };

    case "heading-1":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        tag: "h1",
        type: "heading",
        version: 1,
      };

    case "heading-2":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        tag: "h2",
        type: "heading",
        version: 1,
      };

    case "heading-3":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        tag: "h3",
        type: "heading",
        version: 1,
      };

    case "heading-4":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        tag: "h4",
        type: "heading",
        version: 1,
      };

    case "heading-5":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        tag: "h5",
        type: "heading",
        version: 1,
      };

    case "heading-6":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        tag: "h6",
        type: "heading",
        version: 1,
      };

    case "unordered-list":
      return {
        children: await convertContentfulListItemsToLexical(
          node.content || [],
          payload
        ),
        direction: null,
        format: "",
        indent: 0,
        listType: "bullet",
        start: 1,
        tag: "ul",
        type: "list",
        version: 1,
      };

    case "ordered-list":
      return {
        children: await convertContentfulListItemsToLexical(
          node.content || [],
          payload
        ),
        direction: null,
        format: "",
        indent: 0,
        listType: "number",
        start: 1,
        tag: "ol",
        type: "list",
        version: 1,
      };

    case "blockquote":
      return {
        children: convertContentfulInlineNodesToLexical(node.content || []),
        direction: null,
        format: "",
        indent: 0,
        type: "quote",
        version: 1,
      };

    case "hr":
      return {
        type: "horizontalrule",
        version: 1,
      };

    case "embedded-asset-block":
      // Pour les assets intégrés, on cherche l'image dans Payload et on crée un nœud d'image
      return await handleEmbeddedAssetBlock(node, payload);

    default:
      // Node type non géré, on essaie de traiter le contenu
      if (node.content && Array.isArray(node.content)) {
        return {
          children: convertContentfulInlineNodesToLexical(node.content),
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        };
      }
      return null;
  }
}

/**
 * Convertit les éléments de liste Contentful en éléments Lexical
 * @param listItems - Éléments de liste Contentful
 * @param payload - Instance Payload pour chercher les médias (optionnel)
 * @returns Éléments de liste Lexical
 */
async function convertContentfulListItemsToLexical(
  listItems: any[],
  payload?: any
): Promise<any[]> {
  const results = [];

  for (const item of listItems.filter(item => item.nodeType === "list-item")) {
    const children = await convertContentfulNodesToLexical(
      item.content || [],
      payload
    );

    // @ts-expect-error
    results.push({
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "listitem",
      value: 1,
      version: 1,
    });
  }

  return results;
}

/**
 * Convertit les nœuds inline Contentful en nœuds Lexical
 * @param inlineNodes - Nœuds inline Contentful
 * @returns Nœuds inline Lexical
 */
function convertContentfulInlineNodesToLexical(inlineNodes: any[]): any[] {
  const lexicalNodes: any[] = [];

  for (const node of inlineNodes) {
    const lexicalNode = convertSingleContentfulInlineNodeToLexical(node);
    if (lexicalNode) {
      lexicalNodes.push(lexicalNode);
    }
  }

  return lexicalNodes;
}

/**
 * Convertit un seul nœud inline Contentful en nœud Lexical
 * @param node - Nœud inline Contentful
 * @returns Nœud inline Lexical ou null
 */
function convertSingleContentfulInlineNodeToLexical(node: any): any | null {
  switch (node.nodeType) {
    case "text":
      let format = 0;

      // Appliquer les formats de texte
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case "bold":
              format |= 1; // Bold = 1
              break;
            case "italic":
              format |= 2; // Italic = 2
              break;
            case "underline":
              format |= 8; // Underline = 8
              break;
            case "code":
              format |= 16; // Code = 16
              break;
            case "strikethrough":
              format |= 4; // Strikethrough = 4
              break;
          }
        }
      }

      return {
        detail: 0,
        format,
        mode: "normal",
        style: "",
        text: node.value || "",
        type: "text",
        version: 1,
      };

    case "hyperlink":
      // Pour l'instant, on convertit les liens en texte simple avec l'URL
      const linkText = node.content?.[0]?.value || "Lien";
      const linkUrl = (node.data?.uri || "#").trim();

      return {
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text: `${linkText} (${linkUrl})`,
        type: "text",
        version: 1,
      };

    default:
      // Node type non géré, on traite récursivement le contenu
      if (node.content && Array.isArray(node.content)) {
        return convertContentfulInlineNodesToLexical(node.content);
      }
      return null;
  }
}

/**
 * Gère les assets intégrés (images) dans le rich text Contentful
 * @param node - Nœud embedded-asset-block
 * @param payload - Instance Payload pour chercher l'image
 * @returns Nœud d'image Lexical ou paragraphe de fallback
 */
async function handleEmbeddedAssetBlock(
  node: any,
  payload?: any
): Promise<any> {
  const assetId = node.data?.target?.sys?.id;
  const assetTitle = node.data?.target?.fields?.title || "Image intégrée";

  if (!payload || !assetId) {
    // Fallback: paragraphe avec le titre de l'asset
    return {
      children: [
        {
          detail: 0,
          format: 2, // Italic pour indiquer que c'est un placeholder
          mode: "normal",
          style: "",
          text: `[${assetTitle}]`,
          type: "text",
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "paragraph",
      version: 1,
    };
  }

  try {
    // Chercher l'image dans Payload par son contentfulId
    const mediaId = await findMediaByContentfulId(payload, assetId);

    if (mediaId) {
      // Créer un nœud d'image Lexical (bloc d'upload)
      return {
        type: "upload",
        value: {
          id: mediaId,
        },
        relationTo: "media",
        version: 1,
      };
    } else {
      console.log(
        `⚠️  Image non trouvée dans Payload pour Contentful ID: ${assetId}`
      );
      // Fallback: paragraphe avec le titre
      return {
        children: [
          {
            detail: 0,
            format: 2, // Italic
            mode: "normal",
            style: "",
            text: `[${assetTitle} - Image non trouvée]`,
            type: "text",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      };
    }
  } catch (error) {
    console.error(
      `❌ Erreur lors de la recherche de l'image ${assetId}:`,
      error
    );
    // Fallback en cas d'erreur
    return {
      children: [
        {
          detail: 0,
          format: 2, // Italic
          mode: "normal",
          style: "",
          text: `[${assetTitle} - Erreur de chargement]`,
          type: "text",
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "paragraph",
      version: 1,
    };
  }
}
