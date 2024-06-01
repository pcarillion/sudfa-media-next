export type ContentfulAuthor = {
  sys: {
    id: string;
  };
  fields: {
    nom: string;
    description: string;
    photo: any;
    slug: string;
  };
};

export type ContentfulImageData = {
  sys: {
    id: string;
  };
  fields: {
    description: string;
    file: {
      url: string;
      fileName: string;
    };
  };
};

export type ContentfulAuthors = ContentfulAuthor[];

export type ContentfulArticle = {
  sys: {
    id: string;
  };
  fields: {
    titre: string;
    dateDePublication: string;
    presentation: string;
    categorie: string;
    photoPrincipale: ContentfulImageData;
    auteur: ContentfulAuthors;
    article: any;
    slug: string;
  };
};

export type ContentfulArticles = ContentfulArticle[];

export type ContentfulPresentation = {
  sys: {
    id: string;
  };
  fields: {
    titre: string;
    versionCourte: any;
    versionLongue: any;
    logo: ContentfulImageData;
    image: ContentfulImageData;
    texteSectionActualite: string;
    textSectionPolitique: string;
    texteSectionHistoire: string;
    texteSectionCulture: string;
  };
};

export type CategoriesPresentation = {
  texteSectionActualite: string;
  textSectionPolitique: string;
  texteSectionHistoire: string;
  texteSectionCulture: string;
};
