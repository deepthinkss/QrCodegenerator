import React, { useState } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { generateQRCode, downloadQRCode } from '../utils/qrCode';
import { isValidUrl } from '../utils/urlShortener';
import { QRCodeData } from '../types';

interface QRCodeGeneratorProps {
  qrCodes: QRCodeData[];
  onQRCodeGenerated: (qrCode: QRCodeData) => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  qrCodes,
  onQRCodeGenerated
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Please enter text or URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const qrCodeDataUrl = await generateQRCode(inputText.trim());
      
      const newQRCode: QRCodeData = {
        url: inputText.trim(),
        qrCodeDataUrl,
        createdAt: new Date()
      };

      onQRCodeGenerated(newQRCode);
      setInputText('');
    } catch (err) {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (dataUrl: string, url: string) => {
    const filename = `qrcode-${Date.now()}.png`;
    downloadQRCode(dataUrl, filename);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <QrCode className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text, URL, or any content for QR code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              rows={3}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap h-fit"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Generate QR'
            )}
          </button>
        </div>
      </form>

      {qrCodes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated QR Codes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qrCodes.map((qrCode, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                    <img
                      src={qrCode.qrCodeDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  
                  <div className="w-full">
                    <p className="text-sm text-gray-600 mb-2">Content:</p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                      <p className="text-gray-900 break-all text-sm">{qrCode.url}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleDownload(qrCode.qrCodeDataUrl, qrCode.url)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(qrCode.url)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copiedUrl === qrCode.url ? (
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
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Created: {qrCode.createdAt.toLocaleDateString()}
                    </p>
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