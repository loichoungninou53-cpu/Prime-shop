import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered, Link2, Unlink, Image as ImageIcon, Table as TableIcon, Minus, Quote,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Smile, Eye, Code2, Trash2,
  Plus, Columns3, Rows3,
} from 'lucide-react';
import { cleanPastedHtml, sanitizeHtml } from '../utils/sanitize';
import { descriptionToSafeHtml, isHtmlDescription } from '../utils/legacyDescription';
import { RichDescriptionRenderer } from './RichDescriptionRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const EMOJIS = ['✅', '⭐', '🔥', '🎁', '🚚', '💎', '⚡', '❤️', '👉', '📦', '🛡️', '💰', '📱', '🎧', '⌚', '✨', '🏆', '📍', '☎️', '🇧🇯'];

/** Compression d'une image insérée dans la description (max 1000 px, JPEG 80 %). */
const compressForDescription = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const MAX = 1000;
      const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`h-8 min-w-8 px-1.5 rounded-lg flex items-center justify-center gap-1 text-[11px] font-semibold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
      active ? 'bg-[#5433eb] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />;

/**
 * Éditeur de description produit type Shopify.
 * - Collage depuis Word / Google Docs / ChatGPT : nettoyé et sanitizé.
 * - Sortie : HTML sanitizé (stocké tel quel dans `products.description`).
 * - Les anciennes descriptions texte/markdown sont converties à l'ouverture, sans toucher à la base.
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const [mode, setMode] = useState<'edit' | 'preview' | 'html'>('edit');
  const [showEmojis, setShowEmojis] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef<string>('');

  const initialHtml = isHtmlDescription(value || '') ? sanitizeHtml(value) : descriptionToSafeHtml(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { loading: 'lazy' } }),
      TableKit.configure({ table: { resizable: false, HTMLAttributes: {} } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder || 'Écrivez ou collez ici votre description (ChatGPT, Word, Google Docs…).',
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: 'prime-prose', spellcheck: 'true' },
      transformPastedHTML: (html) => cleanPastedHtml(html),
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? '' : sanitizeHtml(ed.getHTML());
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // Si la valeur est remise à zéro de l'extérieur (ouverture d'un autre produit), on recharge l'éditeur.
  useEffect(() => {
    if (!editor) return;
    if ((value || '') === lastEmitted.current) return;
    const next = isHtmlDescription(value || '') ? sanitizeHtml(value) : descriptionToSafeHtml(value);
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next || '', { emitUpdate: false });
      lastEmitted.current = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Adresse du lien (https://…)', previous || 'https://');
    if (url === null) return;
    if (url.trim() === '' || url.trim() === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const safe = /^(https?:|mailto:|tel:)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: safe }).run();
  }, [editor]);

  const insertImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Adresse de l\'image (https://…)');
    if (!url || !/^https?:\/\//i.test(url.trim())) return;
    const alt = window.prompt('Texte alternatif (description courte de l\'image)') || '';
    editor.chain().focus().setImage({ src: url.trim(), alt }).run();
  }, [editor]);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Ce fichier n\'est pas une image.');
      return;
    }
    try {
      const dataUrl = await compressForDescription(file);
      editor.chain().focus().setImage({ src: dataUrl, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } catch {
      window.alert('Impossible de lire cette image.');
    }
  };

  const openHtmlMode = () => {
    if (!editor) return;
    setHtmlDraft(editor.getHTML());
    setMode('html');
  };
  const applyHtmlDraft = () => {
    if (!editor) return;
    const safe = sanitizeHtml(htmlDraft);
    editor.commands.setContent(safe, { emitUpdate: true });
    setMode('edit');
  };

  if (!editor) return null;

  const inTable = editor.isActive('table');

  return (
    <div className="prime-editor rounded-2xl border border-slate-300 bg-white overflow-hidden focus-within:border-[#5433eb] transition">
      {/* Barre d'outils */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50 border-b border-slate-200">
        <ToolbarButton title="Annuler (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Rétablir (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Paragraphe" active={editor.isActive('paragraph') && !editor.isActive('heading')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Titre principal (H1)" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Sous-titre (H2)" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Petit titre (H3)" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Gras (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Italique (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Souligné (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Barré" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Aligner à gauche" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Centrer" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Aligner à droite" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Justifier" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Citation / encadré" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Séparateur horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton title="Ajouter / modifier un lien" active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton title="Retirer le lien" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
        )}
        <ToolbarButton title="Insérer une photo depuis l'appareil" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Photo</span>
        </ToolbarButton>
        <ToolbarButton title="Insérer une image par adresse (URL)" onClick={insertImageFromUrl}>
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">URL</span>
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
        <ToolbarButton
          title="Insérer un tableau (3 colonnes)"
          active={inTable}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <div className="relative">
          <ToolbarButton title="Emojis" active={showEmojis} onClick={() => setShowEmojis((v) => !v)}>
            <Smile className="w-4 h-4" />
          </ToolbarButton>
          {showEmojis && (
            <div className="absolute left-0 top-9 z-20 grid grid-cols-5 gap-1 p-2 rounded-xl bg-white border border-slate-200 shadow-xl w-52">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().insertContent(e + ' ').run();
                    setShowEmojis(false);
                  }}
                  className="h-8 rounded-lg hover:bg-slate-100 text-lg cursor-pointer"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton title="Aperçu client" active={mode === 'preview'} onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Aperçu</span>
          </ToolbarButton>
          <ToolbarButton title="Code HTML (avancé)" active={mode === 'html'} onClick={() => (mode === 'html' ? setMode('edit') : openHtmlMode())}>
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Outils de tableau (visibles uniquement dans un tableau) */}
      {inTable && mode === 'edit' && (
        <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 bg-[#f6f4ff] border-b border-[#5433eb]/15 text-[11px]">
          <span className="px-1.5 font-black text-[#5433eb] uppercase tracking-wide">Tableau</span>
          <ToolbarButton title="Ajouter une colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Columns3 className="w-3.5 h-3.5" /><Plus className="w-3 h-3" />
          </ToolbarButton>
          <ToolbarButton title="Supprimer la colonne" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Columns3 className="w-3.5 h-3.5" /><Minus className="w-3 h-3" />
          </ToolbarButton>
          <ToolbarButton title="Ajouter une ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Rows3 className="w-3.5 h-3.5" /><Plus className="w-3 h-3" />
          </ToolbarButton>
          <ToolbarButton title="Supprimer la ligne" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Rows3 className="w-3.5 h-3.5" /><Minus className="w-3 h-3" />
          </ToolbarButton>
          <ToolbarButton title="Ligne d'en-tête" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
            En-tête
          </ToolbarButton>
          <ToolbarButton title="Supprimer le tableau" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          </ToolbarButton>
        </div>
      )}

      {/* Zone de contenu */}
      {mode === 'edit' && (
        <div className="max-h-[60vh] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      )}
      {mode === 'preview' && (
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto bg-white">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#5433eb] mb-3">Aperçu tel que le client le verra</p>
          <RichDescriptionRenderer content={editor.getHTML()} />
        </div>
      )}
      {mode === 'html' && (
        <div className="p-3 space-y-2">
          <textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-[#5433eb]"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMode('edit')} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">Annuler</button>
            <button type="button" onClick={applyHtmlDraft} className="px-3 py-1.5 rounded-lg bg-[#5433eb] text-white text-xs font-bold cursor-pointer">Appliquer le HTML</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500">
        <span>Collez directement depuis ChatGPT, Word ou Google Docs : la mise en forme est conservée et nettoyée.</span>
        <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} car.</span>
      </div>
    </div>
  );
};
