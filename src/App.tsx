import React, { useState, useEffect } from 'react';
import { Zap, Github, Twitter, BarChart3, Settings, Trash2, Moon, Sun } from 'lucide-react';
import { URLForm, URLFormData } from './components/URLForm';
import { URLList } from './components/URLList';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { Analytics } from './components/Analytics';
import { ShortenedUrl, QRCodeData, ActivityLog } from './types';
import { generateShortCode, createShortUrl, calculateExpiration } from './utils/urlShortener';
import { generateQRCode } from './utils/qrCode';
import { validateUrl } from './utils/urlValidator';
import { generateAnalytics, simulateClick, simulateQRScan, createActivityLog } from './utils/analytics';
import { saveUrls, loadUrls, saveActivities, loadActivities, clearAllData } from './utils/storage';

function App() {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'shortener' | 'qrcode' | 'analytics'>('shortener');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUrls = loadUrls();
    const savedActivities = loadActivities();
    const savedDarkMode = localStorage.getItem('snaplink_darkmode') === 'true';
    setShortenedUrls(savedUrls);
    setActivities(savedActivities);
    setDarkMode(savedDarkMode);
    
    // Apply dark mode class to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    saveUrls(shortenedUrls);
  }, [shortenedUrls]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('snaplink_darkmode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleUrlShortened = async (formData: URLFormData) => {
    setIsLoading(true);

    try {
      // Validate URL
      const validation = validateUrl(formData.url);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const shortCode = generateShortCode(validation.normalizedUrl!, formData.customAlias);
      const shortUrl = createShortUrl(shortCode);
      const expiresAt = calculateExpiration(formData.expirationDays);

      const newShortenedUrl: ShortenedUrl = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        originalUrl: validation.normalizedUrl!,
        shortUrl,
        shortCode,
        customAlias: formData.customAlias,
        createdAt: new Date(),
        expiresAt,
        clickCount: 0,
        qrCodeScans: 0,
        isActive: true,
        tags: formData.tags,
        description: formData.description
      };

      setShortenedUrls(prev => [newShortenedUrl, ...prev]);

      // Add activity log
      const activity = createActivityLog(
        'url_created',
        `Created short link: ${shortUrl}`,
        newShortenedUrl.id
      );
      setActivities(prev => [activity, ...prev]);

    } catch (error) {
      console.error('Error shortening URL:', error);
      alert(error instanceof Error ? error.message : 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
  };

  const handleGenerateQR = async (url: ShortenedUrl) => {
    try {
      const qrCodeDataUrl = await generateQRCode(url.shortUrl);
      
      const newQRCode: QRCodeData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: url.shortUrl,
        qrCodeDataUrl,
        createdAt: new Date(),
        scanCount: 0,
        customization: {
          size: 256,
          errorCorrectionLevel: 'M',
          foregroundColor: '#1F2937',
          backgroundColor: '#FFFFFF',
          margin: 2
        }
      };

      setQrCodes(prev => [newQRCode, ...prev]);

      // Add activity log
      const activity = createActivityLog(
        'url_created',
        `Generated QR code for: ${url.shortUrl}`,
        url.id
      );
      setActivities(prev => [activity, ...prev]);

    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const handleQRCodeGenerated = (qrCode: QRCodeData) => {
    setQrCodes(prev => [qrCode, ...prev]);

    // Add activity log
    const activity = createActivityLog(
      'url_created',
      `Generated QR code for: ${qrCode.url}`
    );
    setActivities(prev => [activity, ...prev]);
  };

  const handleSimulateClick = (id: string) => {
    setShortenedUrls(prev => prev.map(url => {
      if (url.id === id) {
        const updatedUrl = simulateClick(url);
        
        // Add activity log
        const activity = createActivityLog(
          'url_clicked',
          `Clicked: ${url.shortUrl}`,
          url.id
        );
        setActivities(prevActivities => [activity, ...prevActivities]);
        
        return updatedUrl;
      }
      return url;
    }));
  };

  const handleQRCodeScanned = (qrCodeId: string) => {
    setQrCodes(prev => prev.map(qr => {
      if (qr.id === qrCodeId) {
        const updatedQR = { ...qr, scanCount: qr.scanCount + 1 };
        
        // Also update the corresponding URL if it exists
        setShortenedUrls(prevUrls => prevUrls.map(url => {
          if (url.shortUrl === qr.url) {
            const updatedUrl = simulateQRScan(url);
            
            // Add activity log
            const activity = createActivityLog(
              'qr_scanned',
              `QR code scanned: ${url.shortUrl}`,
              url.id
            );
            setActivities(prevActivities => [activity, ...prevActivities]);
            
            return updatedUrl;
          }
          return url;
        }));
        
        return updatedQR;
      }
      return qr;
    }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setShortenedUrls([]);
      setQrCodes([]);
      setActivities([]);
      clearAllData();
    }
  };

  const analytics = generateAnalytics(shortenedUrls, activities);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-10 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent`}>
                  SnapLink
                </h1>
                <p className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Professional URL Shortener & QR Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleClearAllData}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Clear all data"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
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
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Professional URL Management &{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              QR Code Generation
            </span>
          </h2>
          <p className={`text-xl mb-8 max-w-3xl mx-auto transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Create short, secure links with custom aliases, expiration dates, and comprehensive analytics. 
            Generate beautiful QR codes with full customization options. Built for professionals who demand the best.
          </p>
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-center mb-8">
            <div className={`rounded-full p-1 shadow-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setActiveTab('shortener')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === 'shortener'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                URL Shortener
              </button>
              <button
                onClick={() => setActiveTab('qrcode')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === 'qrcode'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                QR Generator
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'shortener' && (
            <div className="space-y-8">
              <URLForm
                onSubmit={handleUrlShortened}
                isLoading={isLoading}
                existingUrls={shortenedUrls}
                darkMode={darkMode}
              />
              <URLList
                urls={shortenedUrls}
                onDelete={handleDeleteUrl}
                onGenerateQR={handleGenerateQR}
                onSimulateClick={handleSimulateClick}
                copiedId={copiedId}
                onCopy={copyToClipboard}
                darkMode={darkMode}
              />
            </div>
          )}

          {activeTab === 'qrcode' && (
            <QRCodeGenerator
              qrCodes={qrCodes}
              onQRCodeGenerated={handleQRCodeGenerated}
              onQRCodeScanned={handleQRCodeScanned}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics analytics={analytics} darkMode={darkMode} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">SnapLink</h3>
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate professional tool for URL shortening, QR code generation, and link analytics. 
                Built with security, performance, and user experience in mind.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Custom URL Aliases</li>
                <li>Expiration Dates</li>
                <li>QR Code Customization</li>
                <li>Comprehensive Analytics</li>
                <li>Security Validation</li>
                <li>Dark Mode Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-gray-400">
                <li>URL Validation</li>
                <li>Malicious Link Detection</li>
                <li>HTTPS Enforcement</li>
                <li>Input Sanitization</li>
                <li>Rate Limiting</li>
                <li>Privacy Protection</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SnapLink. Built with React, TypeScript, and modern security practices.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;