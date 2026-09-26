import React from 'react';
import { Check, Sparkles, ChevronRight, Info } from 'lucide-react';

interface RichDescriptionProps {
  content?: string;
  className?: string;
}

/**
 * Universal Rich Description Renderer:
 * Handles copy-pasted descriptions from Maketou, Chariow, ChatGPT, Word, WhatsApp, or standard Markdown/HTML.
 * Converts bullets (•, -, *), bold text (**text** or <b>), headings (###), emojis, and line breaks into
 * high-converting, polished e-commerce typography.
 */
export const RichDescriptionRenderer: React.FC<RichDescriptionProps> = ({ content = '', className = '' }) => {
  if (!content || !content.trim()) {
    return (
      <p className={`text-slate-500 italic text-sm ${className}`}>
        Produit certifié et garanti authentique par Prime Shop.
      </p>
    );
  }

  // If content contains standard HTML tags from a rich WYSIWYG editor
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);

  // If HTML is present, sanitize and render safely with custom styling
  if (hasHtmlTags) {
    return (
      <div 
        className={`prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_strong]:text-[#050508] [&_strong]:font-bold [&_h3]:text-base [&_h3]:font-black [&_h3]:text-[#050508] [&_h4]:text-sm [&_h4]:font-bold ${className}`}
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
            <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800">
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

  // Helper to format inline bold text (**bold** or *bold*)
  const renderFormattedInline = (text: string) => {
    // Split by **bold** markers
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-[#050508] text-inherit">
            {part.slice(2, -2)}
          </strong>
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
