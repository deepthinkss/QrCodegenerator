import React, { useState } from 'react';
import { Link, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import { ShortenedUrl } from '../types';
import { generateShortCode, isValidUrl, createShortUrl } from '../utils/urlShortener';

interface URLShortenerProps {
  onUrlShortened: (url: ShortenedUrl) => void;
  shortenedUrls: ShortenedUrl[];
  onDeleteUrl: (id: string) => void;
}

export const URLShortener: React.FC<URLShortenerProps> = ({
  onUrlShortened,
  shortenedUrls,
  onDeleteUrl
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(inputUrl.trim())) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const shortCode = generateShortCode(inputUrl.trim());
      const shortUrl = createShortUrl(shortCode);
      
      const newShortenedUrl: ShortenedUrl = {
        id: Date.now().toString(),
        originalUrl: inputUrl.trim(),
        shortUrl,
        shortCode,
        createdAt: new Date(),
        clickCount: 0
      };

      onUrlShortened(newShortenedUrl);
      setInputUrl('');
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Link className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">URL Shortener</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Shortening...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </div>
      </form>

      {shortenedUrls.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Shortened URLs</h3>
          <div className="space-y-4">
            {shortenedUrls.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">Original URL:</p>
                    <p className="text-gray-900 truncate mb-2">{item.originalUrl}</p>
                    <p className="text-sm text-gray-600 mb-1">Short URL:</p>
                    <p className="text-blue-600 font-medium">{item.shortUrl}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(item.shortUrl, item.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy short URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Open original URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <button
                      onClick={() => onDeleteUrl(item.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>Created: {item.createdAt.toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Code: {item.shortCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};