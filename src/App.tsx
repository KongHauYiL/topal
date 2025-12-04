import { useState, useEffect } from 'react';
import { BrowserBar } from './components/BrowserBar';
import { SiteRenderer } from './components/SiteRenderer';
import { DeployCloud } from './components/DeployCloud';
import { useBrowserHistory } from './hooks/useBrowserHistory';
import { supabase, TopalSite } from './lib/supabase';
import { extractDomainAndTLD } from './lib/tlds';
import { AlertCircle } from 'lucide-react';

const HOME_URL = 'deploy.core';

function App() {
  const {
    currentUrl,
    navigate,
    goBack,
    goForward,
    refresh,
    canGoBack,
    canGoForward
  } = useBrowserHistory(HOME_URL);

  const [currentSite, setCurrentSite] = useState<TopalSite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  useEffect(() => {
    loadSite(currentUrl);
  }, [currentUrl]);

  const loadSite = async (url: string) => {
    setError('');

    if (url === HOME_URL) {
      setCurrentSite(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('topal_sites')
        .select('*')
        .eq('full_domain', url)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError(`Site not found: ${url}`);
        setCurrentSite(null);
      } else {
        setCurrentSite(data);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load site');
      setCurrentSite(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (url: string) => {
    let normalizedUrl = url.trim().toLowerCase();

    if (!normalizedUrl) return;

    if (!normalizedUrl.includes('.')) {
      normalizedUrl = `${normalizedUrl}.topal`;
    }

    const parsed = extractDomainAndTLD(normalizedUrl);
    if (parsed) {
      normalizedUrl = `${parsed.domain}${parsed.tld}`;
    }

    if (normalizedUrl === currentUrl) {
      refresh();
      loadSite(currentUrl);
    } else {
      navigate(normalizedUrl);
    }
  };

  const handleHome = () => {
    navigate(HOME_URL);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <BrowserBar
        currentUrl={currentUrl}
        onNavigate={handleNavigate}
        onBack={goBack}
        onForward={goForward}
        onRefresh={() => loadSite(currentUrl)}
        onHome={handleHome}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />

      <div className="flex-1 overflow-auto bg-gray-950">
        {currentUrl === HOME_URL ? (
          <DeployCloud onNavigate={handleNavigate} />
        ) : loading ? (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-300">Loading {currentUrl}...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center bg-gray-900 p-4">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Unable to Load Site
              </h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={handleHome}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Deploy Core
              </button>
            </div>
          </div>
        ) : currentSite ? (
          <SiteRenderer key={currentSite.id} htmlContent={currentSite.html_content} />
        ) : null}
      </div>
    </div>
  );
}

export default App;
