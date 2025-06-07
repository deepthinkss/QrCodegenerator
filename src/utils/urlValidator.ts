import { URLValidationResult } from '../types';

const MALICIOUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
  /ftp:/i,
];

const SUSPICIOUS_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'short.link',
  'ow.ly',
  't.co'
];

export const validateUrl = (url: string): URLValidationResult => {
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      isSafe: false,
      error: 'URL cannot be empty'
    };
  }

  const trimmedUrl = url.trim();

  // Check for malicious patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      return {
        isValid: false,
        isSafe: false,
        error: 'URL contains potentially malicious content'
      };
    }
  }

  try {
    // Add protocol if missing
    let normalizedUrl = trimmedUrl;
    if (!trimmedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${trimmedUrl}`;
    }

    const urlObj = new URL(normalizedUrl);
    
    // Check if protocol is allowed
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        isSafe: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      };
    }

    // Check for suspicious domains (warn but allow)
    const isSuspicious = SUSPICIOUS_DOMAINS.some(domain => 
      urlObj.hostname.toLowerCase().includes(domain)
    );

    return {
      isValid: true,
      isSafe: !isSuspicious,
      normalizedUrl,
      error: isSuspicious ? 'This appears to be a shortened URL. Consider using the original URL instead.' : undefined
    };
  } catch (error) {
    return {
      isValid: false,
      isSafe: false,
      error: 'Invalid URL format'
    };
  }
};

export const sanitizeUrl = (url: string): string => {
  return url.trim().replace(/[<>'"]/g, '');
};