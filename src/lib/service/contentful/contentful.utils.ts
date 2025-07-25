// import {
//   Article,
//   Author,
//   Categories,
//   PayloadImageData,
//   Presentation,
// } from "@/types/api.types";
// import {
//   CategoriesPresentation,
//   ContentfulArticle,
//   ContentfulAuthor,
//   ContentfulImageData,
//   ContentfulPresentation,
// } from "../../../types/contentful.types";
// import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
// import { BLOCKS, Block, Inline } from "@contentful/rich-text-types";

// export const ContentfulCategories: Categories = [
//   {
//     id: "1",
//     name: "Actualités au Soudan",
//     order: 1,
//   },
//   {
//     id: "2",
//     name: "Politique",
//     order: 2,
//   },
//   {
//     id: "3",
//     name: "Histoire",
//     order: 3,
//   },
//   {
//     id: "4",
//     name: "Culture",
//     order: 4,
//   },
//   {
//     id: "5",
//     name: "Film",
//     order: 5,
//   },
//   {
//     id: "6",
//     name: "Evénements",
//     order: 6,
//   },
//   {
//     id: "7",
//     name: "Ressources",
//     order: 7,
//   },
// ];

// export const mapContentfulAuthor = (author: ContentfulAuthor): Author => {
//   const { sys, fields } = author;
//   return {
//     id: sys.id,
//     name: fields.nom,
//     description: fields.description,
//     photo: mapContentfulImageData(fields.photo),
//     slug: fields.slug,
//   };
// };

// export const mapContentfulImageData = (
//   image: ContentfulImageData
// ): PayloadImageData => {
//   const { sys, fields } = image;
//   return {
//     id: sys.id,
//     alt: fields.description,
//     legend: fields.description,
//     url: "https:" + fields.file.url,
//   };
// };

// const ContentfulRichTextOptionsOptions = {
//   renderNode: {
//     [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
//       const fields = node.data.target.fields;
//       return `<img class="my-12 block mx-auto" width="${
//         fields.file.details.image?.width
//       }" height="${fields.file.details.image?.height}" src="${
//         "https:" + fields.file.url
//       }" />`;
//     },
//   },
// };

// export const mapContentfulArticle = (article: ContentfulArticle): Article => {
//   const { sys, fields } = article;
//   return {
//     id: sys.id,
//     titre: fields.titre,
//     slug: fields.slug,
//     date: fields.dateDePublication,
//     category:
//       ContentfulCategories.find(
//         (category) => category.name === fields.categorie
//       ) || ContentfulCategories[0],
//     authors: fields.auteur.map((a) => mapContentfulAuthor(a)),
//     presentation: fields.presentation,
//     photoPrincipale: mapContentfulImageData(fields.photoPrincipale),
//     content_html: documentToHtmlString(
//       fields.article,
//       ContentfulRichTextOptionsOptions
//     ),
//     //   updatedAt: string;
//     //   createdAt: string;
//     //   article: string;
//   };
// };

// export const mapContentfulPresentation = (
//   presentation: ContentfulPresentation
// ): Presentation => {
//   const { sys, fields } = presentation;
//   return {
//     id: sys.id,
//     titre: fields.titre,
//     shortVersion_html: documentToHtmlString(
//       fields.versionCourte,
//       ContentfulRichTextOptionsOptions
//     ),
//     longVersion_html: documentToHtmlString(
//       fields.versionLongue,
//       ContentfulRichTextOptionsOptions
//     ),
//   };
// };

// export const mapCategoryPresentation = (
//   presentation: CategoriesPresentation,
//   categoryId: string
// ): string | undefined => {
//   const categoryName =
//     ContentfulCategories.find((cat) => cat.id === categoryId)?.name || "";
//   if (
//     !["Actualités au Soudan", "Politique", "Histoire", "Culture"].includes(
//       categoryName
//     )
//   )
//     return undefined;
//   return {
//     ["Actualités au Soudan"]: presentation.texteSectionActualite,
//     Politique: presentation.textSectionPolitique,
//     Histoire: presentation.texteSectionHistoire,
//     Culture: presentation.texteSectionCulture,
//   }[categoryName];
// };
