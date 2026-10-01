import React, { useMemo } from 'react';
import { descriptionToSafeHtml } from '../utils/legacyDescription';

interface RichDescriptionProps {
  content?: string;
  className?: string;
}

/**
 * Rendu de la fiche produit : un seul document fluide (titres, paragraphes, listes,
 * liens, images, tableaux) — jamais une carte par paragraphe.
 * Compatible avec les anciennes descriptions texte/markdown ET le nouvel éditeur HTML.
 * Le HTML est TOUJOURS passé par DOMPurify avant affichage.
 */
export const RichDescriptionRenderer: React.FC<RichDescriptionProps> = ({ content = '', className = '' }) => {
  const html = useMemo(() => descriptionToSafeHtml(content), [content]);

  if (!html) {
    return (
      <p className={`text-slate-500 italic text-sm ${className}`}>
        Produit certifié et garanti authentique par Prime Shop.
      </p>
    );
  }

  return <div className={`prime-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
};
