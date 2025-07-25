import { initializePayloadForMigration, closePayloadConnections } from "./utils/migration-helpers";

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  url?: string;
  [key: string]: any;
}

interface LexicalContent {
  root: {
    children: LexicalNode[];
    direction?: string;
    format?: string;
    indent?: number;
    type: string;
    version: number;
  };
}

/**
 * Génère un ID aléatoire au format MongoDB ObjectId
 */
function generateRandomId(): string {
  return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 18);
}

/**
 * Script pour transformer les liens mal formatés en vrais liens Lexical
 */
async function fixArticleLinks() {
  console.log("🚀 Démarrage de la correction des liens d'articles");

  const payload = await initializePayloadForMigration({ useS3: true });

  try {
    // Récupérer l'article avec l'ID 37
    console.log("📖 Récupération de l'article ID 37...");
    const article = await payload.findByID({
      collection: "articles",
      id: 37,
    });

    if (!article) {
      console.log("❌ Article avec ID 37 non trouvé");
      return;
    }

    console.log(`✅ Article trouvé: "${article.titre}"`);
    
    // Afficher le contenu actuel pour analyse
    console.log("\n📋 Contenu actuel de l'article:");
    if (typeof article.article === 'string') {
      console.log("Format: HTML String");
      console.log("Contenu:", article.article.substring(0, 500) + "...");
    } else if (article.article && typeof article.article === 'object') {
      console.log("Format: Lexical JSON");
      console.log("Structure:", JSON.stringify(article.article, null, 2).substring(0, 1000) + "...");
      
      // Analyser et transformer les liens
      const updatedContent = transformLinksInLexicalContent(article.article);
      
      if (JSON.stringify(updatedContent) !== JSON.stringify(article.article)) {
        console.log("\n🔧 Liens transformés détectés, mise à jour de l'article...");
        
        await payload.update({
          collection: "articles",
          id: 37,
          data: {
            article: updatedContent,
          },
        });
        
        console.log("✅ Article mis à jour avec succès");
      } else {
        console.log("\n🔍 Aucun lien à transformer trouvé");
      }
    } else {
      console.log("Format: Inconnu ou vide");
    }

  } catch (error) {
    console.error("❌ Erreur lors de la correction des liens:", error);
  } finally {
    await closePayloadConnections(payload);
  }
}

/**
 * Transforme les liens mal formatés dans le contenu Lexical
 */
function transformLinksInLexicalContent(content: LexicalContent): LexicalContent {
  if (!content?.root?.children) {
    return content;
  }

  const transformedChildren: LexicalNode[] = [];
  
  for (const node of content.root.children) {
    const transformedNode = transformNode(node);
    
    // Si le transform retourne un tableau, on l'étale
    if (Array.isArray(transformedNode)) {
      transformedChildren.push(...transformedNode);
    } else {
      transformedChildren.push(transformedNode);
    }
  }

  return {
    ...content,
    root: {
      ...content.root,
      children: transformedChildren,
    },
  };
}

/**
 * Transforme récursivement les nœuds pour détecter et corriger les liens
 */
function transformNode(node: LexicalNode): LexicalNode | LexicalNode[] {
  // Si c'est un nœud de texte, chercher des liens au format (1) Source : ... (URL)
  if (node.type === "text" && node.text) {
    const linkRegex = /\(\d+\)\s*Source\s*:\s*Communiqué\s*:\s*"([^"]+)"\s*\((https?:\/\/[^)]+)\)/gi;
    
    if (linkRegex.test(node.text)) {
      // Si le texte contient des liens, on doit le transformer
      const transformedParts = transformTextWithLinks(node);
      
      // Si on a au moins une partie et que c'est différent du nœud original, on retourne
      if (transformedParts.length >= 1 && transformedParts[0] !== node) {
        return transformedParts;
      }
    }
  }

  // Traiter les enfants récursivement
  if (node.children && Array.isArray(node.children)) {
    const transformedChildren: LexicalNode[] = [];
    
    for (const child of node.children) {
      const transformedChild = transformNode(child);
      
      // Si le transform retourne un tableau, on l'étale
      if (Array.isArray(transformedChild)) {
        transformedChildren.push(...transformedChild);
      } else {
        transformedChildren.push(transformedChild);
      }
    }
    
    node = { ...node, children: transformedChildren };
  }

  return node;
}

/**
 * Transforme un nœud de texte contenant des liens mal formatés
 */
function transformTextWithLinks(textNode: LexicalNode): LexicalNode[] {
  if (!textNode.text) return [textNode];

  // Regex pour détecter les liens au format (1) Source : Communiqué : "titre" (URL)
  const linkRegex = /\(\d+\)\s*Source\s*:\s*Communiqué\s*:\s*"([^"]+)"\s*\((https?:\/\/[^)]+)\)/gi;
  const parts: LexicalNode[] = [];
  let lastIndex = 0;
  let hasMatches = false;

  // Réinitialiser le regex pour une nouvelle recherche
  linkRegex.lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(textNode.text)) !== null) {
    hasMatches = true;
    const [fullMatch, linkText, url] = match;
    const matchStart = match.index!;
    
    // Ajouter le texte avant le lien (s'il y en a)
    if (matchStart > lastIndex) {
      const beforeText = textNode.text.substring(lastIndex, matchStart);
      parts.push({
        type: "text",
        text: beforeText,
        format: textNode.format || 0,
        mode: "normal",
        style: "",
        detail: 0,
        version: 1,
      });
    }

    // Créer le nœud de lien propre (format Lexical/Payload correct)
    const linkNode = {
      id: generateRandomId(),
      type: "link",
      fields: {
        url: url.trim(),
        linkType: "custom"
      },
      format: "",
      indent: 0,
      version: 3,
      children: [
        {
          type: "text",
          text: linkText.trim(),
          format: 0,
          mode: "normal",
          style: "",
          detail: 0,
          version: 1,
        }
      ],
      direction: "ltr"
    };
    parts.push(linkNode);

    lastIndex = matchStart + fullMatch.length;
  }

  // Si aucune correspondance, retourner le nœud original
  if (!hasMatches) {
    return [textNode];
  }

  // Ajouter le texte restant après le dernier lien
  if (lastIndex < textNode.text.length) {
    const remainingText = textNode.text.substring(lastIndex);
    if (remainingText.trim()) {
      parts.push({
        type: "text",
        text: remainingText,
        format: textNode.format || 0,
        mode: "normal",
        style: "",
        detail: 0,
        version: 1,
      });
    }
  }

  return parts;
}

/**
 * Script pour corriger tous les articles avec des liens mal formatés
 */
async function fixAllArticleLinks() {
  console.log("🚀 Démarrage de la correction des liens pour tous les articles");

  const payload = await initializePayloadForMigration({ useS3: true });

  try {
    // Récupérer tous les articles
    console.log("📖 Récupération de tous les articles...");
    const articles = await payload.find({
      collection: "articles",
      limit: 1000, // Ajuster selon le nombre d'articles
    });

    console.log(`✅ ${articles.docs.length} articles trouvés`);

    let updatedCount = 0;

    for (const article of articles.docs) {
      console.log(`\n🔍 Traitement de l'article "${article.titre}" (ID: ${article.id})`);
      
      if (article.article && typeof article.article === 'object') {
        const originalContent = JSON.stringify(article.article);
        const updatedContent = transformLinksInLexicalContent(article.article);
        
        if (JSON.stringify(updatedContent) !== originalContent) {
          console.log("🔧 Liens transformés détectés, mise à jour...");
          
          await payload.update({
            collection: "articles",
            id: article.id,
            data: {
              article: updatedContent,
            },
          });
          
          updatedCount++;
          console.log("✅ Article mis à jour");
        } else {
          console.log("ℹ️ Aucun lien à transformer");
        }
      } else {
        console.log("⏭️ Article ignoré (format non Lexical)");
      }
    }

    console.log(`\n🎉 Traitement terminé! ${updatedCount} articles mis à jour sur ${articles.docs.length}`);

  } catch (error) {
    console.error("❌ Erreur lors de la correction des liens:", error);
  } finally {
    await closePayloadConnections(payload);
  }
}

// Exécuter le script selon l'argument
const mode = process.argv[2] || "single";

if (mode === "all") {
  fixAllArticleLinks();
} else {
  fixArticleLinks();
}