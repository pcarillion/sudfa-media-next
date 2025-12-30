export type MenuItem =
  | {
      type: "category";
      id: number | string;
      label: string;
      href: string;
    }
  | {
      type: "accueil" | "auteurs" | "a-propos" | "recherche";
      label: string;
      href: string;
    };
