# Migration Cloudinary vers S3

## Guide de migration des médias de Cloudinary vers AWS S3

### Prérequis

1. **Variables d'environnement S3** (déjà configurées) :
   ```env
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   ```

2. **Variables d'environnement Cloudinary** (pour la récupération) :
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Étapes de migration

1. **Exécuter la migration complète** :
   ```bash
   npm run migrate:cloudinary-to-s3
   ```

2. **Valider la migration** :
   ```bash
   npm run validate:migration
   ```

### Ce que fait le script

#### 1. Migration des médias
- Télécharge tous les fichiers depuis Cloudinary
- Upload vers S3 avec la même structure de noms
- Met à jour les enregistrements dans la collection `media`

#### 2. Mise à jour des références
- **Articles** : Met à jour les URLs d'images dans le contenu Lexical
- **Auteurs** : Les photos sont automatiquement mises à jour via les relations
- **Présentations** : Met à jour les URLs dans `shortVersion` et `longVersion`

#### 3. Types de contenu supportés
- Images : JPG, JPEG, PNG, GIF, WebP, SVG
- Documents : PDF, DOC, DOCX
- Contenu Lexical : Nœuds d'image et liens

### Structure des URLs après migration

**Avant (Cloudinary)** :
```
https://res.cloudinary.com/your-cloud/image/upload/v123/filename.jpg
```

**Après (S3)** :
```
https://your-bucket.s3.eu-north-1.amazonaws.com/payload/filename.jpg
```

### Validation post-migration

Le script génère automatiquement :
- **Résumé de migration** : Nombre d'éléments migrés
- **Fichier de mapping** : `migration-url-mappings.json` avec toutes les correspondances URL
- **Validation** : Vérification qu'aucune URL Cloudinary ne subsiste

### Rollback

En cas de problème, le fichier `migration-url-mappings.json` contient toutes les correspondances pour un éventuel rollback manuel.

### Commandes disponibles

```bash
# Migration complète
npm run migrate:cloudinary-to-s3

# Validation uniquement
npm run validate:migration
```

### Logs de migration

Le script affiche des logs détaillés :
- ⬇️ Téléchargement depuis Cloudinary
- ⬆️ Upload vers S3
- ✅ Mise à jour des références
- 📊 Résumé final
- ❌ Erreurs éventuelles

### Notes importantes

1. **Backup** : Faites un backup de votre base de données avant la migration
2. **Temps** : La migration peut prendre du temps selon le nombre de médias
3. **Réseau** : Assurez-vous d'avoir une connexion stable
4. **Permissions** : Vérifiez que votre bucket S3 est configuré correctement