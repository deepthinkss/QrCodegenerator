import { ShortenedUrl, ActivityLog } from '../types';

const STORAGE_KEYS = {
  URLS: 'linkforge_urls',
  ACTIVITIES: 'linkforge_activities'
};

export const saveUrls = (urls: ShortenedUrl[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.URLS, JSON.stringify(urls));
  } catch (error) {
    console.error('Failed to save URLs to localStorage:', error);
  }
};

export const loadUrls = (): ShortenedUrl[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.URLS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((url: any) => ({
      ...url,
      createdAt: new Date(url.createdAt),
      expiresAt: url.expiresAt ? new Date(url.expiresAt) : undefined
    }));
  } catch (error) {
    console.error('Failed to load URLs from localStorage:', error);
    return [];
  }
};

export const saveActivities = (activities: ActivityLog[]): void => {
  try {
    // Keep only last 100 activities to prevent storage bloat
    const limitedActivities = activities.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(limitedActivities));
  } catch (error) {
    console.error('Failed to save activities to localStorage:', error);
  }
};

export const loadActivities = (): ActivityLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load activities from localStorage:', error);
    return [];
  }
};

export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.URLS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error);
  }
};