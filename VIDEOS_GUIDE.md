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

### Vidéo YouTube
```json
{
  "videoType": "youtube",
  "youtubeID": "dQw4w9WgXcQ",
  "title": "Ma vidéo YouTube"
}
```

### Vidéo Vimeo
```json
{
  "videoType": "vimeo",
  "vimeoID": "123456789",
  "title": "Ma vidéo Vimeo"
}
```

## Bonnes pratiques

### Performance
- Les vidéos utilisent un chargement lazy par défaut
- YouTube utilise le domaine `youtube-nocookie.com` pour éviter les cookies inutiles

### Accessibilité
- Toujours renseigner un titre descriptif quand possible

### SEO
- Titres descriptifs et uniques

## Développement

### Structure des fichiers
- `src/payload/blocks/VideoBlock.ts` : Configuration Payload
- `src/components/blocks/VideoBlock.tsx` : Composant React
- `src/components/blocks/BlockRenderer.tsx` : Renderer générique
- `src/components/ui/VideoIframe.tsx` : Composant iframe sécurisé

Le système est maintenant volontairement simple et se concentre sur l'essentiel : afficher des vidéos YouTube et Vimeo de manière sécurisée.