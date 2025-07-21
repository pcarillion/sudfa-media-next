# Migration des images Contentful vers Payload CMS

Ce script migre automatiquement toutes les images de Contentful vers votre base de données Payload CMS.

## Prérequis

1. **Variables d'environnement** configurées dans `.env.local` :
   ```env
   CONTENTFUL_SPACE_ID=your-space-id
   CONTENTFUL_ACCESS_TOKEN=your-access-token
   DATABASE_URL=postgresql://...
   PAYLOAD_SECRET=your-secret
   ```

2. **Base de données Payload** initialisée et accessible

## Utilisation

### Lancer la migration
```bash
npm run migrate:images
```

## Fonctionnalités

### ✅ Ce que fait le script :
- Récupère **toutes les images** de Contentful (par batch de 100)
- Télécharge chaque image depuis Contentful
- Crée l'entrée correspondante dans Payload CMS
- Évite les doublons (vérification par ID Contentful)
- Ajoute des métadonnées de traçabilité

### 🔍 Champs ajoutés à chaque image :
- `alt` : Titre de l'image Contentful
- `legend` : Description de l'image Contentful  
- `contentfulId` : ID original pour éviter les doublons
- `originalUrl` : URL Contentful d'origine

### 📊 Suivi en temps réel :
- Progression par batch
- Nombre d'images traitées
- Gestion des erreurs individuelles
- Résumé final

## Exemple de sortie

```bash
🚀 Démarrage de la migration des images Contentful vers Payload
📄 Récupération des assets 1 à 100...
✅ 87 images trouvées
📥 Téléchargement de l'image: hero-banner.jpg
✅ Image migrée: Hero Banner → 64f7a1b2c3d4e5f6g7h8i9j0
⏭️  Image déjà migrée: Logo principal
📥 Téléchargement de l'image: article-photo.png
✅ Image migrée: Photo Article → 64f7a1b2c3d4e5f6g7h8i9j1
🎉 Migration terminée ! 85 images migrées avec succès
```

## Sécurité

- ✅ Vérification des doublons automatique
- ✅ Gestion des erreurs par image (continue en cas d'échec)
- ✅ Pas de modification des données Contentful
- ✅ Traçabilité complète des images migrées

## Après la migration

Une fois la migration terminée, vos images seront disponibles dans :
- **Interface Payload** : `http://localhost:3000/(payload)/admin/collections/media`
- **API REST** : `http://localhost:3000/(payload)/api/media`
- **Stockage** : Dossier `media/` local

Vous pourrez ensuite utiliser ces images dans vos articles, auteurs et présentations Payload CMS.