import QRCode from 'qrcode';
import { QRCodeCustomization } from '../types';

export const defaultQRCustomization: QRCodeCustomization = {
  size: 256,
  errorCorrectionLevel: 'M',
  foregroundColor: '#1F2937',
  backgroundColor: '#FFFFFF',
  margin: 2
};

export const generateQRCode = async (
  text: string, 
  customization: Partial<QRCodeCustomization> = {}
): Promise<string> => {
  const config = { ...defaultQRCustomization, ...customization };
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: config.size,
      margin: config.margin,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor
      },
      errorCorrectionLevel: config.errorCorrectionLevel
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const downloadQRCode = (dataUrl: string, filename: string = 'qrcode.png'): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getQRCodeSizeOptions = () => [
  { value: 128, label: 'Small (128px)' },
  { value: 256, label: 'Medium (256px)' },
  { value: 512, label: 'Large (512px)' },
  { value: 1024, label: 'Extra Large (1024px)' }
];

export const getErrorCorrectionOptions = () => [
  { value: 'L', label: 'Low (~7%)', description: 'Good for clean environments' },
  { value: 'M', label: 'Medium (~15%)', description: 'Recommended for most uses' },
  { value: 'Q', label: 'Quartile (~25%)', description: 'Good for outdoor use' },
  { value: 'H', label: 'High (~30%)', description: 'Best for damaged surfaces' }
];