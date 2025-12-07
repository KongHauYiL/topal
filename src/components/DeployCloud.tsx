import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Loader2, Search, Sparkles } from 'lucide-react';
import { supabase, type TopalSite } from '../lib/supabase';
import { getOwnerId } from '../lib/ownerId';
import { VALID_TLDS, validateDomain } from '../lib/tlds';
import { Modal } from './Modal';
import { SiteCard } from './SiteCard';

interface DeployCloudProps {
  onNavigate: (url: string) => void;
}

export function DeployCloud({ onNavigate }: DeployCloudProps) {
  const [sites, setSites] = useState<TopalSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      setIsModalOpen(false);
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

  const filteredSites = sites.filter(site =>
    site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.full_domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deploys..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              Add New Deploy
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-24">
              <Sparkles className="w-20 h-20 mx-auto mb-6 text-gray-700" />
              <h2 className="text-3xl font-bold text-white mb-3">
                {searchQuery ? 'No sites found' : 'Deploy your first TopalSite today!'}
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create and share your web presence on the Topal network'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-6 h-6" />
                  Deploy Your First Site
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSites.map((site) => (
                <SiteCard
                  key={site.id}
                  title={site.title}
                  domain={site.full_domain}
                  htmlContent={site.html_content}
                  createdAt={site.created_at}
                  onNavigate={() => onNavigate(site.full_domain)}
                  onDelete={() => handleDelete(site.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="w-full py-6 text-center border-t border-gray-800">
        <p className="text-gray-500 font-medium">Topal.</p>
      </footer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        title="Deploy New Site"
      >
        <form onSubmit={handleDeploy} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domain Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                placeholder="mysite"
                className="flex-1 px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              <select
                value={selectedTLD}
                onChange={(e) => setSelectedTLD(e.target.value)}
                className="px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {VALID_TLDS.map(tld => (
                  <option key={tld} value={tld}>{tld}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Site"
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              HTML Content
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <title>My Site</title>&#10;</head>&#10;<body>&#10;  <h1>Hello World!</h1>&#10;</body>&#10;</html>"
              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-80 placeholder-gray-500 resize-none"
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
      </Modal>
    </div>
  );
}
