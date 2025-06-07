import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  QrCode, 
  BarChart3, 
  Calendar,
  Tag,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { ShortenedUrl } from '../types';
import { formatClickCount, isUrlExpired } from '../utils/urlShortener';

interface URLListProps {
  urls: ShortenedUrl[];
  onDelete: (id: string) => void;
  onGenerateQR: (url: ShortenedUrl) => void;
  onSimulateClick: (id: string) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export const URLList: React.FC<URLListProps> = ({
  urls,
  onDelete,
  onGenerateQR,
  onSimulateClick,
  copiedId,
  onCopy
}) => {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedUrls);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedUrls(newExpanded);
  };

  const filteredUrls = urls.filter(url => {
    switch (filter) {
      case 'active':
        return url.isActive && !isUrlExpired(url);
      case 'expired':
        return isUrlExpired(url) || !url.isActive;
      default:
        return true;
    }
  });

  if (urls.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <QrCode className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No URLs yet</h3>
        <p className="text-gray-600">Create your first short link to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Short Links</h3>
        
        {/* Filter Buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'expired', label: 'Expired' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredUrls.map((url) => {
          const isExpanded = expandedUrls.has(url.id);
          const expired = isUrlExpired(url);
          
          return (
            <div
              key={url.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                expired || !url.isActive 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Main Content */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status Indicators */}
                  <div className="flex items-center gap-2 mb-2">
                    {expired && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Expired
                      </span>
                    )}
                    {!url.isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                    {url.customAlias && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* URLs */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Original URL:</p>
                      <p className="text-gray-900 truncate text-sm">{url.originalUrl}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Short URL:</p>
                      <p className="text-blue-600 font-medium text-sm">{url.shortUrl}</p>
                    </div>
                  </div>

                  {/* Description and Tags */}
                  {(url.description || (url.tags && url.tags.length > 0)) && (
                    <div className="mt-3 space-y-2">
                      {url.description && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600">{url.description}</p>
                        </div>
                      )}
                      {url.tags && url.tags.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {url.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {formatClickCount(url.clickCount)} clicks
                    </span>
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      {formatClickCount(url.qrCodeScans)} QR scans
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {url.createdAt.toLocaleDateString()}
                    </span>
                    {url.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Expires: {url.expiresAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded(url.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isExpanded ? "Hide details" : "Show details"}
                  >
                    {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onCopy(url.shortUrl, url.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy short URL"
                  >
                    {copiedId === url.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Open original URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => onGenerateQR(url)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Generate QR code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSimulateClick(url.id)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Simulate click"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(url.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete URL"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">ID:</span> {url.id}</p>
                        <p><span className="font-medium">Short Code:</span> {url.shortCode}</p>
                        {url.customAlias && (
                          <p><span className="font-medium">Custom Alias:</span> {url.customAlias}</p>
                        )}
                        <p><span className="font-medium">Status:</span> {url.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Analytics</h4>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">Total Clicks:</span> {url.clickCount}</p>
                        <p><span className="font-medium">QR Scans:</span> {url.qrCodeScans}</p>
                        <p><span className="font-medium">Total Engagement:</span> {url.clickCount + url.qrCodeScans}</p>
                        <p><span className="font-medium">Created:</span> {url.createdAt.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUrls.length === 0 && urls.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No URLs match the current filter.</p>
        </div>
      )}
    </div>
  );
};