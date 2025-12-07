import { Globe, Trash2, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SiteCardProps {
  title: string;
  domain: string;
  htmlContent: string;
  createdAt: string;
  onNavigate: () => void;
  onDelete: () => void;
}

export function SiteCard({
  title,
  domain,
  htmlContent,
  createdAt,
  onNavigate,
  onDelete
}: SiteCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setPreviewLoaded(true);
      }
    }
  }, [htmlContent]);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
      <div className="relative bg-gray-900 h-48 overflow-hidden">
        {!previewLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="w-12 h-12 text-gray-700" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
          style={{ width: '200%', height: '200%' }}
          sandbox="allow-same-origin"
          title={`Preview of ${title}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <button
          onClick={onNavigate}
          className="text-blue-400 hover:text-blue-300 text-sm mb-3 flex items-center gap-1 group/link"
        >
          <span className="truncate">{domain}</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
        </button>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>

          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-950 rounded-lg transition-colors"
            title="Delete site"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
