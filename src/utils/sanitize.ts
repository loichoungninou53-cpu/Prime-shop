import DOMPurify from 'dompurify';

/**
 * Sanitization stricte du HTML des descriptions produit.
 * - Liste blanche de balises/attributs (pas de script, iframe, événements, styles arbitraires).
 * - Les liens s'ouvrent dans un nouvel onglet avec rel="noopener noreferrer".
 * - Seules les URL http(s), mailto, tel et les data:image (images compressées) sont acceptées.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'a', 'ul', 'ol', 'li', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col',
  'blockquote', 'hr', 'span', 'div', 'sup', 'sub', 'code', 'pre', 'figure', 'figcaption',
];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan', 'style', 'class'];
const SAFE_URL = /^(?:https?:|mailto:|tel:|data:image\/(?:png|jpe?g|gif|webp);base64,)/i;

let hooked = false;
const installHooks = () => {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    // Styles : on ne garde que l'alignement du texte (le reste vient de Word/Docs et casse la mise en page)
    if (data.attrName === 'style') {
      const m = /text-align\s*:\s*(left|center|right|justify)/i.exec(data.attrValue);
      data.attrValue = m ? `text-align: ${m[1].toLowerCase()}` : '';
      if (!data.attrValue) data.keepAttr = false;
    }
    if (data.attrName === 'class') {
      data.keepAttr = false;
    }
    if ((data.attrName === 'href' || data.attrName === 'src') && !SAFE_URL.test(data.attrValue.trim())) {
      data.keepAttr = false;
    }
  });
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
    }
  });
};

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  installHooks();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [...ALLOWED_ATTR, 'loading', 'decoding'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link'],
    KEEP_CONTENT: true,
  });
}

/** Nettoyage spécifique au collage depuis Word / Google Docs / ChatGPT : retire les commentaires, balises Office, spans vides. */
export function cleanPastedHtml(html: string): string {
  let out = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<\/?(xml|meta|link|style|script)[^>]*>[\s\S]*?(<\/\1>|$)/gi, '')
    .replace(/<span[^>]*>\s*<\/span>/gi, '')
    .replace(/&nbsp;/g, ' ')
    // Word : "MsoListParagraph" avec puces en texte → on garde le texte, Tiptap recrée la liste si besoin
    .replace(/<p[^>]*class="?MsoListParagraph[^>]*>\s*(?:<span[^>]*>)?\s*[•·\-–▪●]\s*(?:<\/span>)?/gi, '<p>• ');
  return sanitizeHtml(out);
}
