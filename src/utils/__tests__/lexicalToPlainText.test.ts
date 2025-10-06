import { lexicalToPlainText } from '../lexicalToPlainText';

describe('lexicalToPlainText', () => {
  describe('String input handling', () => {
    it('should clean HTML tags from string input', () => {
      const htmlString = '<p>Hello <strong>world</strong></p>';
      const result = lexicalToPlainText(htmlString);
      expect(result).toBe('Hello world');
    });

    it('should normalize multiple spaces', () => {
      const htmlString = '<p>Hello    world</p><br><div>Test</div>';
      const result = lexicalToPlainText(htmlString);
      expect(result).toBe('Hello world Test');
    });

    it('should limit to 160 characters', () => {
      const longString = '<p>' + 'A'.repeat(200) + '</p>';
      const result = lexicalToPlainText(longString);
      expect(result.length).toBeLessThanOrEqual(160);
      expect(result).toBe('A'.repeat(160));
    });

    it('should handle empty string', () => {
      const result = lexicalToPlainText('');
      expect(result).toBe('');
    });
  });

  describe('Null/undefined handling', () => {
    it('should return empty string for null', () => {
      const result = lexicalToPlainText(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = lexicalToPlainText(undefined);
      expect(result).toBe('');
    });
  });

  describe('Lexical JSON processing', () => {
    it('should return empty string for invalid lexical structure', () => {
      expect(lexicalToPlainText({})).toBe('');
      expect(lexicalToPlainText({ root: {} })).toBe('');
      expect(lexicalToPlainText({ root: { children: null } })).toBe('');
    });

    it('should extract text from simple paragraph', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Simple paragraph text'
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Simple paragraph text');
    });

    it('should extract text from headings', () => {
      const lexicalContent = {
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
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Main Title Subtitle');
    });

    it('should extract text from lists', () => {
      const lexicalContent = {
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
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('First item Second item');
    });

    it('should extract text from quotes', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'quote',
              children: [
                {
                  type: 'text',
                  text: 'This is a quoted text'
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('This is a quoted text');
    });

    it('should extract text from links', () => {
      const lexicalContent = {
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
                      text: 'Link text'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Link text');
    });

    it('should handle upload nodes with alt text', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'upload',
              value: {
                id: 'image123',
                alt: 'Beautiful landscape'
              }
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('[Beautiful landscape]');
    });

    it('should handle upload nodes without alt text', () => {
      const lexicalContent = {
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
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('');
    });

    it('should handle horizontal rules', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Before rule'
                }
              ]
            },
            {
              type: 'horizontalrule'
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'After rule'
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Before rule After rule');
    });

    it('should handle code blocks', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'code',
              children: [
                {
                  type: 'text',
                  text: 'const x = 10;'
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('const x = 10;');
    });

    it('should handle unknown node types gracefully', () => {
      const lexicalContent = {
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
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Some text');
    });

    it('should add spaces between paragraphs and headings', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'First paragraph'
                }
              ]
            },
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  text: 'Heading'
                }
              ]
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Second paragraph'
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('First paragraph Heading Second paragraph');
    });

    it('should normalize multiple spaces', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Text   with    multiple     spaces'
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Text with multiple spaces');
    });

    it('should truncate text at 160 characters and cut at word boundary', () => {
      const longText = 'This is a very long text that should be truncated at exactly 160 characters but it should cut at the last complete word to avoid breaking words in the middle';
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: longText
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result.length).toBeLessThanOrEqual(163); // 160 + "..."
      expect(result.endsWith('...')).toBe(true);
      expect(result).not.toMatch(/\w\.\.\./); // Should not cut in middle of word
    });

    it('should handle text exactly at 160 characters', () => {
      const exactText = 'A'.repeat(160);
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: exactText
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe(exactText);
      expect(result.length).toBe(160);
    });

    it('should handle complex nested structure', () => {
      const lexicalContent = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Introduction: '
                },
                {
                  type: 'link',
                  url: '/article',
                  children: [
                    {
                      type: 'text',
                      text: 'read more'
                    }
                  ]
                }
              ]
            },
            {
              type: 'list',
              children: [
                {
                  type: 'listitem',
                  children: [
                    {
                      type: 'text',
                      text: 'Point one'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      const result = lexicalToPlainText(lexicalContent);
      expect(result).toBe('Introduction: read more Point one');
    });
  });
});