-- Script de migration pour remplacer la table media (Cloudinary) par media_s3 (S3)
-- ⚠️  ATTENTION: Ce script doit être exécuté quand l'application est ARRÊTÉE
-- ⚠️  ATTENTION: Faire un backup complet de la base avant d'exécuter

-- Étape 1: Vérifier que les tables existent
SELECT 'Vérification des tables existantes' as etape;
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t 
WHERE t.table_name IN ('media', 'media_s3') 
  AND t.table_schema = 'public';

-- Étape 2: Compter les enregistrements avant migration
SELECT 'Comptage avant migration' as etape;
SELECT 'media' as table_name, count(*) as nb_records FROM media
UNION ALL
SELECT 'media_s3' as table_name, count(*) as nb_records FROM media_s3;

-- Étape 3: Sauvegarder l'ancienne table media (Cloudinary)
SELECT 'Sauvegarde de la table media originale' as etape;
ALTER TABLE media RENAME TO media_cloudinary_backup;

-- Étape 4: Renommer media_s3 en media
SELECT 'Renommage de media_s3 vers media' as etape;
ALTER TABLE media_s3 RENAME TO media;

-- Étape 5: Vérifier la migration
SELECT 'Vérification post-migration' as etape;
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t 
WHERE t.table_name IN ('media', 'media_cloudinary_backup') 
  AND t.table_schema = 'public';

-- Étape 6: Compter les enregistrements après migration
SELECT 'Comptage après migration' as etape;
SELECT 'media (nouvelle)' as table_name, count(*) as nb_records FROM media
UNION ALL
SELECT 'media_cloudinary_backup' as table_name, count(*) as nb_records FROM media_cloudinary_backup;

-- Étape 7: Vérifier quelques échantillons
SELECT 'Échantillon de la nouvelle table media' as etape;
SELECT id, filename, url, alt, "mimeType", "createdAt" 
FROM media 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- =====================================================================
-- SCRIPT DE ROLLBACK (en cas de problème)
-- =====================================================================
/*
-- En cas de problème, exécuter ce rollback:

-- Rollback: Restaurer l'ancienne configuration
ALTER TABLE media RENAME TO media_s3_temp;
ALTER TABLE media_cloudinary_backup RENAME TO media;
ALTER TABLE media_s3_temp RENAME TO media_s3;

-- Vérifier le rollback
SELECT 'Rollback effectué' as statut;
SELECT table_name, count(*) as nb_records 
FROM (
  SELECT 'media' as table_name, count(*) FROM media
  UNION ALL
  SELECT 'media_s3' as table_name, count(*) FROM media_s3
) t;
*/

-- =====================================================================
-- NETTOYAGE OPTIONNEL (à exécuter SEULEMENT après validation complète)
-- =====================================================================
/*
-- ⚠️  À exécuter SEULEMENT quand tout fonctionne parfaitement
-- ⚠️  Cette action est IRRÉVERSIBLE

-- Supprimer la sauvegarde Cloudinary (IRRÉVERSIBLE)
-- DROP TABLE media_cloudinary_backup;

-- Vérifier le nettoyage
-- SELECT 'Nettoyage terminé' as statut;
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name LIKE 'media%' AND table_schema = 'public';
*/