-- Script pour inverser les IDs de la table media
-- Transformation: ID 500 → 1, ID 499 → 2, ..., ID 2 → 499
-- ⚠️  ATTENTION: Faire un backup avant d'exécuter

-- Étape 1: Vérifier l'état actuel
SELECT 'État avant inversion' as etape;
SELECT 
    count(*) as total_records,
    min(id) as id_min,
    max(id) as id_max
FROM media;

-- Afficher quelques exemples
SELECT 'Échantillon avant inversion (premiers et derniers IDs)' as etape;
(SELECT id, filename, "createdAt" FROM media ORDER BY id ASC LIMIT 5)
UNION ALL
(SELECT id, filename, "createdAt" FROM media ORDER BY id DESC LIMIT 5);

-- Étape 2: Créer une colonne temporaire pour les nouveaux IDs
ALTER TABLE media ADD COLUMN new_id INTEGER;

-- Étape 3: Calculer les nouveaux IDs inversés
-- Formule: nouveau_id = (max_id + min_id) - ancien_id
-- Avec max_id=500 et min_id=2: nouveau_id = 502 - ancien_id
UPDATE media 
SET new_id = 502 - id;

-- Étape 4: Vérifier les nouveaux IDs calculés
SELECT 'Vérification des nouveaux IDs calculés' as etape;
SELECT 
    id as ancien_id, 
    new_id as nouveau_id,
    filename
FROM media 
ORDER BY id 
LIMIT 10;

-- Étape 5: Désactiver temporairement les contraintes de clé primaire
-- (Nécessaire pour éviter les conflits d'IDs pendant la mise à jour)
ALTER TABLE media DROP CONSTRAINT media_pkey;

-- Étape 6: Décaler tous les IDs existants pour éviter les conflits
-- On ajoute 1000 à tous les IDs pour libérer l'espace 1-499
UPDATE media SET id = id + 1000;

-- Étape 7: Appliquer les nouveaux IDs
UPDATE media SET id = new_id;

-- Étape 8: Supprimer la colonne temporaire
ALTER TABLE media DROP COLUMN new_id;

-- Étape 9: Recréer la contrainte de clé primaire
ALTER TABLE media ADD CONSTRAINT media_pkey PRIMARY KEY (id);

-- Étape 10: Réinitialiser la séquence d'auto-incrémentation
-- Pour que les prochains inserts commencent à 500
SELECT setval('media_id_seq', 500, true);

-- Étape 11: Vérifier le résultat final
SELECT 'État après inversion' as etape;
SELECT 
    count(*) as total_records,
    min(id) as id_min,
    max(id) as id_max
FROM media;

-- Afficher quelques exemples après inversion
SELECT 'Échantillon après inversion (premiers et derniers IDs)' as etape;
(SELECT id, filename, "createdAt" FROM media ORDER BY id ASC LIMIT 5)
UNION ALL
(SELECT id, filename, "createdAt" FROM media ORDER BY id DESC LIMIT 5);

-- Étape 12: Vérifier que l'inversion est correcte
SELECT 'Vérification de l\'inversion (les dates doivent être inversées)' as etape;
SELECT 
    id,
    filename,
    "createdAt",
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY id) = ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) 
        THEN 'OK' 
        ELSE 'ERREUR' 
    END as verification
FROM media 
ORDER BY id 
LIMIT 10;