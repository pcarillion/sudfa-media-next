import { initializePayloadForMigration, closePayloadConnections } from "./utils/migration-helpers";

/**
 * Script pour examiner la structure Lexical d'un article avec un lien existant
 */
async function debugLexicalFormat() {
  console.log("🔍 Démarrage de l'analyse du format Lexical");

  const payload = await initializePayloadForMigration({ useS3: true });

  try {
    // Récupérer l'article avec l'ID 37 pour voir sa structure complète
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
    
    // Afficher la structure Lexical complète
    if (article.article && typeof article.article === 'object') {
      console.log("\n📋 Structure Lexical complète:");
      console.log(JSON.stringify(article.article, null, 2));
      
      // Parcourir récursivement pour trouver des liens existants
      const findLinks = (node: any, path: string = "root"): any[] => {
        const links: any[] = [];
        
        if (node.type === "link") {
          links.push({ node, path });
        }
        
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach((child: any, index: number) => {
            links.push(...findLinks(child, `${path}.children[${index}]`));
          });
        }
        
        return links;
      };
      
      const existingLinks = findLinks(article.article);
      
      if (existingLinks.length > 0) {
        console.log("\n🔗 Liens existants trouvés:");
        existingLinks.forEach((linkData, index) => {
          console.log(`\nLien ${index + 1} (${linkData.path}):`);
          console.log(JSON.stringify(linkData.node, null, 2));
        });
      } else {
        console.log("\n❌ Aucun lien existant trouvé dans l'article");
      }
      
    } else {
      console.log("❌ L'article n'a pas de contenu Lexical");
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'analyse:", error);
  } finally {
    await closePayloadConnections(payload);
  }
}

debugLexicalFormat();