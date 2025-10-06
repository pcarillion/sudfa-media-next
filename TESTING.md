# Guide des Tests Unitaires

Ce projet utilise Jest pour les tests unitaires des fonctions utilitaires.

## Configuration

- **Framework de test** : Jest
- **Environnement** : jsdom (pour la compatibilité avec Next.js)
- **Configuration** : `jest.config.js`
- **Setup** : `jest.setup.js`

## Commandes

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (redémarrage automatique)
npm run test:watch

# Lancer les tests avec rapport de couverture
npm run test:coverage
```

## Structure des Tests

Les tests sont organisés dans des dossiers `__tests__` à côté des fichiers sources :

```
src/
├── utils/
│   ├── __tests__/
│   │   ├── Formatting.test.ts
│   │   └── lexicalToPlainText.test.ts
│   ├── Formatting.ts
│   └── lexicalToPlainText.ts
├── components/
│   └── layout/Header/
│       ├── __tests__/
│       │   └── Header.utils.test.ts
│       └── Header.utils.tsx
└── lib/
    ├── __tests__/
    │   └── payload-init.test.ts
    └── payload-init.ts
```

## Tests Couverts

### ✅ Fonctions Utilitaires

1. **`src/utils/Formatting.ts`**
   - `formatDate()` - Formatage des dates
   - `renderLexicalToHTML()` - Conversion Lexical vers HTML

2. **`src/utils/lexicalToPlainText.ts`**
   - `lexicalToPlainText()` - Extraction de texte brut depuis Lexical

3. **`src/components/layout/Header/Header.utils.tsx`**
   - `mapCategoriesToNavItems()` - Conversion catégories vers navigation

4. **`src/components/contact/ContactForm/Contact.action.ts`**
   - `contactFormAction()` - Action serveur du formulaire de contact

5. **`src/lib/service/nodemailer/nodemailer.ts`**
   - `sendEmail()` - Service d'envoi d'email

6. **`src/lib/payload-init.ts`**
   - `getPayloadInstance()` - Initialisation singleton de Payload

## Couverture de Tests

Les tests couvrent :

- ✅ **Cas normaux** : Fonctionnement standard des fonctions
- ✅ **Cas limites** : Valeurs nulles, vides, très longues
- ✅ **Gestion d'erreurs** : Exceptions et erreurs réseau
- ✅ **Validation des entrées** : Types incorrects, données malformées
- ✅ **Formats spéciaux** : Caractères spéciaux, accents, HTML
- ✅ **Performance** : Gros volumes de données

## Mocks et Utilitaires

### Mocks Globaux
- `next/router` et `next/navigation` pour Next.js
- Variables d'environnement pour les tests
- Console.log/error pour éviter le spam

### Mocks Spécifiques
- `nodemailer` pour les tests d'email
- `payload` pour les tests d'initialisation
- `moment` pour des dates déterministes

## Bonnes Pratiques

1. **Isolation** : Chaque test est indépendant
2. **Nettoyage** : Les mocks sont réinitialisés entre les tests
3. **Noms descriptifs** : Tests explicites et compréhensibles
4. **Assertions claires** : Vérifications précises et explicites
5. **Documentation** : Commentaires pour les cas complexes

## Exemple de Test

```typescript
describe('formatDate', () => {
  it('should format a valid ISO date string correctly', () => {
    const result = formatDate('2023-12-15T10:30:00.000Z');
    expect(result).toBe('15/12/2023');
  });

  it('should handle edge case dates', () => {
    const result = formatDate('2023-02-28T23:59:59.999Z');
    expect(result).toBe('28/02/2023');
  });
});
```

## Debugging

Pour déboguer un test spécifique :

```bash
# Lancer un seul fichier de test
npm test -- Formatting.test.ts

# Lancer les tests avec plus de détails
npm test -- --verbose

# Lancer les tests en mode debug
node --inspect-brk node_modules/.bin/jest --runInBand
```