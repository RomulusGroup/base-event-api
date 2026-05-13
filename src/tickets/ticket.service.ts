import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketService {
  constructor(private configService: ConfigService) {}


  generateTicketNumber(prefix: string = 'BASE'): string {
    const year = new Date().getFullYear();
    const shortUuid = uuidv4().split('-')[0].toUpperCase();
    return `${prefix}-${year}-${shortUuid}`;
  }


  async generateQrCodeBuffer(ticketNumber: string): Promise<Buffer> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://basesports.io';
      const verificationUrl = `${frontendUrl}/verify?ticket=${ticketNumber}`;
      
      return await QRCode.toBuffer(verificationUrl, {
        margin: 2,
        width: 400,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        }
      });
    } catch (err) {
      console.error('QR Code generation failed', err);
      throw new Error('Could not generate QR code');
    }
  }


  async generateQrCode(ticketNumber: string): Promise<string> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://basesports.io';
      const verificationUrl = `${frontendUrl}/verify?ticket=${ticketNumber}`;
      
      return await QRCode.toDataURL(verificationUrl, {
        margin: 2,
        width: 400,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        }
      });
    } catch (err) {
      console.error('QR Code generation failed', err);
      throw new Error('Could not generate QR code');
    }
  }
}
