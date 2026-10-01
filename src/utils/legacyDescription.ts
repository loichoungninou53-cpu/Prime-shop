import { sanitizeHtml } from './sanitize';

/**
 * Compatibilité ascendante : les anciennes descriptions étaient en texte / markdown
 * (puces "•", "-", "*", **gras**, *italique*, [lien](url), ![img](url), "> citation", "## titre").
 * Cette fonction les convertit en HTML propre sans jamais toucher aux données en base.
 */
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** URL d'image exploitable (on ignore les gabarits non remplis du type "https://.../...") */
const isUsableImageUrl = (u: string) => /^(https?:\/\/|data:image\/)/i.test(u) && !/\.{3}/.test(u) && u.length > 12;

const inline = (text: string): string => {
  let t = escapeHtml(text);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => (isUsableImageUrl(url) ? `<img src="${url}" alt="${alt}" />` : ''));
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return t;
};

export const isHtmlDescription = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content);

export function legacyTextToHtml(content: string): string {
  const lines = content.split(/\r?\n/);
  const out: string[] = [];
  let list: string[] = [];
  let ordered = false;
  const flush = () => {
    if (list.length) {
      out.push(`<${ordered ? 'ol' : 'ul'}>${list.map((l) => `<li>${l}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = Math.min(h[1].length + 1, 4); // "# " devient h2 pour garder le h1 au nom produit
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      out.push('<hr />');
      continue;
    }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) {
      flush();
      out.push(`<blockquote><p>${inline(q[1])}</p></blockquote>`);
      continue;
    }
    const b = /^(?:[•·▪●\-\*✅✔️☑️➡️👉]|\d+[.)])\s+(.*)$/.exec(line);
    if (b) {
      const isOrdered = /^\d/.test(line);
      if (list.length && isOrdered !== ordered) flush();
      ordered = isOrdered;
      list.push(inline(b[1]));
      continue;
    }
    const onlyImg = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line);
    if (onlyImg) {
      flush();
      if (isUsableImageUrl(onlyImg[2])) out.push(`<img src="${escapeHtml(onlyImg[2])}" alt="${escapeHtml(onlyImg[1])}" />`);
      continue;
    }
    flush();
    out.push(`<p>${inline(line)}</p>`);
  }
  flush();
  return out.join('');
}

/** Point d'entrée unique : renvoie toujours du HTML sûr, quel que soit le format d'origine. */
export function descriptionToSafeHtml(content?: string): string {
  if (!content || !content.trim()) return '';
  const html = isHtmlDescription(content) ? content : legacyTextToHtml(content);
  return sanitizeHtml(html);
}
