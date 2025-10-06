import { formatDate, renderLexicalToHTML } from '../Formatting';

// Mock moment pour des tests déterministes
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  return (date?: string) => {
    if (date === '2023-12-15T10:30:00.000Z') {
      return actualMoment('2023-12-15T10:30:00.000Z');
    }
    if (date === 'invalid-date') {
      return actualMoment('invalid-date');
    }
    return actualMoment(date);
  };
});

describe('Formatting utilities', () => {
  describe('formatDate', () => {
    it('should format a valid ISO date string correctly', () => {
      const result = formatDate('2023-12-15T10:30:00.000Z');
      expect(result).toBe('15/12/2023');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2023-01-01');
      expect(result).toBe('01/01/2023');
    });

    it('should handle edge case dates', () => {
      const result = formatDate('2023-02-28T23:59:59.999Z');
      expect(result).toBe('28/02/2023');
    });
  });

  describe('renderLexicalToHTML', () => {
    it('should return empty string for null or undefined input', () => {
      expect(renderLexicalToHTML(null)).toBe('');
      expect(renderLexicalToHTML(undefined)).toBe('');
    });

    it('should return empty string for invalid lexical data', () => {
      expect(renderLexicalToHTML({})).toBe('');
      expect(renderLexicalToHTML({ root: {} })).toBe('');
      expect(renderLexicalToHTML({ root: { children: null } })).toBe('');
    });

    it('should render empty paragraph', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: []
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p>&nbsp;</p>');
    });

    it('should render paragraph with text', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Hello world'
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p>Hello world</p>');
    });

    it('should render headings with correct tags', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'heading',
              tag: 'h1',
              children: [
                {
                  type: 'text',
                  text: 'Main Title'
                }
              ]
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: 'Subtitle'
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<h1>Main Title</h1><h2>Subtitle</h2>');
    });

    it('should render heading with default h2 tag when no tag specified', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  text: 'Default Heading'
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<h2>Default Heading</h2>');
    });

    it('should render bullet list', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'list',
              listType: 'bullet',
              children: [
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'First item'
                    }
                  ]
                },
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'Second item'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<ul><li>First item</li><li>Second item</li></ul>');
    });

    it('should render numbered list', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'list',
              listType: 'number',
              children: [
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'First item'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<ol><li>First item</li></ol>');
    });

    it('should render blockquote', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'quote',
              children: [
                {
                  type: 'text',
                  text: 'This is a quote'
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<blockquote>This is a quote</blockquote>');
    });

    it('should render text with formatting (bold)', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Bold text',
                  format: 1 // Bold flag
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p><strong>Bold text</strong></p>');
    });

    it('should render text with formatting (italic)', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Italic text',
                  format: 2 // Italic flag
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p><em>Italic text</em></p>');
    });

    it('should render text with multiple formats', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Bold and italic',
                  format: 3 // Bold (1) + Italic (2) = 3
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p><em><strong>Bold and italic</strong></em></p>');
    });

    it('should render links', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'https://example.com',
                  children: [
                    {
                      type: 'text',
                      text: 'Visit example'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p><a href="https://example.com">Visit example</a></p>');
    });

    it('should render upload nodes with placeholder', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'upload',
              value: {
                id: 'image123'
              }
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<div class="image-placeholder">[Image: image123]</div>');
    });

    it('should render upload nodes without value', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'upload'
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<div class="image-placeholder">[Image: Non trouvée]</div>');
    });

    it('should render horizontal rule', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'horizontalrule'
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<hr>');
    });

    it('should handle unknown node types gracefully', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'unknown-type',
              children: [
                {
                  type: 'text',
                  text: 'Some text'
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('Some text');
    });

    it('should handle complex nested structure', () => {
      const lexicalData = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Regular text '
                },
                {
                  type: 'text',
                  text: 'bold text',
                  format: 1
                },
                {
                  type: 'text',
                  text: ' and '
                },
                {
                  type: 'link',
                  url: '/article/test',
                  children: [
                    {
                      type: 'text',
                      text: 'a link'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      const result = renderLexicalToHTML(lexicalData);
      expect(result).toBe('<p>Regular text <strong>bold text</strong> and <a href="/article/test">a link</a></p>');
    });
  });
});