export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  createdAt: Date;
  clickCount: number;
}

export interface QRCodeData {
  url: string;
  qrCodeDataUrl: string;
  createdAt: Date;
}