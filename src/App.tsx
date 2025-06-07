import React, { useState } from 'react';
import { Zap, Github, Twitter } from 'lucide-react';
import { URLShortener } from './components/URLShortener';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { ShortenedUrl, QRCodeData } from './types';

function App() {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [activeTab, setActiveTab] = useState<'shortener' | 'qrcode'>('shortener');

  const handleUrlShortened = (url: ShortenedUrl) => {
    setShortenedUrls(prev => [url, ...prev]);
  };

  const handleDeleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
  };

  const handleQRCodeGenerated = (qrCode: QRCodeData) => {
    setQrCodes(prev => [qrCode, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinkForge
                </h1>
                <p className="text-xs text-gray-600">URL Shortener & QR Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Shorten URLs &{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Generate QR Codes
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform long URLs into short, shareable links and create beautiful QR codes 
            for any content. Fast, reliable, and completely free.
          </p>
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('shortener')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === 'shortener'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                URL Shortener
              </button>
              <button
                onClick={() => setActiveTab('qrcode')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === 'qrcode'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                QR Generator
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'shortener' ? (
            <URLShortener
              onUrlShortened={handleUrlShortened}
              shortenedUrls={shortenedUrls}
              onDeleteUrl={handleDeleteUrl}
            />
          ) : (
            <QRCodeGenerator
              qrCodes={qrCodes}
              onQRCodeGenerated={handleQRCodeGenerated}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">LinkForge</h3>
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate tool for URL shortening and QR code generation. 
                Fast, reliable, and designed for modern workflows.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>URL Shortening</li>
                <li>QR Code Generation</li>
                <li>Copy to Clipboard</li>
                <li>Download QR Codes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>API Documentation</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LinkForge. Built with React and modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;