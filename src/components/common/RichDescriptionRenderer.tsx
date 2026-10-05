import React from 'react';

interface RichDescriptionRendererProps {
  content?: string | null;
  className?: string;
}

export const RichDescriptionRenderer: React.FC<RichDescriptionRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Check if content has rich HTML markup (like <img, <p>, <div>, <h3>, <ul>, etc.)
  const hasHtmlMarkup = /<(?:img|p|div|h[1-6]|ul|ol|li|strong|em|b|i|br|span)\b[^>]*>/i.test(content);

  if (hasHtmlMarkup) {
    // Ensure any embedded markdown images inside HTML are also converted
    const parsedHtml = content.replace(
      /!\[(.*?)\]\((.+?)\)/g,
      '<img src="$2" alt="$1" class="w-full h-auto object-cover rounded-2xl my-4 block shadow-sm border border-slate-200" loading="lazy" />'
    );

    return (
      <div
        className={`rich-description-content w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere] leading-relaxed text-slate-700 space-y-3 px-5 sm:px-8 [&_img]:w-full [&_img]:h-auto [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:rounded-2xl [&_img]:my-4 [&_img]:block [&_img]:shadow-sm [&_img]:border [&_img]:border-slate-200/80 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-slate-900 [&_p]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: parsedHtml }}
      />
    );
  }

  // Split lines or paragraphs
  const paragraphs = content.split('\n');

  // Helper to test if a line or text is an image/gif URL or markdown image
  const renderParagraph = (text: string, idx: number) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }

    // Check for Markdown Image / GIF: ![alt](url)
    const mdImgRegex = /^!\[(.*?)\]\((.+?)\)$/i;
    const mdImgMatch = trimmed.match(mdImgRegex);
    if (mdImgMatch && mdImgMatch[2]?.trim()) {
      const alt = mdImgMatch[1] || 'Product demonstration';
      const src = mdImgMatch[2].trim();
      return (
        <div key={idx} className="my-4 overflow-hidden w-full max-w-none">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover block"
            loading="lazy"
            onError={(e) => {
              console.warn('Image load error:', src);
            }}
          />
          {alt && alt !== 'Product demonstration' && alt !== 'Demonstration Media' && alt !== 'Pasted Media' && (
            <p className="text-[11px] text-center text-slate-500 italic mt-1.5 px-5 sm:px-8">{alt}</p>
          )}
        </div>
      );
    }

    // Check for HTML img tag: <img src="..." alt="..." />
    const htmlImgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i;
    const htmlImgMatch = trimmed.match(htmlImgRegex);
    if (htmlImgMatch && htmlImgMatch[1]?.trim()) {
      const src = htmlImgMatch[1].trim();
      return (
        <div key={idx} className="my-4 overflow-hidden w-full max-w-none">
          <img
            src={src}
            alt="Product animation"
            className="w-full h-auto object-cover block"
            loading="lazy"
          />
        </div>
      );
    }

    // Check if line is purely a standalone GIF or Image URL
    const isStandaloneMedia = /^(https?:\/\/|\/uploads\/|\/assets\/|\/)[^\s]+(\.gif|\.png|\.jpg|\.jpeg|\.webp|\.svg|giphy\.com\/media|tenor\.com\/view)(\?[^\s]*)?$/i.test(trimmed);
    if (isStandaloneMedia) {
      return (
        <div key={idx} className="my-4 overflow-hidden w-full max-w-none">
          <img
            src={trimmed}
            alt="Demonstration Visual"
            className="w-full h-auto object-cover block"
            loading="lazy"
          />
        </div>
      );
    }

    // Check for Heading 3: ### Heading
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-1.5 px-5 sm:px-8 break-words [overflow-wrap:anywhere]">
          {trimmed.replace('### ', '')}
        </h4>
      );
    }

    // Check for Heading 2: ## Heading
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-base font-bold text-slate-900 mt-5 mb-2 font-serif px-5 sm:px-8 break-words [overflow-wrap:anywhere]">
          {trimmed.replace('## ', '')}
        </h3>
      );
    }

    // Check for Bullet points: * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.replace(/^[\*\-]\s+/, '');
      return (
        <li key={idx} className="ml-9 sm:ml-12 list-disc text-slate-700 leading-relaxed my-1 pr-5 sm:pr-8 break-words [overflow-wrap:anywhere]">
          {formatInlineStyles(bulletText)}
        </li>
      );
    }

    // Standard paragraph with inline styling
    return (
      <p key={idx} className="text-slate-700 leading-relaxed my-2 px-5 sm:px-8 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
        {formatInlineStyles(trimmed)}
      </p>
    );
  };

  // Helper to format inline bold **text** or inline images
  const formatInlineStyles = (text: string): React.ReactNode => {
    // Check if there are markdown images or bold tags embedded in the sentence
    const parts = text.split(/(\*\*.*?\*\*|!\[.*?\]\(.+?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 break-words">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/!\[(.*?)\]\((.*?)\)/);
        if (match && match[2]?.trim()) {
          return (
            <span key={i} className="block my-4 overflow-hidden w-full max-w-none">
              <img src={match[2].trim()} alt={match[1] || ''} className="w-full h-auto object-cover block" />
            </span>
          );
        }
      }
      return <span key={i} className="break-words [overflow-wrap:anywhere]">{part}</span>;
    });
  };

  return (
    <div className={`space-y-1 w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere] ${className}`}>
      {paragraphs.map((p, idx) => renderParagraph(p, idx))}
    </div>
  );
};
