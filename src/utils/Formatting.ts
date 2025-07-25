import moment from "moment";

export const formatDate = (dateString: string) => {
  return moment(dateString).format("DD/MM/YYYY");
};

/**
 * Convertit un objet Lexical en HTML
 * @param lexicalData - Données Lexical
 * @returns HTML string
 */
export const renderLexicalToHTML = (lexicalData: any): string => {
  if (!lexicalData || !lexicalData.root || !lexicalData.root.children) {
    return ''
  }

  return processLexicalChildren(lexicalData.root.children)
}

function processLexicalChildren(children: any[]): string {
  let html = ''

  for (const child of children) {
    html += processLexicalNode(child)
  }

  return html
}

function processLexicalNode(node: any): string {
  switch (node.type) {
    case 'paragraph':
      if (!node.children || node.children.length === 0) {
        return '<p>&nbsp;</p>'
      }
      return `<p>${processLexicalChildren(node.children)}</p>`

    case 'heading':
      const tag = node.tag || 'h2'
      return `<${tag}>${processLexicalChildren(node.children)}</${tag}>`

    case 'list':
      const listTag = node.listType === 'bullet' ? 'ul' : 'ol'
      return `<${listTag}>${processLexicalChildren(node.children)}</${listTag}>`

    case 'listitem':
      return `<li>${processLexicalChildren(node.children)}</li>`

    case 'quote':
      return `<blockquote>${processLexicalChildren(node.children)}</blockquote>`

    case 'text':
      let text = node.text || ''
      
      // Appliquer les formats
      if (node.format & 1) text = `<strong>${text}</strong>` // Bold
      if (node.format & 2) text = `<em>${text}</em>` // Italic
      if (node.format & 4) text = `<s>${text}</s>` // Strikethrough
      if (node.format & 8) text = `<u>${text}</u>` // Underline
      if (node.format & 16) text = `<code>${text}</code>` // Code
      
      return text

    case 'link':
      const url = node.url || '#'
      return `<a href="${url}">${processLexicalChildren(node.children)}</a>`

    case 'upload':
      // Pour les uploads (images), on peut afficher un placeholder
      // ou récupérer l'URL de l'image depuis Payload
      return `<div class="image-placeholder">[Image: ${node.value?.id || 'Non trouvée'}]</div>`

    case 'horizontalrule':
      return '<hr>'

    default:
      // Type non géré, on essaie de traiter les enfants
      if (node.children && Array.isArray(node.children)) {
        return processLexicalChildren(node.children)
      }
      return ''
  }
}
