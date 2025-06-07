export const generateShortCode = (url: string): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let hash = 0;
  
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  let shortCode = '';
  let positiveHash = Math.abs(hash);
  
  for (let i = 0; i < 6; i++) {
    shortCode += chars[positiveHash % chars.length];
    positiveHash = Math.floor(positiveHash / chars.length);
  }
  
  return shortCode;
};

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const createShortUrl = (shortCode: string): string => {
  return `https://short.ly/${shortCode}`;
};