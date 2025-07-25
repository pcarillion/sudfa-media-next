-- Version simplifiée pour inverser les IDs (ID 500 → 1, ID 499 → 2, etc.)
-- ⚠️  BACKUP OBLIGATOIRE avant exécution

BEGIN;

-- Backup de vérification
CREATE TEMP TABLE media_backup AS SELECT * FROM media;

-- Désactiver les contraintes
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_pkey;

-- Décaler temporairement les IDs pour éviter les conflits
UPDATE media SET id = id + 1000;

-- Appliquer l'inversion: nouveau_id = 502 - ancien_id
UPDATE media SET id = 502 - (id - 1000);

-- Recréer la contrainte
ALTER TABLE media ADD CONSTRAINT media_pkey PRIMARY KEY (id);

-- Réinitialiser la séquence
SELECT setval('media_id_seq', 500, true);

-- Vérification finale
SELECT 
    'Inversion terminée' as statut,
    count(*) as total,
    min(id) as nouveau_min,
    max(id) as nouveau_max
FROM media;

-- Si tout est OK, commitez avec: COMMIT;
-- Si problème, annulez avec: ROLLBACK;