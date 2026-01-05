import { buildMenuItems } from "../Header.utils";
import { Category } from "@/payload-types";
import { OrdreMenuGlobal } from "@/lib/service/payload/api.types";

const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: "Test Category",
  order: 1,
  description: "Test description",
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
  ...overrides,
});

describe("Header.utils", () => {
  describe("buildMenuItems", () => {
    it("should build default menu with static items and categories sorted by name", () => {
      const categories = [
        createMockCategory({ id: 2, name: "Science" }),
        createMockCategory({ id: 1, name: "Arts" }),
      ];

      const result = buildMenuItems(categories, null);

      expect(result.map(item => item.type)).toEqual([
        "accueil",
        "category",
        "category",
        "auteurs",
        "a-propos",
        "recherche",
      ]);
      expect(result[1]).toMatchObject({
        type: "category",
        label: "Arts",
        href: "/category/1",
      });
      expect(result[2]).toMatchObject({
        type: "category",
        label: "Science",
        href: "/category/2",
      });
    });

    it("should respect ordre menu and append missing items", () => {
      const categories = [
        createMockCategory({ id: 1, name: "Arts" }),
        createMockCategory({ id: 2, name: "Science" }),
      ];
      const ordreMenu: OrdreMenuGlobal = {
        items: [
          { itemType: "categorie", category: 2 },
          { itemType: "accueil" },
        ],
      };

      const result = buildMenuItems(categories, ordreMenu);

      expect(result.map(item => item.type)).toEqual([
        "category",
        "accueil",
        "category",
        "auteurs",
        "a-propos",
        "recherche",
      ]);
      expect(result[0]).toMatchObject({ href: "/category/2" });
    });

    it("should ignore missing categories from ordre menu", () => {
      const categories = [createMockCategory({ id: 1, name: "Arts" })];
      const ordreMenu: OrdreMenuGlobal = {
        items: [{ itemType: "categorie", category: 999 }],
      };

      const result = buildMenuItems(categories, ordreMenu);

      expect(result.some(item => item.type === "category")).toBe(true);
      expect(result.some(item => item.href === "/category/999")).toBe(false);
    });
  });
});
