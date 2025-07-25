# Plan de Migration Cloudinary → S3

## 📋 Étapes complètes de migration

### Phase 1: Migration des médias ✅ TERMINÉE
- [x] Script de migration `migrate-media-to-s3.ts` 
- [x] Migration des médias vers collection `media_s3`
- [x] Upload automatique vers S3
- [x] Génération du mapping des IDs

### Phase 2: Swap des tables (EN ATTENTE)
⚠️ **ATTENTION: Arrêter l'application avant d'exécuter**

1. **Backup de la base de données**
   ```bash
   pg_dump $DATABASE_URL > backup_avant_swap.sql
   ```

2. **Exécuter le script SQL**
   ```bash
   psql $DATABASE_URL -f src/scripts/swap-media-tables.sql
   ```

3. **Redémarrer l'application et tester**

### Phase 3: Nettoyage du code (APRÈS validation)

1. **Supprimer le fichier**
   ```bash
   rm src/payload/collections/MediaS3.ts
   ```

2. **Modifier `src/payload.config.ts`**
   - Supprimer `import { MediaS3 }`
   - Supprimer `MediaS3` des collections
   - Modifier s3Storage: `media: { prefix: "payload" }`

3. **Modifier `src/scripts/utils/payload-config.ts`**
   - Mêmes modifications que ci-dessus

4. **Régénérer les types**
   ```bash
   yarn generate:types
   ```

## 🔄 Plan de rollback

En cas de problème, exécuter le rollback SQL inclus dans `swap-media-tables.sql`:
```sql
ALTER TABLE media RENAME TO media_s3_temp;
ALTER TABLE media_cloudinary_backup RENAME TO media;
ALTER TABLE media_s3_temp RENAME TO media_s3;
```

## ✅ Validation

Après chaque étape, vérifier :
- [ ] Les médias s'affichent dans l'interface admin
- [ ] L'upload de nouveaux médias fonctionne  
- [ ] Les relations (articles, auteurs) affichent les bonnes images
- [ ] Les URLs des images fonctionnent sur le site

## 📊 Fichiers générés

- `id-mapping-media-to-s3.json` - Correspondance ancien/nouveau ID
- `migration-media-to-s3-stats.json` - Statistiques de migration
- `backup_avant_swap.sql` - Backup avant swap des tables

## 🎯 Résultat final

- ✅ Une seule collection `media` utilisant S3
- ✅ Toutes les relations préservées
- ✅ Mêmes IDs conservés
- ✅ Backup Cloudinary en sécurité