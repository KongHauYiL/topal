import { ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface BrowserBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export function BrowserBar({
  currentUrl,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onHome,
  canGoBack,
  canGoForward
}: BrowserBarProps) {
  const [inputUrl, setInputUrl] = useState(currentUrl);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNavigate(inputUrl);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <div className="flex gap-1">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className="p-1.5 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onForward}
            disabled={!canGoForward}
            className="p-1.5 sm:p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onHome}
            className="p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-50 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            placeholder="Enter a Topal domain..."
          />
        </form>
      </div>
    </div>
  );
}
