import { ShortenedUrl } from '../types';

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const BASE_URL = 'https://lnkf.ge';

export const generateShortCode = (url: string, customAlias?: string): string => {
  if (customAlias) {
    // Validate custom alias
    if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
      throw new Error('Custom alias can only contain letters, numbers, hyphens, and underscores');
    }
    if (customAlias.length < 3 || customAlias.length > 20) {
      throw new Error('Custom alias must be between 3 and 20 characters');
    }
    return customAlias;
  }

  // Generate hash-based short code
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Add timestamp for uniqueness
  hash += Date.now();
  
  let shortCode = '';
  let positiveHash = Math.abs(hash);
  
  for (let i = 0; i < 7; i++) {
    shortCode += CHARACTERS[positiveHash % CHARACTERS.length];
    positiveHash = Math.floor(positiveHash / CHARACTERS.length);
  }
  
  return shortCode;
};

export const createShortUrl = (shortCode: string): string => {
  return `${BASE_URL}/${shortCode}`;
};

export const isCustomAliasAvailable = (alias: string, existingUrls: ShortenedUrl[]): boolean => {
  return !existingUrls.some(url => url.shortCode === alias || url.customAlias === alias);
};

export const calculateExpiration = (days?: number): Date | undefined => {
  if (!days || days <= 0) return undefined;
  
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + days);
  return expiration;
};

export const isUrlExpired = (url: ShortenedUrl): boolean => {
  if (!url.expiresAt) return false;
  return new Date() > url.expiresAt;
};

export const formatClickCount = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};