import { mapCategoriesToNavItems } from '../Header.utils';
import { Category } from '@/payload-types';

// Mock du type Category pour les tests
const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Test Category',
  order: 1,
  description: 'Test description',
  slug: 'test-category',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

describe('Header.utils', () => {
  describe('mapCategoriesToNavItems', () => {
    it('should convert single category to nav item', () => {
      const categories = [
        createMockCategory({
          id: 1,
          name: 'Technology',
          order: 1
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Technology',
          order: 1,
          id: 1
        }
      ]);
    });

    it('should convert multiple categories to nav items', () => {
      const categories = [
        createMockCategory({
          id: 1,
          name: 'Technology',
          order: 1
        }),
        createMockCategory({
          id: 2,
          name: 'Science',
          order: 2
        }),
        createMockCategory({
          id: 3,
          name: 'Politics',
          order: 3
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Technology',
          order: 1,
          id: 1
        },
        {
          label: 'Science',
          order: 2,
          id: 2
        },
        {
          label: 'Politics',
          order: 3,
          id: 3
        }
      ]);
    });

    it('should handle empty categories array', () => {
      const categories: Category[] = [];
      const result = mapCategoriesToNavItems(categories);
      expect(result).toEqual([]);
    });

    it('should preserve category order', () => {
      const categories = [
        createMockCategory({
          id: 3,
          name: 'Third',
          order: 10
        }),
        createMockCategory({
          id: 1,
          name: 'First',
          order: 5
        }),
        createMockCategory({
          id: 2,
          name: 'Second',
          order: 7
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Third',
          order: 10,
          id: 3
        },
        {
          label: 'First',
          order: 5,
          id: 1
        },
        {
          label: 'Second',
          order: 7,
          id: 2
        }
      ]);
    });

    it('should handle categories with zero order', () => {
      const categories = [
        createMockCategory({
          id: 1,
          name: 'Zero Order',
          order: 0
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Zero Order',
          order: 0,
          id: 1
        }
      ]);
    });

    it('should handle categories with negative order', () => {
      const categories = [
        createMockCategory({
          id: 1,
          name: 'Negative Order',
          order: -1
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Negative Order',
          order: -1,
          id: 1
        }
      ]);
    });

    it('should handle categories with special characters in name', () => {
      const categories = [
        createMockCategory({
          id: 1,
          name: 'Café & Restaurants',
          order: 1
        }),
        createMockCategory({
          id: 2,
          name: 'Arts & Crafts',
          order: 2
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Café & Restaurants',
          order: 1,
          id: 1
        },
        {
          label: 'Arts & Crafts',
          order: 2,
          id: 2
        }
      ]);
    });

    it('should handle categories with very long names', () => {
      const longName = 'This is a very long category name that might be used in some cases';
      const categories = [
        createMockCategory({
          id: 1,
          name: longName,
          order: 1
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: longName,
          order: 1,
          id: 1
        }
      ]);
    });

    it('should extract only required properties', () => {
      const categories = [
        createMockCategory({
          id: 1,
          name: 'Test Category',
          order: 1,
          description: 'This should not be included',
          slug: 'this-should-not-be-included',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      expect(result).toEqual([
        {
          label: 'Test Category',
          order: 1,
          id: 1
        }
      ]);

      // Verify that unwanted properties are not included
      expect(result[0]).not.toHaveProperty('description');
      expect(result[0]).not.toHaveProperty('slug');
      expect(result[0]).not.toHaveProperty('createdAt');
      expect(result[0]).not.toHaveProperty('updatedAt');
    });

    it('should maintain array order (not sort)', () => {
      const categories = [
        createMockCategory({
          id: 5,
          name: 'Category E',
          order: 5
        }),
        createMockCategory({
          id: 2,
          name: 'Category B',
          order: 2
        }),
        createMockCategory({
          id: 8,
          name: 'Category H',
          order: 8
        }),
        createMockCategory({
          id: 1,
          name: 'Category A',
          order: 1
        })
      ];

      const result = mapCategoriesToNavItems(categories);

      // Should maintain input order, not sort by order or name
      expect(result.map(item => item.id)).toEqual([5, 2, 8, 1]);
    });
  });
});