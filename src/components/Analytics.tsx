import React from 'react';
import { BarChart3, TrendingUp, QrCode, Link, Activity, Calendar } from 'lucide-react';
import { AnalyticsData } from '../types';
import { formatClickCount } from '../utils/urlShortener';
import { formatActivityType, getActivityIcon } from '../utils/analytics';

interface AnalyticsProps {
  analytics: AnalyticsData;
}

export const Analytics: React.FC<AnalyticsProps> = ({ analytics }) => {
  const totalEngagement = analytics.totalClicks + analytics.totalQRScans;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total URLs</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUrls}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Link className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{formatClickCount(analytics.totalClicks)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">QR Scans</p>
              <p className="text-2xl font-bold text-gray-900">{formatClickCount(analytics.totalQRScans)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{formatClickCount(totalEngagement)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing URLs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Top Performing URLs</h3>
          </div>

          {analytics.topUrls.length > 0 ? (
            <div className="space-y-4">
              {analytics.topUrls.map((url, index) => {
                const totalEngagement = url.clickCount + url.qrCodeScans;
                return (
                  <div key={url.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {url.description || url.originalUrl}
                      </p>
                      <p className="text-xs text-gray-500">{url.shortUrl}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatClickCount(totalEngagement)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatClickCount(url.clickCount)} clicks, {formatClickCount(url.qrCodeScans)} scans
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No data available yet</p>
              <p className="text-sm text-gray-400">Create some URLs to see analytics</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>

          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 text-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatActivityType(activity.type)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity yet</p>
              <p className="text-sm text-gray-400">Start creating and using URLs to see activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Breakdown */}
      {totalEngagement > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Engagement Breakdown</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">URL Clicks</span>
                <span className="text-sm text-gray-600">
                  {((analytics.totalClicks / totalEngagement) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analytics.totalClicks / totalEngagement) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatClickCount(analytics.totalClicks)} total clicks
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">QR Code Scans</span>
                <span className="text-sm text-gray-600">
                  {((analytics.totalQRScans / totalEngagement) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analytics.totalQRScans / totalEngagement) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatClickCount(analytics.totalQRScans)} total scans
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};