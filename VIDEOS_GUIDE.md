# Guide d'utilisation des vidéos dans Lexical

## Vue d'ensemble

Le système de vidéos dans Lexical permet d'intégrer facilement des vidéos dans vos articles avec support pour :
- YouTube
- Vimeo

## Types de vidéos supportés

### 1. Vidéos YouTube
- **Type** : `youtube`
- **Champ requis** : `youtubeID`
- **Format** : Seulement l'ID de la vidéo (ex: `dQw4w9WgXcQ`)
- **Domaine utilisé** : `youtube-nocookie.com` pour éviter les problèmes CORS

### 2. Vidéos Vimeo
- **Type** : `vimeo`
- **Champ requis** : `vimeoID`
- **Format** : Seulement l'ID de la vidéo (ex: `123456789`)

## Options de configuration

### Métadonnées
- `title` : Titre de la vidéo (optionnel)

## Utilisation dans l'éditeur Payload

1. Dans l'éditeur Lexical, cliquez sur le bouton "Block"
2. Sélectionnez "Vidéo"
3. Configurez les paramètres :
   - Choisissez le type de vidéo (YouTube ou Vimeo)
   - Renseignez l'ID selon le type
   - Ajoutez un titre (optionnel)

## Fonctionnalités

### Affichage simple
- Iframe intégrée directement
- Ratio d'aspect 16:9 fixe
- Pas de prévisualisation, chargement direct

### Responsive design
- Adaptation automatique mobile/desktop
- Ratio d'aspect préservé

## Exemples d'utilisation

### Vidéo YouTube simple
```json
{
  "videoType": "youtube",
  "youtubeID": "dQw4w9WgXcQ",
  "title": "Ma vidéo YouTube",
  "aspectRatio": "16:9"
}
```

### Vidéo avec options avancées
```json
{
  "videoType": "youtube", 
  "youtubeID": "dQw4w9WgXcQ",
  "title": "Vidéo de démonstration",
  "description": "Une démonstration complète de notre produit",
  "autoplay": false,
  "controls": true,
  "loop": false,
  "muted": false,
  "width": 800,
  "aspectRatio": "16:9"
}
```

### Upload direct
```json
{
  "videoType": "upload",
  "videoFile": {
    "id": "media_id",
    "url": "/uploads/video.mp4"
  },
  "title": "Vidéo locale",
  "controls": true
}
```

## Bonnes pratiques

### Performance
- Utilisez `autoplay: false` par défaut pour économiser la bande passante
- Définissez des largeurs maximales raisonnables
- Préférez YouTube/Vimeo pour les vidéos publiques (CDN optimisé)

### Accessibilité
- Toujours renseigner un titre descriptif
- Utilisez `muted: true` si `autoplay: true`
- Ajoutez des descriptions pour le contexte

### SEO
- Titres descriptifs et uniques
- Descriptions détaillées
- Ratios d'aspect cohérents pour l'apparence

## Développement

### Structure des fichiers
- `src/payload/blocks/VideoBlock.ts` : Configuration Payload
- `src/components/blocks/VideoBlock.tsx` : Composant React
- `src/components/blocks/BlockRenderer.tsx` : Renderer générique
- `src/utils/videoHelpers.ts` : Utilitaires vidéo

### Extension
Pour ajouter de nouveaux types de vidéos :
1. Étendre l'enum `videoType` dans `VideoBlock.ts`
2. Ajouter les champs nécessaires
3. Implémenter le rendu dans `VideoBlock.tsx`
4. Ajouter les utilitaires dans `videoHelpers.ts`