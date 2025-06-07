import { ShortenedUrl, AnalyticsData, ActivityLog } from '../types';

export const generateAnalytics = (urls: ShortenedUrl[], activities: ActivityLog[]): AnalyticsData => {
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
  const totalQRScans = urls.reduce((sum, url) => sum + url.qrCodeScans, 0);
  
  // Get recent activity (last 10 items)
  const recentActivity = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);
  
  // Get top URLs by total engagement (clicks + QR scans)
  const topUrls = urls
    .map(url => ({
      ...url,
      totalEngagement: url.clickCount + url.qrCodeScans
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5);

  return {
    totalUrls,
    totalClicks,
    totalQRScans,
    recentActivity,
    topUrls
  };
};

export const simulateClick = (url: ShortenedUrl): ShortenedUrl => {
  return {
    ...url,
    clickCount: url.clickCount + 1
  };
};

export const simulateQRScan = (url: ShortenedUrl): ShortenedUrl => {
  return {
    ...url,
    qrCodeScans: url.qrCodeScans + 1
  };
};

export const createActivityLog = (
  type: ActivityLog['type'],
  details: string,
  urlId?: string
): ActivityLog => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    timestamp: new Date(),
    details,
    urlId
  };
};

export const formatActivityType = (type: ActivityLog['type']): string => {
  switch (type) {
    case 'url_created':
      return 'URL Created';
    case 'url_clicked':
      return 'URL Clicked';
    case 'qr_scanned':
      return 'QR Code Scanned';
    default:
      return 'Unknown';
  }
};

export const getActivityIcon = (type: ActivityLog['type']): string => {
  switch (type) {
    case 'url_created':
      return '🔗';
    case 'url_clicked':
      return '👆';
    case 'qr_scanned':
      return '📱';
    default:
      return '❓';
  }
};