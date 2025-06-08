import React, { useState } from 'react';
import { QrCode, Download, Copy, Check, Settings, Palette } from 'lucide-react';
import { generateQRCode, downloadQRCode, getQRCodeSizeOptions, getErrorCorrectionOptions, defaultQRCustomization } from '../utils/qrCode';
import { QRCodeData, QRCodeCustomization } from '../types';

interface QRCodeGeneratorProps {
  qrCodes: QRCodeData[];
  onQRCodeGenerated: (qrCode: QRCodeData) => void;
  onQRCodeScanned: (id: string) => void;
  darkMode: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  qrCodes,
  onQRCodeGenerated,
  onQRCodeScanned,
  darkMode
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<QRCodeCustomization>(defaultQRCustomization);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Please enter text or URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const qrCodeDataUrl = await generateQRCode(inputText.trim(), customization);
      
      const newQRCode: QRCodeData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: inputText.trim(),
        qrCodeDataUrl,
        createdAt: new Date(),
        scanCount: 0,
        customization: { ...customization }
      };

      onQRCodeGenerated(newQRCode);
      setInputText('');
    } catch (err) {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (qrCode: QRCodeData) => {
    const filename = `qrcode-${qrCode.id}.png`;
    downloadQRCode(qrCode.qrCodeDataUrl, filename);
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

  const simulateScan = (id: string) => {
    onQRCodeScanned(id);
  };

  const updateCustomization = (updates: Partial<QRCodeCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-8">
      {/* QR Code Generator Form */}
      <div className={`rounded-2xl shadow-lg border p-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <QrCode className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>QR Code Generator</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Text Input */}
          <div>
            <label htmlFor="qr-text" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Content for QR Code *
            </label>
            <textarea
              id="qr-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text, URL, or any content for QR code..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none duration-300 ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white'
              }`}
              rows={3}
              required
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Customization Toggle */}
          <button
            type="button"
            onClick={() => setShowCustomization(!showCustomization)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            {showCustomization ? 'Hide' : 'Show'} Customization Options
          </button>

          {/* Customization Options */}
          {showCustomization && (
            <div className={`space-y-4 p-4 rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-purple-900/20 border-purple-700' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-purple-600" />
                <h3 className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>QR Code Customization</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Size */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Size
                  </label>
                  <select
                    value={customization.size}
                    onChange={(e) => updateCustomization({ size: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {getQRCodeSizeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error Correction */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Error Correction
                  </label>
                  <select
                    value={customization.errorCorrectionLevel}
                    onChange={(e) => updateCustomization({ errorCorrectionLevel: e.target.value as any })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {getErrorCorrectionOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Foreground Color */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customization.foregroundColor}
                      onChange={(e) => updateCustomization({ foregroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customization.foregroundColor}
                      onChange={(e) => updateCustomization({ foregroundColor: e.target.value })}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="#1F2937"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customization.backgroundColor}
                      onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customization.backgroundColor}
                      onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Margin: {customization.margin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={customization.margin}
                  onChange={(e) => updateCustomization({ margin: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating QR Code...
              </>
            ) : (
              'Generate QR Code'
            )}
          </button>
        </form>
      </div>

      {/* Generated QR Codes */}
      {qrCodes.length > 0 && (
        <div className={`rounded-2xl shadow-lg border p-8 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Generated QR Codes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qrCode) => (
              <div
                key={qrCode.id}
                className={`border rounded-lg p-6 hover:shadow-md transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700/50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center">
                  {/* QR Code Image */}
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                    <img
                      src={qrCode.qrCodeDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="w-full">
                    <p className={`text-sm mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Content:</p>
                    <div className={`rounded-lg p-3 border mb-4 transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`break-all text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{qrCode.url}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className={`flex items-center justify-between text-xs mb-4 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>{qrCode.scanCount} scans</span>
                      <span>{qrCode.createdAt.toLocaleDateString()}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(qrCode)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        
                        <button
                          onClick={() => copyToClipboard(qrCode.url, qrCode.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {copiedId === qrCode.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => simulateScan(qrCode.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        Simulate Scan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};