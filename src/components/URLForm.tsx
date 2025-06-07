import React, { useState } from 'react';
import { Link, AlertTriangle, Calendar, Tag, FileText } from 'lucide-react';
import { validateUrl, sanitizeUrl } from '../utils/urlValidator';
import { isCustomAliasAvailable } from '../utils/urlShortener';
import { ShortenedUrl } from '../types';

interface URLFormProps {
  onSubmit: (data: URLFormData) => void;
  isLoading: boolean;
  existingUrls: ShortenedUrl[];
}

export interface URLFormData {
  url: string;
  customAlias?: string;
  expirationDays?: number;
  description?: string;
  tags?: string[];
}

export const URLForm: React.FC<URLFormProps> = ({ onSubmit, isLoading, existingUrls }) => {
  const [formData, setFormData] = useState<URLFormData>({
    url: '',
    customAlias: '',
    expirationDays: undefined,
    description: '',
    tags: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

    // Validate URL
    const urlValidation = validateUrl(formData.url);
    if (!urlValidation.isValid) {
      newErrors.url = urlValidation.error || 'Invalid URL';
    } else if (!urlValidation.isSafe) {
      newWarnings.url = urlValidation.error || 'This URL may be suspicious';
    }

    // Validate custom alias
    if (formData.customAlias) {
      if (!isCustomAliasAvailable(formData.customAlias, existingUrls)) {
        newErrors.customAlias = 'This alias is already taken';
      }
    }

    // Validate expiration
    if (formData.expirationDays && formData.expirationDays < 1) {
      newErrors.expirationDays = 'Expiration must be at least 1 day';
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const sanitizedData = {
      ...formData,
      url: sanitizeUrl(formData.url),
      customAlias: formData.customAlias?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      tags: formData.tags?.filter(tag => tag.trim().length > 0) || []
    };

    onSubmit(sanitizedData);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Link className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create Short Link</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Long URL *
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com/very-long-url-that-needs-shortening"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.url ? 'border-red-300' : warnings.url ? 'border-yellow-300' : 'border-gray-300'
            }`}
            required
          />
          {errors.url && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {errors.url}
            </p>
          )}
          {warnings.url && !errors.url && (
            <p className="text-yellow-600 text-sm mt-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {warnings.url}
            </p>
          )}
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* Custom Alias */}
            <div>
              <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Alias (Optional)
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-2">lnkf.ge/</span>
                <input
                  type="text"
                  id="customAlias"
                  value={formData.customAlias}
                  onChange={(e) => setFormData(prev => ({ ...prev, customAlias: e.target.value }))}
                  placeholder="my-custom-link"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.customAlias ? 'border-red-300' : 'border-gray-300'
                  }`}
                  pattern="[a-zA-Z0-9_-]+"
                  minLength={3}
                  maxLength={20}
                />
              </div>
              {errors.customAlias && (
                <p className="text-red-500 text-sm mt-1">{errors.customAlias}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>

            {/* Expiration */}
            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expiration (Optional)
              </label>
              <select
                id="expiration"
                value={formData.expirationDays || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expirationDays: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Never expires</option>
                <option value="1">1 day</option>
                <option value="7">1 week</option>
                <option value="30">1 month</option>
                <option value="90">3 months</option>
                <option value="365">1 year</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this link"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                maxLength={100}
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="marketing, campaign, social-media"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-gray-500 text-xs mt-1">
                Separate tags with commas
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Short Link...
            </>
          ) : (
            'Create Short Link'
          )}
        </button>
      </form>
    </div>
  );
};