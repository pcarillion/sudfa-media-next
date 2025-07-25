import { createContentfulClient } from "./utils/contentful-client";
import {
  initializePayloadForMigration,
  closePayloadConnections,
  logEnvironmentStatus,
  logMigrationStats,
  addDelay,
  checkIfExists,
  generateSlug,
  findMediaByContentfulId,
  findAuthorByContentfulId,
  findCategoryByContentfulId,
  findCategoryByName,
  convertContentfulRichTextToHtml,
  convertContentfulRichTextToLexical,
  MigrationStats,
  MigrationOptions,
} from "./utils/migration-helpers";

// Types pour Contentful Articles (basé sur la structure réelle)
interface ContentfulArticle {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    titre: string;
    slug?: string;
    dateDePublication: string;
    categorie: string; // Nom de la catégorie sous forme de string
    auteur: Array<{
      sys: {
        id: string;
      };
    }>;
    photoPrincipale: {
      sys: {
        id: string;
      };
    };
    presentation?: string; // Peut être une string simple
    article?: any; // Rich text
  };
}

interface ContentfulResponse {
  items: ContentfulArticle[];
  total: number;
  skip: number;
  limit: number;
}

async function migrateContentfulArticles(options: MigrationOptions = {}) {
  const { isProduction = false, batchSize = 50, delay = 200 } = options;
  const envLabel = isProduction ? "PRODUCTION" : "LOCAL";

  console.log(
    `🚀 Démarrage de la migration des articles Contentful vers Payload (${envLabel})`
  );

  // Afficher le statut des variables d'environnement
  logEnvironmentStatus(isProduction);

  // Initialiser les clients
  const contentful = createContentfulClient();
  const payload = await initializePayloadForMigration(options);

  const stats: MigrationStats = { processed: 0, skipped: 0, errors: 0 };

  try {
    let skip = 0;

    while (true) {
      console.log(
        `📄 Récupération des articles ${skip + 1} à ${skip + batchSize}...`
      );

      // Récupérer les articles de Contentful
      const response = (await contentful.getEntries({
        content_type: "article", // Type de contenu article dans Contentful
        skip,
        limit: batchSize,
        include: 2, // Inclure les références (auteurs, catégories, images)
      })) as any as ContentfulResponse;

      if (response.items.length === 0) {
        break;
      }

      console.log(`✅ ${response.items.length} articles trouvés`);

      // Traiter chaque article
      for (const article of response.items) {
        try {
          const { fields, sys } = article;

          if (!fields.titre) {
            console.log(`⚠️  Pas de titre pour l'article ${sys.id}`);
            stats.errors++;
            continue;
          }

          // Vérifier si l'article existe déjà dans Payload
          const exists = await checkIfExists(
            payload,
            "articles",
            "contentfulId",
            sys.id
          );

          if (exists) {
            console.log(`⏭️  Article déjà migré: ${fields.titre}`);
            stats.skipped++;
            continue;
          }

          // Chercher la photo principale
          let photoPrincipaleId = null;
          if (fields.photoPrincipale?.sys?.id) {
            // @ts-expect-error
            photoPrincipaleId = await findMediaByContentfulId(
              payload,
              fields.photoPrincipale.sys.id
            );

            if (!photoPrincipaleId) {
              console.log(
                `⚠️  Photo principale non trouvée pour "${fields.titre}" (Contentful ID: ${fields.photoPrincipale.sys.id})`
              );
              // On continue quand même, mais on note l'erreur
            }
          }

          // Chercher la catégorie par nom
          let categoryId = null;
          if (fields.categorie) {
            // @ts-expect-error
            categoryId = await findCategoryByName(payload, fields.categorie);

            if (!categoryId) {
              console.log(
                `❌ Catégorie "${fields.categorie}" non trouvée pour "${fields.titre}"`
              );
              stats.errors++;
              continue; // Article obligatoire d'avoir une catégorie
            }
          } else {
            console.log(`❌ Pas de catégorie définie pour "${fields.titre}"`);
            stats.errors++;
            continue;
          }

          // Chercher les auteurs
          const authorIds: string[] = [];
          if (fields.auteur && Array.isArray(fields.auteur)) {
            for (const authorRef of fields.auteur) {
              if (authorRef.sys?.id) {
                const authorId = await findAuthorByContentfulId(
                  payload,
                  authorRef.sys.id
                );
                if (authorId) {
                  authorIds.push(authorId);
                } else {
                  console.log(
                    `⚠️  Auteur non trouvé pour "${fields.titre}" (Contentful ID: ${authorRef.sys.id})`
                  );
                }
              }
            }
          }

          if (authorIds.length === 0) {
            console.log(`❌ Aucun auteur valide trouvé pour "${fields.titre}"`);
            stats.errors++;
            continue; // Article obligatoire d'avoir au moins un auteur
          }

          // Utiliser le slug de Contentful ou en générer un
          const slug = fields.slug || generateSlug(fields.titre);

          // Convertir le rich text Contentful vers Lexical et HTML
          // Presentation peut être string ou rich text
          let presentationLexical = null;
          if (fields.presentation) {
            if (typeof fields.presentation === "string") {
              // Si c'est une string, on la convertit en format Lexical simple
              // @ts-expect-error
              presentationLexical = {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: fields.presentation,
                          type: "text",
                          version: 1,
                        },
                      ],
                      direction: null,
                      format: "",
                      indent: 0,
                      type: "paragraph",
                      version: 1,
                    },
                  ],
                  direction: null,
                  format: "",
                  indent: 0,
                  type: "root",
                  version: 1,
                },
              };
            } else {
              // Si c'est du rich text, on le convertit
              presentationLexical = await convertContentfulRichTextToLexical(
                fields.presentation,
                payload
              );
            }
          }

          // Debug: afficher la structure du rich text
          // if (fields.article) {
          //   console.log(`\n🔍 DEBUG - Structure rich text pour "${fields.titre}":`)
          //   console.log('Raw article data:', JSON.stringify(fields.article, null, 2))
          // }

          const articleLexical = fields.article
            ? await convertContentfulRichTextToLexical(fields.article, payload)
            : null;

          // Debug: afficher le résultat de la conversion Lexical
          // if (articleLexical) {
          //   console.log(`\n🔄 DEBUG - Conversion Lexical pour "${fields.titre}":`)
          //   console.log('Lexical result:', JSON.stringify(articleLexical, null, 2))
          // }

          const articleHtml = fields.article
            ? convertContentfulRichTextToHtml(fields.article)
            : "";

          // Préparer les données pour Payload
          const articleData = {
            titre: fields.titre,
            slug: slug,
            date: fields.dateDePublication || sys.createdAt,
            category: categoryId,
            authors: authorIds,
            photoPrincipale: photoPrincipaleId,
            presentation: presentationLexical, // Rich text au format Lexical
            article: articleLexical, // Rich text au format Lexical
            content_html: articleHtml, // Version HTML pour compatibilité/recherche
            // Champ personnalisé pour traçabilité
            contentfulId: sys.id,
          };

          // Si on n'a pas de photo principale, on exclut le champ (optionnel mais recommandé)
          if (!photoPrincipaleId) {
            // @ts-expect-error
            delete articleData.photoPrincipale;
          }

          // Créer l'article dans Payload
          const payloadArticle = await payload.create({
            collection: "articles",
            data: articleData,
          });

          console.log(
            `✅ Article migré: "${fields.titre}" → ${payloadArticle.id}`
          );
          console.log(
            `   📂 Catégorie: ✅ | 👥 Auteurs: ${authorIds.length} | 🖼️  Photo: ${photoPrincipaleId ? "✅" : "❌"}`
          );
          stats.processed++;

          // Pause pour éviter de surcharger les APIs
          await addDelay(delay);

          // Arrêter après le premier article migré avec succès
          // console.log(`🛑 Test terminé après 1 article migré avec succès`)
          // return
        } catch (error: any) {
          console.error(
            `❌ Erreur lors de la migration de l'article ${article.sys.id}:`,
            error
          );

          // Debug: afficher les détails de l'erreur de validation
          if (error.data && error.data.errors) {
            console.log(`\n🔍 DEBUG - Erreurs de validation détaillées:`);
            console.log(JSON.stringify(error.data.errors, null, 2));
          }

          if (error.cause && error.cause.errors) {
            console.log(`\n🔍 DEBUG - Erreurs cause détaillées:`);
            console.log(JSON.stringify(error.cause.errors, null, 2));
          }

          stats.errors++;
          // return;
          continue;
        }
      }

      skip += batchSize;

      // Éviter de surcharger l'API
      if (response.items.length < batchSize) {
        break;
      }
    }

    // Afficher les statistiques finales
    logMigrationStats(stats, "articles", isProduction);
  } catch (error) {
    console.error(`❌ Erreur lors de la migration ${envLabel}:`, error);
    throw error;
  } finally {
    // Fermer les connexions
    await closePayloadConnections(payload);
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const isProduction = process.argv.includes("--prod");

  migrateContentfulArticles({ isProduction })
    .then(() => {
      console.log(
        `✅ Script de migration articles ${isProduction ? "PRODUCTION" : "LOCAL"} terminé`
      );
      process.exit(0);
    })
    .catch(error => {
      console.error(`❌ Erreur fatale lors de la migration articles:`, error);
      process.exit(1);
    });
}

export default migrateContentfulArticles;
