# Sudfa Media - Front End - Next JS

Ce repo contient le code source front-end du site sudfa-media.com.

## Technos

- NextJS 14
- React 18
- Typescript 5.4

## Architecture

- `app`: nous utilisons l'App Router de Next 14
- `containers`: pour chaque page, un container qui déploie la logique et l'agencement des composants
- `components`: l'ensemble des composants utilisés à travers les différentes pages
- `lib`: api handlers, services
- `types`
- `utils`

## Installation en local

Les variables d'environnement (.env.local).

```
SUDFA_BACKEND_BASE_URL=
BASE_URL=
NODEMAILER_SERVICE=
NODEMAILER_EMAIL=
NODEMAILER_PASS=
ENABLE_CONTENTFUL=
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
```

Pour installer les node modules

```bash
yarn
```

Pour lancer le projet en local

```bash
yarn run dev
```

## API

Le projet, intialement développé en GatsbyJS, utilisait le CMS Headless ContentfulJS.

Avec la migration vers NextJS, nous sommes passés à un CMS Headless PayloadJS.

Afin de faciliter la migration du contenu d'un CMS à l'autre et afin de garder en backup le fonctionnement avec Contentful, nous avons donné la possibilité d'utiliser les deux APIS.

Les composants React sont aveugles à l'API qui est utilisée. La logique de query et de formatage de la donnée est strictement séparée.

Pour utiliser Contentful, il faut utiliser la variable `ENABLE_CONTENTFUL` en donnant la valeyr`"true"` et fournir le space Id ainsi que les access_token.

Pour utiliser Payload, il suffit de fournir l'url de l'API dans la variable `SUDFA_BACKEND_BASE_URL`.

## Déploiement

Le projet est automatiquement déployé sur Netlify lors du push sur la branche master.

## Tests e2E

Des tests e2e sur Cypress ont été ajoutés, notamment pour tester le formulaire de contact.
