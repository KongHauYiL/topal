import { useState, useEffect, type FormEvent } from 'react';
import { Globe, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase, type TopalSite } from '../lib/supabase';
import { getOwnerId } from '../lib/ownerId';
import { VALID_TLDS, validateDomain } from '../lib/tlds';

interface DeployCloudProps {
  onNavigate: (url: string) => void;
}

export function DeployCloud({ onNavigate }: DeployCloudProps) {
  const [sites, setSites] = useState<TopalSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [domain, setDomain] = useState('');
  const [selectedTLD, setSelectedTLD] = useState('.topal');
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState('');
  const ownerId = getOwnerId();

  useEffect(() => {
    loadMySites();
  }, []);

  const loadMySites = async () => {
    try {
      const { data, error } = await supabase
        .from('topal_sites')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (err) {
      console.error('Error loading sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!domain || !title || !htmlContent) {
      setError('All fields are required');
      return;
    }

    const validation = validateDomain(domain);
    if (!validation.valid) {
      setError(validation.error || 'Invalid domain');
      return;
    }

    setDeploying(true);

    try {
      const { error: deployError } = await supabase
        .from('topal_sites')
        .insert({
          domain: domain.toLowerCase(),
          tld: selectedTLD,
          title,
          html_content: htmlContent,
          owner_id: ownerId
        });

      if (deployError) {
        if (deployError.code === '23505') {
          setError('This domain is already taken');
        } else {
          throw deployError;
        }
        return;
      }

      setDomain('');
      setTitle('');
      setHtmlContent('');
      await loadMySites();
    } catch (err) {
      setError('Failed to deploy site');
      console.error('Deploy error:', err);
    } finally {
      setDeploying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;

    try {
      const { error } = await supabase
        .from('topal_sites')
        .delete()
        .eq('id', id)
        .eq('owner_id', ownerId);

      if (error) throw error;
      await loadMySites();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="w-full bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Deploy Cloud
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-400">
            Deploy your sites to the Topal web
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 pb-8">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              Deploy New Site
            </h2>

            <form onSubmit={handleDeploy} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Domain Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                    placeholder="mysite"
                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base placeholder-gray-500"
                  />
                  <select
                    value={selectedTLD}
                    onChange={(e) => setSelectedTLD(e.target.value)}
                    className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {VALID_TLDS.map(tld => (
                      <option key={tld} value={tld}>{tld}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Site Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Site"
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  HTML Content
                </label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <title>My Site</title>&#10;</head>&#10;<body>&#10;  <h1>Hello World!</h1>&#10;</body>&#10;</html>"
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm h-48 sm:h-64 placeholder-gray-500"
                />
              </div>

              {error && (
                <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={deploying}
                className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {deploying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Deploy Site
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              My Sites
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : sites.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Globe className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm sm:text-base">No sites deployed yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="border border-gray-700 rounded-lg p-3 sm:p-4 hover:border-blue-500 transition-colors bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 text-sm sm:text-base truncate">
                          {site.title}
                        </h3>
                        <button
                          onClick={() => onNavigate(site.full_domain)}
                          className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm break-all text-left"
                        >
                          {site.full_domain}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 sm:p-2 hover:bg-red-950 rounded transition-colors flex-shrink-0"
                        title="Delete site"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Deployed {new Date(site.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
