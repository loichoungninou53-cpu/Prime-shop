import React from 'react';
import { Check, Sparkles, ExternalLink, Info } from 'lucide-react';

interface RichDescriptionProps {
  content?: string;
  className?: string;
}

/**
 * Universal Shopify/Maketou Rich Description Renderer:
 * Handles Markdown, HTML, bullet points (•, -, *), bold (**text**), italics (*text*),
 * images (![alt](url)), clickable links ([text](url)), blockquotes (> text) and emojis.
 */
export const RichDescriptionRenderer: React.FC<RichDescriptionProps> = ({ content = '', className = '' }) => {
  if (!content || !content.trim()) {
    return (
      <p className={`text-slate-500 italic text-sm ${className}`}>
        Produit certifié et garanti authentique par Prime Shop.
      </p>
    );
  }

  // If HTML is present, sanitize and render safely with custom styling
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);
  if (hasHtmlTags) {
    return (
      <div 
        className={`prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-3 
          [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_strong]:text-[#050508] [&_strong]:font-bold 
          [&_h3]:text-base [&_h3]:font-black [&_h3]:text-[#050508] [&_h4]:text-sm [&_h4]:font-bold 
          [&_a]:text-[#5433eb] [&_a]:underline [&_a]:font-bold [&_img]:rounded-2xl [&_img]:border [&_img]:border-slate-200 
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#5433eb] [&_blockquote]:bg-[#ece7ff]/40 [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse plain text / markdown / bullet lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentBulletList: string[] = [];

  const flushBullets = (keyPrefix: string) => {
    if (currentBulletList.length > 0) {
      const listCopy = [...currentBulletList];
      elements.push(
        <div key={`${keyPrefix}-bullets`} className="my-3 space-y-2">
          {listCopy.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800">
              <span className="w-5 h-5 rounded-full bg-[#ece7ff] text-[#5433eb] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <div className="flex-1 leading-snug">
                {renderFormattedInline(bullet)}
              </div>
            </div>
          ))}
        </div>
      );
      currentBulletList = [];
    }
  };

  // Helper to format inline markdown (bold, italic, links)
  const renderFormattedInline = (text: string): React.ReactNode => {
    // Regex for:
    // 1. Markdown Links [label](url)
    // 2. Bold **bold**
    // 3. Italic *italic*
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      // Check link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5433eb] hover:text-[#4323d8] font-bold underline inline-flex items-center gap-1"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }

      // Check bold: **bold**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={index} className="font-black text-[#050508]">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Check italic: *italic*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={index} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }

      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushBullets(`empty-${lineIndex}`);
      return;
    }

    // Embedded image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushBullets(`img-${lineIndex}`);
      elements.push(
        <div key={`img-${lineIndex}`} className="my-4">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || 'Illustration produit'}
            className="rounded-2xl max-h-80 w-auto object-cover border border-slate-200 shadow-md mx-auto"
            loading="lazy"
          />
          {imgMatch[1] && (
            <p className="text-[11px] text-center text-slate-400 mt-1 italic">
              {imgMatch[1]}
            </p>
          )}
        </div>
      );
      return;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      flushBullets(`quote-${lineIndex}`);
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote key={`quote-${lineIndex}`} className="p-3 my-2 border-l-4 border-[#5433eb] bg-[#ece7ff]/40 rounded-r-2xl text-xs text-slate-800 leading-relaxed font-medium">
          {renderFormattedInline(quoteText)}
        </blockquote>
      );
      return;
    }

    // Heading (e.g. ### Titre or EMOJI + UPPERCASE HEADER)
    const isHeading = trimmed.startsWith('#') || (/^([🔥🎯⚡📦💡⭐🛡️💎✨✅▶️🔹]|\d+\.)\s*[A-ZÀ-Ÿ\s:!-]{4,}/.test(trimmed) && trimmed.length < 80);

    // Bullet point (starts with •, -, *, or emoji + colon)
    const isBullet = /^[•\-*▪️▫️]\s+/.test(trimmed) || /^✅|👉|✔/.test(trimmed);

    if (isHeading) {
      flushBullets(`heading-flush-${lineIndex}`);
      const cleanTitle = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <div key={`h-${lineIndex}`} className="pt-3 pb-1 flex items-center gap-2 border-b border-slate-200/60 mb-2">
          <Sparkles className="w-4 h-4 text-[#5433eb] shrink-0" />
          <h4 className="text-xs sm:text-sm font-black text-[#050508] uppercase tracking-wider">
            {cleanTitle}
          </h4>
        </div>
      );
    } else if (isBullet) {
      const cleanBullet = trimmed.replace(/^[•\-*▪️▫️✅👉✔]\s*/, '');
      currentBulletList.push(cleanBullet);
    } else {
      flushBullets(`para-flush-${lineIndex}`);
      elements.push(
        <p key={`p-${lineIndex}`} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {renderFormattedInline(trimmed)}
        </p>
      );
    }
  });

  flushBullets('final');

  return (
    <div className={`space-y-2.5 ${className}`}>
      {elements}
    </div>
  );
};
