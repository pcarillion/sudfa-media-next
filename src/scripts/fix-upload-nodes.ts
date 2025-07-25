import { initializePayloadForMigration, closePayloadConnections } from "./utils/migration-helpers";

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  value?: any;
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
 * Script pour corriger les nœuds d'upload mal formatés dans Lexical
 */
async function fixUploadNodes() {
  console.log("🚀 Démarrage de la correction des nœuds d'upload");

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
    
    if (article.article && typeof article.article === 'object') {
      console.log("🔍 Analyse des nœuds d'upload...");
      
      const updatedContent = fixUploadNodesInContent(article.article);
      
      if (JSON.stringify(updatedContent) !== JSON.stringify(article.article)) {
        console.log("🔧 Nœuds d'upload corrigés, mise à jour de l'article...");
        
        await payload.update({
          collection: "articles",
          id: 37,
          data: {
            article: updatedContent,
          },
        });
        
        console.log("✅ Article mis à jour avec succès");
      } else {
        console.log("ℹ️ Aucun nœud d'upload à corriger");
      }
    } else {
      console.log("❌ L'article n'a pas de contenu Lexical");
    }

  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
  } finally {
    await closePayloadConnections(payload);
  }
}

/**
 * Corrige les nœuds d'upload dans le contenu Lexical
 */
function fixUploadNodesInContent(content: LexicalContent): LexicalContent {
  if (!content?.root?.children) {
    return content;
  }

  const fixedChildren = content.root.children.map(node => fixUploadNode(node));

  return {
    ...content,
    root: {
      ...content.root,
      children: fixedChildren,
    },
  };
}

/**
 * Corrige récursivement les nœuds d'upload
 */
function fixUploadNode(node: LexicalNode): LexicalNode {
  // Si c'est un nœud d'upload avec un objet value peuplé
  if (node.type === "upload" && node.value && typeof node.value === "object") {
    console.log("🔧 Correction d'un nœud d'upload:", node.value);
    
    // Extraire seulement l'ID de l'objet value
    const mediaId = node.value.id;
    
    if (mediaId) {
      return {
        ...node,
        value: mediaId, // Remplacer l'objet par l'ID seul
      };
    } else {
      console.warn("⚠️ Nœud d'upload sans ID:", node.value);
    }
  }

  // Traiter les enfants récursivement
  if (node.children && Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children.map(child => fixUploadNode(child)),
    };
  }

  return node;
}

/**
 * Script pour corriger tous les articles avec des nœuds d'upload mal formatés
 */
async function fixAllUploadNodes() {
  console.log("🚀 Démarrage de la correction des nœuds d'upload pour tous les articles");

  const payload = await initializePayloadForMigration({ useS3: true });

  try {
    // Récupérer tous les articles
    console.log("📖 Récupération de tous les articles...");
    const articles = await payload.find({
      collection: "articles",
      limit: 1000,
    });

    console.log(`✅ ${articles.docs.length} articles trouvés`);

    let updatedCount = 0;

    for (const article of articles.docs) {
      console.log(`\n🔍 Traitement de l'article "${article.titre}" (ID: ${article.id})`);
      
      if (article.article && typeof article.article === 'object') {
        const originalContent = JSON.stringify(article.article);
        const updatedContent = fixUploadNodesInContent(article.article);
        
        if (JSON.stringify(updatedContent) !== originalContent) {
          console.log("🔧 Nœuds d'upload corrigés, mise à jour...");
          
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
          console.log("ℹ️ Aucun nœud d'upload à corriger");
        }
      } else {
        console.log("⏭️ Article ignoré (format non Lexical)");
      }
    }

    console.log(`\n🎉 Traitement terminé! ${updatedCount} articles mis à jour sur ${articles.docs.length}`);

  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
  } finally {
    await closePayloadConnections(payload);
  }
}

// Exécuter le script selon l'argument
const mode = process.argv[2] || "single";

if (mode === "all") {
  fixAllUploadNodes();
} else {
  fixUploadNodes();
}