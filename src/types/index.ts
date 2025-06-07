export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  customAlias?: string;
  createdAt: Date;
  expiresAt?: Date;
  clickCount: number;
  qrCodeScans: number;
  isActive: boolean;
  tags?: string[];
  description?: string;
}

export interface QRCodeData {
  id: string;
  url: string;
  qrCodeDataUrl: string;
  createdAt: Date;
  scanCount: number;
  customization: QRCodeCustomization;
}

export interface QRCodeCustomization {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
}

export interface AnalyticsData {
  totalUrls: number;
  totalClicks: number;
  totalQRScans: number;
  recentActivity: ActivityLog[];
  topUrls: ShortenedUrl[];
}

export interface ActivityLog {
  id: string;
  type: 'url_created' | 'url_clicked' | 'qr_scanned';
  timestamp: Date;
  details: string;
  urlId?: string;
}

export interface URLValidationResult {
  isValid: boolean;
  isSafe: boolean;
  error?: string;
  normalizedUrl?: string;
}