export type ApiRes = {
  data: {
    docs: any[];
  };
};

export type Category = {
  id: string;
  name: string;
  order: number;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type Categories = Category[];

export type PayloadImageData = {
  id: string;
  alt: string;
  legend: string;
  updatedAt?: string;
  createdAt?: string;
  url: string;
  thumbnailURL?: string;
  filename?: string;
  width?: number;
  height?: number;
};

export type Author = {
  id: string;
  name: string;
  description: string;
  photo: PayloadImageData;
  updatedAt?: string;
  createdAt?: string;
  slug: string;
};

export type Authors = Author[];

export type Article = {
  id: string;
  titre: string;
  slug: string;
  date: string;
  category: Category;
  authors: Authors;
  presentation: any;
  photoPrincipale: PayloadImageData;
  article?: any;
  updatedAt?: string;
  createdAt?: string;
  content_html: string;
};

export type Articles = Article[];

export type Presentation = {
  id: string;
  title: string;
  shortVersion?: object;
  longVersion?: object;
  logo?: PayloadImageData;
  updatedAt?: string;
  createdAt?: string;
  shortVersion_html: string;
  longVersion_html: string;
};

export type Presentations = Presentation[];

export type ApiPossibleResponseData =
  | Categories
  | Articles
  | Authors
  | Presentations;
