interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  url?: string;
  tag?: string;
  listType?: 'bullet' | 'number';
  value?: {
    id?: string;
    url?: string;
    alt?: string;
  };
}

interface LexicalContent {
  root: {
    children: LexicalNode[];
    direction?: string;
    format?: string;
    indent?: number;
    type: string;
    version: number;
  };
}

/**
 * Convertit le contenu Lexical en texte brut pour les métadonnées
 * @param content - Contenu Lexical ou string HTML
 * @returns Texte brut sans balises
 */
export function lexicalToPlainText(content: any): string {
  // Si le contenu est une string (HTML), la nettoyer
  if (typeof content === 'string') {
    return content
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim()
      .substring(0, 160); // Limiter à 160 caractères pour les métadonnées
  }

  // Si le contenu est null, undefined ou vide
  if (!content) {
    return '';
  }

  // Traitement du contenu Lexical JSON
  const lexicalContent = content as LexicalContent;
  
  if (!lexicalContent?.root?.children) {
    return '';
  }

  /**
   * Extrait le texte d'un nœud Lexical récursivement
   * @param {LexicalNode} node - Nœud Lexical à traiter
   * @returns {string} Texte extrait du nœud
   */
  const extractText = (node: LexicalNode): string => {
    let text = '';

    switch (node.type) {
      case 'text':
        return node.text || '';

      case 'paragraph':
      case 'heading':
      case 'list':
      case 'listitem':
      case 'quote':
      case 'link':
        if (node.children && Array.isArray(node.children)) {
          text = node.children.map(child => extractText(child)).join('');
        }
        // Ajouter un espace après les paragraphes et titres pour séparer
        if (node.type === 'paragraph' || node.type === 'heading') {
          text += ' ';
        }
        return text;

      case 'upload':
        // Pour les images, retourner le texte alt s'il existe
        return node.value?.alt ? `[${node.value.alt}] ` : '';

      case 'horizontalrule':
        return ' ';

      case 'code':
        // Pour les blocs de code, extraire le texte sans formatage
        if (node.children && Array.isArray(node.children)) {
          return node.children.map(child => extractText(child)).join('');
        }
        return '';

      default:
        // Type non géré, essayer de traiter les enfants
        if (node.children && Array.isArray(node.children)) {
          return node.children.map(child => extractText(child)).join('');
        }
        return '';
    }
  };

  const plainText = lexicalContent.root.children
    .map(node => extractText(node))
    .join('')
    .replace(/\s+/g, ' ') // Normaliser les espaces multiples
    .trim();

  // Limiter à 160 caractères pour les métadonnées et s'assurer de couper à un mot entier
  if (plainText.length <= 160) {
    return plainText;
  }

  const truncated = plainText.substring(0, 160);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}